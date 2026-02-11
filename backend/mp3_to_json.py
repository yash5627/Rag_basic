
# # THIS IS THE CODE WHICH IS USED TO CREATE CHUNKS FROM AUDIO FILES AND SAVE THEM AS JSON FILES. ON GOOGLE COLLAB
# import whisper
# import json
# import os
# import torch

# device = "cuda" if torch.cuda.is_available() else "cpu"
# print("Using device:", device)

# model = whisper.load_model("small").to(device)

# audio_dir = "/content/drive/MyDrive/audio"
# output_dir = "/content/drive/MyDrive/jsons"
# os.makedirs(output_dir, exist_ok=True)

# audios = os.listdir(audio_dir)

# for audio in audios:
#     if not audio.lower().endswith((".mp3", ".wav", ".m4a")):
#         continue

#     number = audio.split("_")[0]
#     title = audio.split("_")[1].split(".")[0]
#     print("Processing:", number, title)

#     result = model.transcribe(
#         f"{audio_dir}/{audio}",
#         task="translate",
#         fp16=True   # 🚀 BIG speed boost on GPU
#     )

#     chunks = []
#     for segment in result["segments"]:
#         chunks.append({
#             "title": title,
#             "Number": number,
#             "start": segment["start"],
#             "end": segment["end"],
#             "text": segment["text"]
#         })

#     chunks_with_metaData = {
#         "chunks": chunks,
#         "text": result["text"]
#     }

#     with open(f"{output_dir}/{audio.split('.')[0]}.json", "w") as f:
#         json.dump(chunks_with_metaData, f, indent=4)

import argparse
import json
import os
import re
import torch
import whisper


def extract_metadata_from_filename(filename):
    stem, _ = os.path.splitext(filename)

    match = re.match(r"^Video_(?P<number>[^_]+)_\[(?P<title>.+)\]$", stem)
    if match:
        return match.group("number"), match.group("title")

    parts = stem.split("_", 1)
    if len(parts) == 2:
        return parts[0], parts[1]

    return "", stem


def transcribe_audio(
    audio_dir,
    output_dir,
    model_name,
    device,
    translate,
    video_title=None,
    video_number=None,
    language=None,
):
    os.makedirs(output_dir, exist_ok=True)

    print("Loading Whisper model:", model_name)
    model = whisper.load_model(model_name).to(device)

    audios = os.listdir(audio_dir)

    for audio in audios:
        if not audio.lower().endswith((".mp3", ".wav", ".m4a")):
            continue

        inferred_number, inferred_title = extract_metadata_from_filename(audio)
        number = video_number or inferred_number
        title = video_title or inferred_title

        print("Processing:", number, title)

        audio_path = os.path.join(audio_dir, audio)

        # -------- ORIGINAL TRANSCRIPTION --------
        original_result = model.transcribe(
            audio_path,
            task="transcribe",
            language=language if language else None,
            fp16=device == "cuda",
        )

        # -------- TRANSLATION (ONLY IF REQUESTED) --------
        translated_result = None
        if translate:
            translated_result = model.transcribe(
                audio_path,
                task="translate",
                fp16=device == "cuda",
            )

        chunks = []

        original_segments = original_result.get("segments", [])
        translated_segments = (
            translated_result.get("segments", []) if translated_result else []
        )

        for i, segment in enumerate(original_segments):
            segment_text = segment.get("text", "").strip()
            if not segment_text:
                continue

            translated_text = ""
            if translated_result and i < len(translated_segments):
                translated_text = translated_segments[i].get("text", "").strip()
            final_text = translated_text or segment_text
            chunks.append(
                {
                    "title": title,
                    "Number": number,
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": final_text,
                    "original_text": segment_text,
                    "translated_text": translated_text,
                }
            )

        output_data = {
            "original_text": original_result.get("text", "").strip(),
            "translated_text": translated_result.get("text", "").strip()
            if translated_result
            else "",
            "chunks": chunks,
        }

        output_file = os.path.join(
            output_dir, f"{os.path.splitext(audio)[0]}.json"
        )

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=4, ensure_ascii=False)

        print("Saved:", output_file)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Transcribe audio files into JSON with translation + timestamps."
    )

    parser.add_argument("--audio-dir", default="audio")
    parser.add_argument("--output-dir", default="jsons")
    parser.add_argument("--model", default="small")
    parser.add_argument("--device", default=None)
    parser.add_argument("--translate", action="store_true")
    parser.add_argument("--video-title", default="")
    parser.add_argument("--video-number", default="")
    parser.add_argument("--language", default="")

    args = parser.parse_args()

    resolved_device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")
    print("Using device:", resolved_device)

    transcribe_audio(
        args.audio_dir,
        args.output_dir,
        args.model,
        resolved_device,
        args.translate,
        video_title=args.video_title or None,
        video_number=args.video_number or None,
        language=args.language or None,
    )
