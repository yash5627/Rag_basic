import argparse
import json
import re
from pymongo import MongoClient

COURSE_PREFIX = "course_embeddings_"


def to_display_name(slug):
    words = [word for word in re.split(r"[_-]+", slug) if word]
    if not words:
        return "General"
    return " ".join(word.capitalize() for word in words)


def list_courses(mongo_uri, mongo_db):
    client = MongoClient(mongo_uri)
    try:
        db = client[mongo_db]
        names = db.list_collection_names()
        courses = []
        for collection_name in names:
            if not collection_name.startswith(COURSE_PREFIX):
                continue
            slug = collection_name[len(COURSE_PREFIX):]
            courses.append(
                {
                    "id": slug,
                    "name": to_display_name(slug),
                    "collection": collection_name,
                }
            )
        courses.sort(key=lambda item: item["name"])
        return courses
    finally:
        client.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="List course collections from MongoDB")
    parser.add_argument("--mongo-uri", required=True)
    parser.add_argument("--mongo-db", default="rag_basic")
    args = parser.parse_args()

    result = list_courses(args.mongo_uri, args.mongo_db)
    print(json.dumps({"courses": result}))
