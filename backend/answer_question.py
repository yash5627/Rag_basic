import argparse
import json
import os
import re
from typing import List, Dict, Any, Generator

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
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    if "embeddings" not in payload:
        raise RuntimeError("Embedding service did not return embeddings")
    return payload["embeddings"]


def search_similar_chunks(records: List[Dict[str, Any]], question_embedding: List[float], k: int = 6):
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
Respond in a clean ChatGPT-style format:
1) Short answer (2-4 lines)
2) Where to learn it (bullet points with video + timestamp in minutes range)
3) Quick explanation (small bullet list)
If unrelated, say you can only answer course-related questions.
Avoid markdown tables and avoid special characters like *.
""".strip()


def stream_answer(prompt: str, openrouter_api_key: str, model: str) -> Generator[str, None, None]:
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "Sigma Web Dev RAG",
        },
        json={
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a helpful teaching assistant."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.15,
            "stream": True,
        },
        timeout=120,
        stream=True,
    )
    response.raise_for_status()

    for raw_line in response.iter_lines(decode_unicode=True):
        if not raw_line:
            continue
        if not raw_line.startswith("data:"):
            continue

        payload_line = raw_line[5:].strip()
        if payload_line == "[DONE]":
            break

        data = json.loads(payload_line)
        choices = data.get("choices", [])
        if not choices:
            continue
        delta = choices[0].get("delta", {})
        token = delta.get("content", "")
        if token:
            yield token


def infer_answer(prompt: str, openrouter_api_key: str, model: str) -> str:
    answer_parts = []
    for token in stream_answer(prompt, openrouter_api_key, model):
        answer_parts.append(token)
    answer = "".join(answer_parts).strip()
    if not answer:
        raise RuntimeError("OpenRouter did not return any answer")
    return answer


def emit(event: Dict[str, Any]):
    print(json.dumps(event, ensure_ascii=False), flush=True)


def main():
    parser = argparse.ArgumentParser(description="Answer a student question using course embeddings.")
    parser.add_argument("--mongo-uri", required=True)
    parser.add_argument("--mongo-db", default="rag_basic")
    parser.add_argument("--course", required=True)
    parser.add_argument("--question", required=True)
    parser.add_argument("--stream", action="store_true")
    args = parser.parse_args()

    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    if not openrouter_api_key:
        raise RuntimeError("OPENROUTER_API_KEY not found")

    model = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
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
        error_payload = {"error": "No embeddings found for selected course."}
        if args.stream:
            emit({"type": "error", "error": error_payload["error"]})
            return
        print(json.dumps(error_payload))
        return

    question_embedding = create_embedding([args.question])[0]
    top_rows, distances = search_similar_chunks(records, question_embedding)

    if not top_rows:
        error_payload = {"error": "Unable to search in the selected course embeddings."}
        if args.stream:
            emit({"type": "error", "error": error_payload["error"]})
            return
        print(json.dumps(error_payload))
        return

    prompt = build_prompt(args.question, top_rows, args.course)

    primary = top_rows[0]
    best_distance = distances[0] if distances else 0.0
    confidence = float(1 / (1 + best_distance))

    if args.stream:
        final_answer_parts = []
        for token in stream_answer(prompt, openrouter_api_key, model):
            final_answer_parts.append(token)
            emit({"type": "token", "content": token})

        final_answer = "".join(final_answer_parts).strip()
        if not final_answer:
            emit({"type": "error", "error": "OpenRouter did not return any answer"})
            return

        emit(
            {
                "type": "final",
                "answer": final_answer,
                "video": primary.get("title", ""),
                "timestamp": {
                    "start": primary.get("start", 0),
                    "end": primary.get("end", 0),
                },
                "summary": primary.get("text", ""),
                "confidence": confidence,
            }
        )
        return

    answer = infer_answer(prompt, openrouter_api_key, model)

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