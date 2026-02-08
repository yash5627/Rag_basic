import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { randomUUID } from "crypto";

const DEFAULT_MERGE_SIZE = 5;

const runCommand = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, stdio: "pipe" });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || stdout || `Process exited with code ${code}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });

const sanitizeTitle = (title) =>
  title
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

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
    const baseDir = path.join(process.cwd(), "backend", "runs", uploadId);
    const videoDir = path.join(baseDir, "videos");
    const audioDir = path.join(baseDir, "audio");
    const jsonDir = path.join(baseDir, "jsons");
    const improvedJsonDir = path.join(baseDir, "new_jsons");
    const embeddingsPath = path.join(baseDir, "embeddings.joblib");
    const faissPath = path.join(baseDir, "faiss_index.bin");

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

    const pythonBin = process.env.PYTHON_BIN || "python3";
    const processScript = path.join(process.cwd(), "backend", "process_videos.py");

    await runCommand(
      pythonBin,
      [
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
      ],
      { cwd: process.cwd() }
    );

    return NextResponse.json({
      message: "Transcription, chunking, embedding, and MongoDB storage completed.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed." },
      { status: 500 }
    );
  }
}
