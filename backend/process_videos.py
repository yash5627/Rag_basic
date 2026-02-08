import argparse
import json
import os

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


def run_pipeline(args):
    resolved_device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")
    convert_videos_to_audio(args.video_dir, args.audio_dir, args.overwrite_audio)

    transcribe_audio(
        audio_dir=args.audio_dir,
        output_dir=args.json_dir,
        model_name=args.model,
        device=resolved_device,
        translate=args.translate
    )

    if args.merge_size > 1:
        merge_chunks(args.json_dir, args.improved_json_dir, args.merge_size)
        embeddings_dir = args.improved_json_dir
    else:
        embeddings_dir = args.json_dir

    create_embeddings_from_json(embeddings_dir, args.embeddings_output)
    build_faiss_index(args.embeddings_output, args.faiss_output)
    if args.mongo_uri:
        store_embeddings(
            embeddings_path=args.embeddings_output,
            mongo_uri=args.mongo_uri,
            mongo_db=args.mongo_db,
            mongo_collection=args.mongo_collection,
            video_title=args.video_title,
            video_number=args.video_number,
            course_name=args.course_name,
        )




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
    parser.add_argument("--embeddings-output", default="embeddings.joblib", help="Embeddings output.")
    parser.add_argument("--faiss-output", default="faiss_index.bin", help="FAISS index output.")
    parser.add_argument("--overwrite-audio", action="store_true", help="Overwrite audio files.")
    parser.add_argument("--video-title", default="", help="Video title metadata override.")
    parser.add_argument("--video-number", default="", help="Video number metadata override.")
    parser.add_argument("--course-name", default="", help="Course name metadata.")
    parser.add_argument("--mongo-uri", default="", help="MongoDB connection string.")
    parser.add_argument("--mongo-db", default="rag_basic", help="MongoDB database name.")
    parser.add_argument("--mongo-collection", default="video_embeddings", help="MongoDB collection name.")
    args = parser.parse_args()

    run_pipeline(args)
