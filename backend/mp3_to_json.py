
# THIS IS THE CODE WHICH IS USED TO CREATE CHUNKS FROM AUDIO FILES AND SAVE THEM AS JSON FILES. ON GOOGLE COLLAB
import whisper
import json
import os
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", device)

model = whisper.load_model("small").to(device)

audio_dir = "/content/drive/MyDrive/audio"
output_dir = "/content/drive/MyDrive/jsons"
os.makedirs(output_dir, exist_ok=True)

audios = os.listdir(audio_dir)

for audio in audios:
    if not audio.lower().endswith((".mp3", ".wav", ".m4a")):
        continue

    number = audio.split("_")[0]
    title = audio.split("_")[1].split(".")[0]
    print("Processing:", number, title)

    result = model.transcribe(
        f"{audio_dir}/{audio}",
        task="translate",
        fp16=True   # 🚀 BIG speed boost on GPU
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

    with open(f"{output_dir}/{audio.split('.')[0]}.json", "w") as f:
        json.dump(chunks_with_metaData, f, indent=4)
