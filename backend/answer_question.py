import argparse
import json
import os
import re
from typing import List, Dict, Any

import numpy as np
import requests
from pymongo import MongoClient


COURSE_PREFIX = "course_embeddings_"


def normalize_course_name(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9_-]", "_", value.lower())
    cleaned = re.sub(r"_+", "_", cleaned).strip("_")
    return cleaned or "rag_basic"


def create_embedding(text_list: List[str]) -> List[List[float]]:
    response = requests.post(
        "http://localhost:11434/api/embed",
        json={"model": "bge-m3", "input": text_list},
        timeout=60,
    )
    response.raise_for_status()
    payload = response.json()
    if "embeddings" not in payload:
        raise RuntimeError("Embedding service did not return embeddings")
    return payload["embeddings"]


def search_similar_chunks(records: List[Dict[str, Any]], question_embedding: List[float], k: int = 9):
    if not records:
        return [], []

    embedding_matrix = np.array([record.get("embedding", []) for record in records], dtype="float32")
    if embedding_matrix.ndim != 2 or embedding_matrix.shape[1] == 0:
        return [], []

    query_vector = np.array(question_embedding, dtype="float32")
    distances = np.linalg.norm(embedding_matrix - query_vector, axis=1)
    top_indices = np.argsort(distances)[:k]
    top_records = [records[int(index)] for index in top_indices]
    top_distances = [float(distances[int(index)]) for index in top_indices]
    return top_records, top_distances


def build_prompt(question: str, context_rows: List[Dict[str, Any]], course_name: str) -> str:
    compact_rows = []
    for row in context_rows:
        compact_rows.append(
            {
                "title": row.get("title", ""),
                "Number": row.get("Number", ""),
                "start": row.get("start", 0),
                "end": row.get("end", 0),
                "text": row.get("text", ""),
            }
        )

    return f"""
I am teaching web development in {course_name}. Here are subtitle chunks containing video title, video number, start time in seconds, end time in seconds, and text:

{json.dumps(compact_rows, ensure_ascii=False)}

-------------------------------------------------------------
{question}

User asked this question related to the video chunks.
Answer where and how much content is taught, in which video and at what timestamp.
If the question is unrelated, say you can only answer course-related questions. Also try not to use special characters like * in your answer.
""".strip()


def infer_answer(prompt: str, openrouter_api_key: str) -> str:
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "Sigma Web Dev RAG",
        },
        json={
            "model": "openai/gpt-oss-120b",
            "messages": [
                {"role": "system", "content": "You are a helpful teaching assistant."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "stream": False,
        },
        timeout=120,
    )
    response.raise_for_status()
    payload = response.json()

    choices = payload.get("choices", [])
    if not choices:
        raise RuntimeError("OpenRouter did not return any choices")

    message = choices[0].get("message", {})
    return message.get("content", "").strip()


def main():
    parser = argparse.ArgumentParser(description="Answer a student question using course embeddings.")
    parser.add_argument("--mongo-uri", required=True)
    parser.add_argument("--mongo-db", default="rag_basic")
    parser.add_argument("--course", required=True)
    parser.add_argument("--question", required=True)
    args = parser.parse_args()

    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    if not openrouter_api_key:
        raise RuntimeError("OPENROUTER_API_KEY not found")

    course_collection = f"{COURSE_PREFIX}{normalize_course_name(args.course)}"

    client = MongoClient(args.mongo_uri)
    db = client[args.mongo_db]
    collection = db[course_collection]
    records = list(
        collection.find(
            {},
            {
                "_id": 0,
                "title": 1,
                "Number": 1,
                "start": 1,
                "end": 1,
                "text": 1,
                "embedding": 1,
            },
        )
    )
    client.close()

    if not records:
        print(json.dumps({"error": "No embeddings found for selected course."}))
        return

    question_embedding = create_embedding([args.question])[0]
    top_rows, distances = search_similar_chunks(records, question_embedding)

    if not top_rows:
        print(json.dumps({"error": "Unable to search in the selected course embeddings."}))
        return

    prompt = build_prompt(args.question, top_rows, args.course)
    answer = infer_answer(prompt, openrouter_api_key)

    primary = top_rows[0]
    best_distance = distances[0] if distances else 0.0
    confidence = float(1 / (1 + best_distance))

    print(
        json.dumps(
            {
                "answer": answer,
                "video": primary.get("title", ""),
                "timestamp": {
                    "start": primary.get("start", 0),
                    "end": primary.get("end", 0),
                },
                "summary": primary.get("text", ""),
                "confidence": confidence,
            }
        )
    )


if __name__ == "__main__":
    main()
