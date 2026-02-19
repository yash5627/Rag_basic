# 🎥 VideoAssistant AI

### Retrieval-Augmented Video Learning Assistant

VideoAssistant AI is an AI-powered learning assistant that allows students and educators to upload course videos and ask natural-language questions.
The system converts videos into searchable knowledge using transcription, semantic chunking, and vector retrieval, then returns answers with relevant video moments.

---

## 🚀 Features

* 📤 Upload course videos for processing
* 📝 Automatic speech-to-text transcription
* ⏱ Timestamp-aware semantic chunking
* 🔎 Vector search using FAISS embeddings
* 💬 Natural-language Q&A over video content
* 🔐 Authentication system for user access
* ⚡ Fast full-stack implementation with Next.js + Python

---

## 🧠 How It Works (RAG Pipeline)

1. **Video Upload**

   * User uploads a course or lecture video.

2. **Transcription**

   * Audio is converted into text using a speech-to-text model.

3. **Chunking with timestamps**

   * Transcript is split into semantic chunks while preserving timestamps.

4. **Embedding generation**

   * Each chunk is converted into vector embeddings.

5. **Vector index creation**

   * Embeddings stored using FAISS for efficient similarity search.

6. **Question answering**

   * User query → embedding → similarity search → relevant chunks retrieved
   * Retrieved context passed to LLM for answer generation.

---

## 🏗 Tech Stack

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS (if used — remove if not)
* NextAuth (authentication)

### Backend / AI Pipeline

* Python processing scripts
* Speech-to-Text transcription workflow
* Semantic chunking logic
* Vector embeddings
* FAISS similarity search

---

## 📂 Project Structure

```
/app            → Next.js frontend routes
/components     → UI components
/scripts        → Python data processing & indexing
/vector_store   → FAISS index storage
/public         → static assets
```

---

## ▶️ Running Locally

### 1. Clone repository

```
git clone <your-repo-url>
cd VideoAssistant-AI
```

### 2. Install dependencies

```
npm install
```

### 3. Start development server

```
npm run dev
```

### 4. Open browser

```
http://localhost:3000
```

---

## ⚠️ Current Limitations

* Supports **uploaded video files only**
* YouTube links and playlists are not yet supported
* Processing time depends on video length

---

## 🎯 Example Use Cases

* Searching long university lecture recordings
* Revising concepts from recorded classes
* Finding explanations inside training videos
* Building searchable corporate knowledge videos

---

## 🔮 Future Improvements

* YouTube link ingestion
* Clickable timestamps in answers
* Multi-video knowledge base search
* Conversation memory for follow-up questions
* Cloud deployment with scalable storage

---

## 👨‍💻 Author

Built as a Retrieval-Augmented Generation (RAG) learning system demonstrating:

* semantic search pipelines
* AI-assisted knowledge retrieval
* full-stack ML product architecture

---

⭐ If you found this project interesting, consider starring the repository!
