
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
import whisper
import json
import os
import torch


def transcribe_audio(audio_dir, output_dir, model_name, device, translate):
    os.makedirs(output_dir, exist_ok=True)
    model = whisper.load_model(model_name).to(device)

    audios = os.listdir(audio_dir)
    for audio in audios:
        if not audio.lower().endswith((".mp3", ".wav", ".m4a")):
            continue

        number = audio.split("_")[0]
        title = audio.split("_")[1].split(".")[0]
        print("Processing:", number, title)

        result = model.transcribe(
            os.path.join(audio_dir, audio),
            task="translate" if translate else "transcribe",
            fp16=device == "cuda"
        )

        chunks = []
        for segment in result["segments"]:
            chunks.append({
                "title": title,
                "Number": number,
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"]
            })

        chunks_with_metaData = {
            "chunks": chunks,
            "text": result["text"]
        }

        with open(os.path.join(output_dir, f"{audio.split('.')[0]}.json"), "w") as f:
            json.dump(chunks_with_metaData, f, indent=4)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Transcribe audio files into JSON chunks.")
    parser.add_argument("--audio-dir", default="audio", help="Directory containing audio files.")
    parser.add_argument("--output-dir", default="jsons", help="Directory to store JSON chunks.")
    parser.add_argument("--model", default="small", help="Whisper model name.")
    parser.add_argument("--device", default=None, help="Force device: cpu or cuda.")
    parser.add_argument("--translate", action="store_true", help="Translate speech to English.")
    args = parser.parse_args()

    resolved_device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")
    print("Using device:", resolved_device)
    transcribe_audio(args.audio_dir, args.output_dir, args.model, resolved_device, args.translate)
