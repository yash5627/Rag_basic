"use client";

import { useState } from "react";

const initialFormState = {
  title: "",
  number: "",
  course: "",
};

export default function TeacherPortal() {
  const [formState, setFormState] = useState(initialFormState);
  const [videoFile, setVideoFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState({
    percent: 0,
    step: "",
    etaSeconds: null,
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!videoFile) {
      setStatus({ type: "error", message: "Please select a video file to upload." });
      return;
    }

    if (!formState.title.trim() || !formState.number.trim()) {
      setStatus({ type: "error", message: "Video title and number are required." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    setProgress({ percent: 0, step: "upload", etaSeconds: null, message: "Uploading video..." });

    const payload = new FormData();
    payload.append("video", videoFile);
    payload.append("title", formState.title.trim());
    payload.append("number", formState.number.trim());

    if (formState.course.trim()) {
      payload.append("course", formState.course.trim());
    }

    try {
      const response = await fetch("/api/videos", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Unable to process the video");
      }

      if (!response.body) {
        throw new Error("Streaming response not available.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalMessage = "";
      let streamError = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return;
          }
          let payload;
          try {
            payload = JSON.parse(trimmed);
          } catch (error) {
            return;
          }

          if (payload.type === "error") {
            streamError = payload.message || "Processing failed.";
            return;
          }

          if (payload.type === "done") {
            finalMessage = payload.message || "Video processed.";
          }

          if (payload.type === "progress" || payload.type === "status") {
            setProgress({
              percent: Math.min(100, Math.round((payload.progress || 0) * 100)),
              step: payload.step || "",
              etaSeconds: payload.eta_seconds ?? null,
              message: payload.message || "",
            });
          }
        });
      }

      if (streamError) {
        throw new Error(streamError);
      }

      setProgress((prev) => ({ ...prev, percent: 100 }));
      setStatus({
        type: "success",
        message: `Video processed. ${finalMessage}`,
      });
      setFormState(initialFormState);
      setVideoFile(null);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatEta = (seconds) => {
    if (seconds === null || Number.isNaN(seconds)) {
      return "Estimating...";
    }
    const clamped = Math.max(0, Math.round(seconds));
    const minutes = Math.floor(clamped / 60);
    const remainingSeconds = clamped % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-[#0d1117] px-6 py-12 text-white">
      <section className="mx-auto w-full max-w-3xl rounded-3xl bg-[#111827] p-8 shadow-lg">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">Teacher Portal</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Upload a lesson video</h1>
          <p className="mt-2 text-sm text-slate-300">
            Provide the video details so we can transcribe, chunk, embed, and store it in the course knowledge base.
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Video title
              <input
                name="title"
                type="text"
                value={formState.title}
                onChange={handleChange}
                placeholder="Intro to React hooks"
                className="rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Video number
              <input
                name="number"
                type="text"
                value={formState.number}
                onChange={handleChange}
                placeholder="12"
                className="rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                required
              />

            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Course name (optional)
            <input
              name="course"
              type="text"
              value={formState.course}
              onChange={handleChange}
              placeholder="Sigma Web Development"
              className="rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Upload video file
            <input
              type="file"
              accept="video/*"
              onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
              className="rounded-lg border border-dashed border-slate-600 bg-[#0b1220] px-4 py-3 text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500"
              required
            />
          </label>

          {status.message && (
            <div
              className={`rounded-lg px-4 py-3 text-sm font-medium ${
                status.type === "success"
                  ? "bg-emerald-500/10 text-emerald-200"
                  : "bg-rose-500/10 text-rose-200"
              }`}
            >
              {status.message}
            </div>
          )}

          {isSubmitting && (
            <div className="space-y-2 rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm text-slate-200">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                <span>Processing status</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
                <span>{progress.message || `Step: ${progress.step || "starting"}`}</span>
                <span>ETA: {formatEta(progress.etaSeconds)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {isSubmitting ? "Processing video..." : "Process video"}
          </button>
        </form>
      </section>
    </main>
  );
}
