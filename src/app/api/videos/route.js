import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { spawn,spawnSync  } from "child_process";
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

const createProgressStream = (command, args, options = {}) => {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      const child = spawn(command, args, { ...options, stdio: "pipe" });
      let buffer = "";

      const send = (payload) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      };

      send({
        type: "status",
        step: "upload_complete",
        progress: 0.02,
        message: "Upload complete. Starting processing...",
      });

      child.stdout.on("data", (data) => {
        buffer += data.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return;
          }
          try {
            const parsed = JSON.parse(trimmed);
            send(parsed);
          } catch (error) {
            send({ type: "log", message: trimmed });
          }
        });
      });

      child.stderr.on("data", (data) => {
        send({ type: "log", message: data.toString() });
      });

      child.on("error", (error) => {
        send({ type: "error", message: error.message });
        controller.close();
      });

      child.on("close", (code) => {
        if (code === 0) {
          send({
            type: "done",
            message: "Transcription, chunking, embedding, and MongoDB storage completed.",
          });
        } else {
          send({
            type: "error",
            message: `Processing failed with exit code ${code}.`,
          });
        }
        controller.close();
      });
    },
  });
};


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

    const pythonBin = resolvePythonBin();
    if (!pythonBin) {
      return NextResponse.json(
        { error: "Python is required to process videos. Install Python or set PYTHON_BIN." },
        { status: 500 }
      );
    }
    const processScript = path.join(process.cwd(), "backend", "process_videos.py");

    const stream = createProgressStream(
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
      ],
      { cwd: process.cwd() }
    );

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed." },
      { status: 500 }
    );
  }
}
