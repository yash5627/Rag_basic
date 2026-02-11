import argparse
import json
import os
import shutil
import time
import sys
import faiss
import joblib
import numpy as np
import torch

from mp3_to_json import transcribe_audio
from preProcessJson import create_embeddings_from_json
from video_to_mp3 import convert_videos_to_audio
from store_embeddings import store_embeddings


def merge_chunks(input_dir, output_dir, merge_size):
    os.makedirs(output_dir, exist_ok=True)
    for filename in os.listdir(input_dir):
        if not filename.endswith(".json"):
            continue

        file_path = os.path.join(input_dir, filename)
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        chunks = data.get("chunks", [])
        merged_chunks = []

        for i in range(0, len(chunks), merge_size):
            group = chunks[i:i + merge_size]
            if not group:
                continue

            merged_chunks.append({
                "title": group[0]["title"],
                "Number": group[0]["Number"],
                "start": group[0]["start"],
                "end": group[-1]["end"],
                "text": " ".join(segment["text"] for segment in group)
            })

        data_improved = {
            "chunks": merged_chunks,
            "text": data.get("text", "")
        }

        with open(os.path.join(output_dir, filename), "w", encoding="utf-8") as f:
            json.dump(data_improved, f, indent=4)


def build_faiss_index(embeddings_path, index_path):
    df = joblib.load(embeddings_path)
    embeddings = np.vstack(df["embedding"].values).astype("float32")
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)
    faiss.write_index(index, index_path)


def emit_progress(step, step_index, total_steps, start_time):
    elapsed = time.perf_counter() - start_time
    eta_seconds = None
    if step_index:
        average_per_step = elapsed / step_index
        eta_seconds = max(0.0, average_per_step * (total_steps - step_index))
    payload = {
        "type": "progress",
        "step": step,
        "progress": round(step_index / total_steps, 3) if total_steps else 1.0,
        "elapsed_seconds": round(elapsed, 1),
        "eta_seconds": round(eta_seconds, 1) if eta_seconds is not None else None,
    }
    print(json.dumps(payload), flush=True)

def emit_error(message):
    print(json.dumps({"type": "error", "message": message}), flush=True)


def cleanup_dirs(*dirs):
    for target_dir in dirs:
        if not target_dir or not os.path.exists(target_dir):
            continue
        shutil.rmtree(target_dir, ignore_errors=True)



def cleanup_dir(target_dir):
    if not target_dir or not os.path.exists(target_dir):
        return
    shutil.rmtree(target_dir, ignore_errors=True)


def run_pipeline(args):
    resolved_device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")
    steps = [
        ("video_to_audio", lambda: convert_videos_to_audio(args.video_dir, args.audio_dir, args.overwrite_audio)),
        ("cleanup_video", lambda: cleanup_dir(args.video_dir)),
        (
            "transcribe",
            lambda: transcribe_audio(
                audio_dir=args.audio_dir,
                output_dir=args.json_dir,
                model_name=args.model,
                device=resolved_device,
                translate=args.translate,
                video_title=args.video_title or None,
                video_number=args.video_number or None,
                language=args.language or None,                
            ),
        ),
    ]
    if args.merge_size > 1:
        steps.append(
            ("merge_chunks", lambda: merge_chunks(args.json_dir, args.improved_json_dir, args.merge_size))
        )
        embeddings_dir = args.improved_json_dir
    else:
        embeddings_dir = args.json_dir

    steps.extend(
        [
            ("create_embeddings", lambda: create_embeddings_from_json(embeddings_dir, args.embeddings_output)),
            ("build_faiss", lambda: build_faiss_index(args.embeddings_output, args.faiss_output)),
        ]
    )
    if args.mongo_uri:
         steps.append(
            (
                "store_embeddings",
                lambda: store_embeddings(
                    embeddings_path=args.embeddings_output,
                    mongo_uri=args.mongo_uri,
                    mongo_db=args.mongo_db,
                    mongo_collection=args.mongo_collection,
                    video_title=args.video_title,
                    video_number=args.video_number,
                    course_name=args.course_name,
                    merged_json_dir=embeddings_dir,
                    merged_json_collection=args.merged_json_collection,
                ),
            )


         )
    steps.append(("cleanup_audio", lambda: cleanup_dir(args.audio_dir)))
    if args.cleanup:
        steps.append(("cleanup", lambda: cleanup_dirs(args.json_dir, args.improved_json_dir)))

    total_steps = len(steps)
    start_time = time.perf_counter()
    emit_progress("starting", 0, total_steps, start_time)

    for step_index, (step_name, step_fn) in enumerate(steps, start=1):
        step_fn()
        emit_progress(step_name, step_index, total_steps, start_time)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Process videos into embeddings with timestamps."
    )
    parser.add_argument("--video-dir", default="Videos", help="Input video directory.")
    parser.add_argument("--audio-dir", default="audio", help="Output audio directory.")
    parser.add_argument("--json-dir", default="jsons", help="Output JSON directory.")
    parser.add_argument("--improved-json-dir", default="new_jsons", help="Merged JSON directory.")
    parser.add_argument("--merge-size", type=int, default=5, help="Merge N segments per chunk.")
    parser.add_argument("--model", default="small", help="Whisper model name.")
    parser.add_argument("--device", default=None, help="Force device: cpu or cuda.")
    parser.add_argument("--translate", action="store_true", help="Translate audio to English.")
    parser.add_argument("--language", default="", help="Force transcription language (e.g., en).")
    parser.add_argument("--embeddings-output", default="embeddings.joblib", help="Embeddings output.")
    parser.add_argument("--faiss-output", default="faiss_index.bin", help="FAISS index output.")
    parser.add_argument("--overwrite-audio", action="store_true", help="Overwrite audio files.")
    parser.add_argument("--video-title", default="", help="Video title metadata override.")
    parser.add_argument("--video-number", default="", help="Video number metadata override.")
    parser.add_argument("--course-name", default="", help="Course name metadata.")
    parser.add_argument("--mongo-uri", default="", help="MongoDB connection string.")
    parser.add_argument("--mongo-db", default="rag_basic", help="MongoDB database name.")
    parser.add_argument("--mongo-collection", default="video_embeddings", help="MongoDB collection name.")
    parser.add_argument(
        "--merged-json-collection",
        default="course_jsons",
        help="Collection where merged json contents are stored.",
    )
    parser.add_argument("--cleanup", action="store_true", help="Delete intermediate json folders after processing.")
    args = parser.parse_args()
    try:
        run_pipeline(args)
    except Exception as exc:
        emit_error(str(exc))
        sys.exit(1)