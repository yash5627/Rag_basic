import argparse
import json
import os
import joblib
from pymongo import MongoClient


def store_embeddings(
    embeddings_path,
    mongo_uri,
    mongo_db,
    mongo_collection,
    video_title="",
    video_number="",
    course_name="",
    merged_json_dir="",
    merged_json_collection="course_jsons",
):
    df = joblib.load(embeddings_path)

    if video_title:
        df["title"] = video_title
    if video_number:
        df["Number"] = video_number
    if course_name:
        df["course"] = course_name

    records = df.to_dict(orient="records")
    for record in records:
        embedding = record.get("embedding")
        if embedding is not None and not isinstance(embedding, list):
            record["embedding"] = embedding.tolist()

    client = MongoClient(mongo_uri)
    db = client[mongo_db]
    embedding_collection = db[mongo_collection]
    embedding_collection.insert_many(records)

    if merged_json_dir and os.path.isdir(merged_json_dir):
        merged_docs = []
        for filename in os.listdir(merged_json_dir):
            if not filename.endswith(".json"):
                continue

            file_path = os.path.join(merged_json_dir, filename)
            with open(file_path, "r", encoding="utf-8") as file:
                json_content = json.load(file)

            merged_docs.append(
                {
                    "course": course_name,
                    "title": video_title,
                    "Number": video_number,
                    "filename": filename,
                    "content": json_content,
                }
            )

        if merged_docs:
            json_collection = db[merged_json_collection]
            json_collection.insert_many(merged_docs)

    client.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Store embeddings into MongoDB.")
    parser.add_argument("--embeddings-path", default="embeddings.joblib", help="Embeddings joblib file.")
    parser.add_argument("--mongo-uri", required=True, help="MongoDB connection string.")
    parser.add_argument("--mongo-db", default="rag_basic", help="MongoDB database name.")
    parser.add_argument("--mongo-collection", default="video_embeddings", help="MongoDB collection.")
    parser.add_argument("--video-title", default="", help="Video title metadata override.")
    parser.add_argument("--video-number", default="", help="Video number metadata override.")
    parser.add_argument("--course-name", default="", help="Course name metadata.")
    parser.add_argument("--merged-json-dir", default="", help="Directory that contains merged jsons.")
    parser.add_argument(
        "--merged-json-collection",
        default="course_jsons",
        help="Collection where merged json contents are stored.",
    )
    args = parser.parse_args()

    store_embeddings(
        embeddings_path=args.embeddings_path,
        mongo_uri=args.mongo_uri,
        mongo_db=args.mongo_db,
        mongo_collection=args.mongo_collection,
        video_title=args.video_title,
        video_number=args.video_number,
        course_name=args.course_name,
        merged_json_dir=args.merged_json_dir,
        merged_json_collection=args.merged_json_collection,
    )