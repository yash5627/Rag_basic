import whisper
import json
model = whisper.load_model("large-v2")
result=model.transcribe("audio/sample.mp3",task="translate")
chunks=[]
segments=result["segments"]
for segment in segments:
    chunks.append({
        "start":segment["start"],
        "end":segment["end"],
        "text":segment["text"]
    })

print(chunks)

with open("output.json","w") as f:
    json.dump(chunks,f,indent=4)
