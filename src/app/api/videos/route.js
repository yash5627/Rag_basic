import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { spawn, spawnSync } from "child_process";
import { randomUUID } from "crypto";

const DEFAULT_MERGE_SIZE = 5;

const resolvePythonBin = () => {
  if (process.env.PYTHON_BIN) {
    return process.env.PYTHON_BIN;
  }

  const candidates = process.platform === "win32" ? ["python", "python3"] : ["python3", "python"];
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["--version"], { stdio: "ignore" });
    if (!result.error) {
      return candidate;
    }
  }
  return null;
};

const sanitizeTitle = (title) =>
  title
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const createRunPaths = (uploadId) => {
  const baseDir = path.join(process.cwd(), "backend", "runs", uploadId);
  return {
    baseDir,
    videoDir: path.join(baseDir, "videos"),
    audioDir: path.join(baseDir, "audio"),
    jsonDir: path.join(baseDir, "jsons"),
    improvedJsonDir: path.join(baseDir, "new_jsons"),
    embeddingsPath: path.join(baseDir, "embeddings.joblib"),
    faissPath: path.join(baseDir, "faiss_index.bin"),
  };
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const video = formData.get("video");
    const title = formData.get("title")?.toString().trim();
    const number = formData.get("number")?.toString().trim();
    const course = formData.get("course")?.toString().trim();

    if (!video || !title || !number) {
      return NextResponse.json(
        { error: "Video file, title, and number are required." },
        { status: 400 }
      );
    }

    if (typeof video === "string") {
      return NextResponse.json({ error: "Invalid video upload." }, { status: 400 });
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { error: "Missing MONGODB_URI environment variable." },
        { status: 500 }
      );
    }

    const uploadId = randomUUID();
    const { videoDir, audioDir, jsonDir, improvedJsonDir, embeddingsPath, faissPath } = createRunPaths(uploadId);

    await Promise.all([
      mkdir(videoDir, { recursive: true }),
      mkdir(audioDir, { recursive: true }),
      mkdir(jsonDir, { recursive: true }),
      mkdir(improvedJsonDir, { recursive: true }),
    ]);

    const safeTitle = sanitizeTitle(title);
    const extension = path.extname(video.name || "") || ".mp4";
    const fileName = `Video_${number}_[${safeTitle}]${extension}`;
    const filePath = path.join(videoDir, fileName);
    const buffer = Buffer.from(await video.arrayBuffer());
    await writeFile(filePath, buffer);

    const pythonBin = resolvePythonBin();
    if (!pythonBin) {
      return NextResponse.json(
        { error: "Python is required to process videos. Install Python or set PYTHON_BIN." },
        { status: 500 }
      );
    }

    const processScript = path.join(process.cwd(), "backend", "process_videos.py");
    const args = [
      processScript,
      "--video-dir",
      videoDir,
      "--audio-dir",
      audioDir,
      "--json-dir",
      jsonDir,
      "--improved-json-dir",
      improvedJsonDir,
      "--merge-size",
      String(DEFAULT_MERGE_SIZE),
      "--embeddings-output",
      embeddingsPath,
      "--faiss-output",
      faissPath,
      "--overwrite-audio",
      "--cleanup",
      "--mongo-uri",
      mongoUri,
      "--mongo-db",
      process.env.MONGODB_DB || "rag_basic",
      "--mongo-collection",
      process.env.MONGODB_COLLECTION || "video_embeddings",
      "--video-title",
      title,
      "--video-number",
      number,
      "--course-name",
      course || "",
    ];

    const child = spawn(pythonBin, args, {
      cwd: process.cwd(),
      stdio: "ignore",
      detached: true,
    });
    child.unref();

    return NextResponse.json({
      message:
        "Video uploaded successfully. Processing has started in the background and embeddings will be available shortly.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed." },
      { status: 500 }
    );
  }
}
