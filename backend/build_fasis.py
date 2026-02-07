import joblib
import numpy as np
import faiss

# Load saved embeddings
df = joblib.load("embeddings.joblib")

# Convert to float32 matrix
embeddings = np.vstack(df["embedding"].values).astype("float32")

dimension = embeddings.shape[1]

# Create FAISS index
index = faiss.IndexFlatL2(dimension)

# Add embeddings
index.add(embeddings)

# Save index
faiss.write_index(index, "faiss_index.bin")

print("FAISS index created ✔")
