import argparse
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
    collection = client[mongo_db][mongo_collection]
    collection.insert_many(records)
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
    args = parser.parse_args()

    store_embeddings(
        embeddings_path=args.embeddings_path,
        mongo_uri=args.mongo_uri,
        mongo_db=args.mongo_db,
        mongo_collection=args.mongo_collection,
        video_title=args.video_title,
        video_number=args.video_number,
        course_name=args.course_name,
    )
