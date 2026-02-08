"use client";

import { useState } from "react";

export default function StudentPortal() {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("Sigma Web Development");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);

  const exampleQueries = [
    "Where is DOM manipulation explained?",
    "Which video covers CRUD?",
    "Explain Node.js error handling",
    "How are callbacks introduced?"
  ];

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setResults({
        answer:
          "DOM manipulation is introduced with live examples. Look at the section where elements are selected and updated using query selectors.",
        video: "Video 01 - DOM",
        timestamp: "00:12:42",
        summary: "Selecting elements and updating content.",
        confidence: 0.93
      });
      setIsSearching(false);
    }, 1400);
  };

  return (
    <div className="min-h-[85vh] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-green-400 mb-3">
            Student Portal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-200 mb-4">
            Ask Questions with Timestamps
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Search across your teacher&#39;s videos and jump directly to the exact moment the
            concept is explained.
          </p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid md:grid-cols-[1fr_2fr] gap-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium uppercase tracking-wide">
                  Course
                </label>
                <select
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-900/50 text-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                >
                  <option>Sigma Web Development</option>
                  <option>Data Structures Bootcamp</option>
                  <option>UI/UX Fundamentals</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium uppercase tracking-wide">
                  Your Question
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g., Where is DOM manipulation explained?"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-900/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSearching ? "Searching..." : "Get Answer"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-4 font-medium">Try a sample question:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="px-3 py-2 bg-gray-900/50 text-gray-300 rounded-lg text-xs hover:bg-gray-700 transition-all duration-200"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {results && (
          <div className="bg-gray-800/60 rounded-2xl p-8 border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-400">Course: {course}</p>
                <h2 className="text-2xl font-semibold text-gray-200">Answer</h2>
              </div>
              <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs font-medium border border-green-500/30">
                {Math.round(results.confidence * 100)}% Match
              </span>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 mb-6">
              <p className="text-gray-200 text-lg leading-relaxed">{results.answer}</p>
              <p className="text-sm text-gray-500 mt-3">{results.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Video</p>
                <p className="text-gray-200 font-semibold">{results.video}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Timestamp</p>
                <p className="text-gray-200 font-semibold">{results.timestamp}</p>
                <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-200">
                  Jump to Video
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
