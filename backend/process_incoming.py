import os
import json
import requests
import joblib
import numpy as np
from dotenv import load_dotenv
import faiss
from preProcessJson import create_embedding

# Load env
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not found in .env")

print("API KEY loaded ✔")

# Input
question = input("Ask a question: ")

# Load embeddings
df = joblib.load("embeddings.joblib")

# Embed question
question_embedding = create_embedding([question])[0]

index = faiss.read_index("faiss_index.bin")
query_vector = np.array(question_embedding).astype("float32")
query_vector = np.expand_dims(query_vector, axis=0)

k = 9
distances, indices = index.search(query_vector, k)

new_df = df.iloc[indices[0]]


# Prompt
prompt = f"""
I am teaching web development in Sigma web development course. Here are video subtitle chunks containing video title, video number, start time in seconds, end time in seconds, the text at that time:

{new_df[['title','Number','start','end','text']].to_json(orient='records')}

-------------------------------------------------------------
{question}

User asked this question related to the video chunks.
Answer where and how much content is taught, in which video and at what timestamp.
If the question is unrelated, say you can only answer course-related questions.Also try not to use  special characters like * in your answer.
"""

# ---------------- STREAMING INFERENCE ---------------- #

def inference_stream(prompt):
    r = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "Sigma Web Dev RAG"
        },
        json={
            "model": "openai/gpt-oss-120b",
            "messages": [
                {"role": "system", "content": "You are a helpful teaching assistant."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "stream": True
        },
        stream=True
    )

    if r.status_code != 200:
        raise RuntimeError(r.text)

    print("\n--- Answer ---\n")

    for line in r.iter_lines():
        if not line:
            continue

        decoded = line.decode("utf-8")

        if decoded.strip() == "data: [DONE]":
            break

        if decoded.startswith("data: "):
            data = json.loads(decoded.replace("data: ", ""))
            delta = data["choices"][0].get("delta", {})
            if "content" in delta:
                print(delta["content"], end="", flush=True)

# Run
inference_stream(prompt)

