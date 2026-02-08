# import requests
# import os
# import json
# import pandas as pd
# import joblib

# def create_embedding(text_list):
#     r = requests.post(
#         "http://localhost:11434/api/embed",
#         json={"model": "bge-m3", "input": text_list}
#     )
#     return r.json()["embeddings"]


# if __name__ == "__main__":   # 🔐 THIS IS THE KEY
#     jsons = os.listdir("new_jsons")
#     my_dicts = []
#     chunk_id = 0

#     for json_file in jsons:
#         with open(f"new_jsons/{json_file}") as f:
#             content = json.load(f)

#         print(f"Creating Embeddings for {json_file}")
#         embeddings = create_embedding([c['text'] for c in content['chunks']])

#         for i, chunk in enumerate(content['chunks']):
#             chunk['chunk_id'] = chunk_id
#             chunk['embedding'] = embeddings[i]
#             chunk_id += 1
#             my_dicts.append(chunk)
        

#     df = pd.DataFrame(my_dicts)
#     joblib.dump(df, "embeddings.joblib")
import argparse
import requests
import os
import json
import pandas as pd
import joblib

def create_embedding(text_list):
    r = requests.post(
        "http://localhost:11434/api/embed",
        json={"model": "bge-m3", "input": text_list}
    )
    return r.json()["embeddings"]


def create_embeddings_from_json(json_dir, output_path):
    jsons = os.listdir(json_dir)
    my_dicts = []
    chunk_id = 0

    for json_file in jsons:
        if not json_file.endswith(".json"):
            continue
        with open(os.path.join(json_dir, json_file)) as f:
            content = json.load(f)

        print(f"Creating Embeddings for {json_file}")
        embeddings = create_embedding([c['text'] for c in content['chunks']])

        for i, chunk in enumerate(content['chunks']):
            chunk['chunk_id'] = chunk_id
            chunk['embedding'] = embeddings[i]
            chunk_id += 1
            my_dicts.append(chunk)
        

    df = pd.DataFrame(my_dicts)
    joblib.dump(df, output_path)
    return df


if __name__ == "__main__":   # 🔐 THIS IS THE KEY
    parser = argparse.ArgumentParser(description="Create embeddings from JSON chunks.")
    parser.add_argument("--json-dir", default="new_jsons", help="Directory with JSON chunks.")
    parser.add_argument("--output", default="embeddings.joblib", help="Output path for embeddings.")
    args = parser.parse_args()

    create_embeddings_from_json(args.json_dir, args.output)
