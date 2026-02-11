import { NextResponse } from "next/server";
import path from "path";
import { spawnSync } from "child_process";

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

export async function GET() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    return NextResponse.json({ courses: [], error: "Missing MONGODB_URI environment variable." }, { status: 500 });
  }

  const pythonBin = resolvePythonBin();
  if (!pythonBin) {
    return NextResponse.json({ courses: [], error: "Python runtime unavailable." }, { status: 500 });
  }

  const scriptPath = path.join(process.cwd(), "backend", "list_courses.py");
  const mongoDb = sanitizeDbName(process.env.MONGODB_DB || "rag_basic");

  const result = spawnSync(pythonBin, [scriptPath, "--mongo-uri", mongoUri, "--mongo-db", mongoDb], {
    cwd: process.cwd(),
    encoding: "utf-8",
  });

  if (result.status !== 0) {
    return NextResponse.json(
      {
        courses: [],
        error: result.stderr?.trim() || "Failed to load courses.",
      },
      { status: 500 }
    );
  }

  try {
    const payload = JSON.parse(result.stdout || "{}");
    return NextResponse.json({ courses: payload.courses || [] });
  } catch {
    return NextResponse.json({ courses: [], error: "Invalid response while loading courses." }, { status: 500 });
  }
}
