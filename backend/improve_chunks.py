import os
import json
import requests  # keeping since you imported it

new_chunks = []
json_dir = "jsons"

for filename in os.listdir(json_dir):
    if not filename.endswith(".json"):
        continue

    file_path = os.path.join(json_dir, filename)

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunks = data.get("chunks", [])

    for i in range(0, len(chunks), 5):
        group = chunks[i:i+5]

        chunk = {
            "title": group[0]["title"],
            "Number": group[0]["Number"],
            "start": group[0]["start"],
            "end": group[-1]["end"],
            "text": " ".join(chunk["text"] for chunk in group)
        }

        new_chunks.append(chunk)
    text=data['text']
    data_improved={
        "chunks": new_chunks,
        "text": text
    }
    with open(f"new_jsons/{filename.split('.')[0]}.json", "w") as f:
        json.dump(data_improved, f, indent=4)

