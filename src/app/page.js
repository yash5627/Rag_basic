import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-200 mb-6">
            Transform Video Content Into
            <span className="block text-blue-500 mt-2">Searchable Knowledge</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Upload course videos, generate transcripts with timestamps, and let students
            ask questions in natural language. Your knowledge base stays searchable with
            precise video moments for every answer.
          </p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-gray-700 shadow-2xl mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-3">For Teachers</p>
              <h2 className="text-2xl font-semibold text-gray-200 mb-3">Upload and Index Videos</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Drop your lecture recordings, generate transcripts, and build embeddings with timestamps
                ready for student questions.
              </p>
              <Link
                href="/teacher"
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
              >
                Go to Teacher Portal
              </Link>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
              <p className="text-xs uppercase tracking-[0.2em] text-green-400 mb-3">For Students</p>
              <h2 className="text-2xl font-semibold text-gray-200 mb-3">Ask Questions Instantly</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Ask about any topic and receive answers linked to the exact video and timestamp.
              </p>
              <Link
                href="/student"
                className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
              >
                Ask a Question
              </Link>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 ">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">High Performance</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Efficient processing and indexing of video content with optimized algorithms for rapid results
            </p>
          </div>
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Precise Search</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Accurate timestamp identification for targeted content retrieval within video segments
            </p>
          </div>
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">AI-Powered Intelligence</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Advanced RAG technology enabling semantic understanding and intelligent content analysis
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400">
            Built for uploaded course content only — no YouTube link ingestion is provided.
          </p>
        </div>
      </div>
    </div>
  );
}