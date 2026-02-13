import path from "path";
import { spawnSync } from "child_process";
import { NextResponse } from "next/server";

const sanitizeDbName = (value) => {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return cleaned || "rag_basic";
};

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

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const question = body?.question?.trim();
  const course = body?.course?.trim();

  if (!question || !course) {
    return NextResponse.json({ error: "Question and course are required." }, { status: 400 });
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    return NextResponse.json({ error: "Missing MONGODB_URI environment variable." }, { status: 500 });
  }

  const pythonBin = resolvePythonBin();
  if (!pythonBin) {
    return NextResponse.json({ error: "Python runtime unavailable." }, { status: 500 });
  }

  const scriptPath = path.join(process.cwd(), "backend", "answer_question.py");
  const mongoDb = sanitizeDbName(process.env.MONGODB_DB || "rag_basic");

  const result = spawnSync(
    pythonBin,
    [scriptPath, "--mongo-uri", mongoUri, "--mongo-db", mongoDb, "--course", course, "--question", question],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      env: process.env,
    }
  );

  if (result.status !== 0) {
    return NextResponse.json(
      {
        error: result.stderr?.trim() || "Failed to process question.",
      },
      { status: 500 }
    );
  }

  try {
    const payload = JSON.parse(result.stdout || "{}");
    if (payload.error) {
      return NextResponse.json({ error: payload.error }, { status: 404 });
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Invalid response while answering question." }, { status: 500 });
  }
}
