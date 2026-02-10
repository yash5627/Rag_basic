"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialFormState = {
  title: "",
  number: "",
  course: "",
};

export default function TeacherPortal() {
  const router = useRouter();
  const [formState, setFormState] = useState(initialFormState);
  const [videoFile, setVideoFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to process the video");
      }

      setStatus({
        type: "success",
        message:
          result.message ||
          "Video uploaded successfully. Embeddings are being prepared in the background.",
      });

      setFormState(initialFormState);
      setVideoFile(null);

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d1117] px-6 py-12 text-white">
      <section className="mx-auto w-full max-w-3xl rounded-3xl bg-[#111827] p-8 shadow-lg">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">Teacher Portal</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Upload a lesson video</h1>
          <p className="mt-2 text-sm text-slate-300">
            Upload your video and we will process transcripts and embeddings in the background.
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {isSubmitting ? "Uploading video..." : "Upload video"}
          </button>
        </form>
      </section>
    </main>
  );
}