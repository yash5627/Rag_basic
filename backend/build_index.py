import joblib
import numpy as np
import faiss

print("Loading existing embeddings...")

df = joblib.load("embeddings.joblib")

# =====================================
# 1️⃣ Build Chunk FAISS Index
# =====================================

print("Building chunk FAISS index...")

chunk_embeddings = np.vstack(df["embedding"].values).astype("float32")

dimension = chunk_embeddings.shape[1]

chunk_index = faiss.IndexFlatL2(dimension)
chunk_index.add(chunk_embeddings)

faiss.write_index(chunk_index, "chunk_index.bin")

print("Chunk index saved ✔")


# =====================================
# 2️⃣ Build Video-Level Index
# (NO RE-EMBEDDING)
# =====================================

print("Building video-level index from existing embeddings...")

video_titles = []
video_embeddings = []

video_groups = df.groupby("title")

for title, group in video_groups:
    video_titles.append(title)

    # Average chunk embeddings
    avg_embedding = np.mean(
        np.vstack(group["embedding"].values),
        axis=0
    )

    video_embeddings.append(avg_embedding)

video_embeddings = np.array(video_embeddings).astype("float32")

video_index = faiss.IndexFlatL2(video_embeddings.shape[1])
video_index.add(video_embeddings)

faiss.write_index(video_index, "video_index.bin")
joblib.dump(video_titles, "video_titles.joblib")

print("Video index saved ✔")

print("\nAll indexes built WITHOUT re-embedding 🚀")
