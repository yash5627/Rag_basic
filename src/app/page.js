"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [linkType, setLinkType] = useState("playlist"); // "playlist" or "video"
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link.trim()) {
      alert("Please enter a valid link");
      return;
    }

    setIsSubmitting(true);
    
    // TODO: Connect to backend API
    // For now, just show a message
setTimeout(() => {
      alert(`Processing ${linkType === "playlist" ? "playlist" : "video"} link...\n\nLink: ${link}\n\n(Backend integration pending)`);
      setIsSubmitting(false);
    }, 1000);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center  px-6 py-12">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
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

        {/* Quick Start Card */}
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

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/40 rounded-lg p-6 border  border-gray-700 hover:border-blue-500/50 transition-all duration-300 ">
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
          <div className="bg-gray-800/40 rounded-lg p-6 border  border-gray-700 hover:border-blue-500/50 transition-all duration-300">
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
          <div className="bg-gray-800/40 rounded-lg p-6 border  border-gray-700 hover:border-blue-500/50 transition-all duration-300">
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

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Need to process YouTube links instead of uploads?
          </p>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder={
                    linkType === "playlist"
                      ? "https://www.youtube.com/playlist?list=..."
                      : "https://www.youtube.com/watch?v=..."
                  }
                  className="w-full px-5 py-4 rounded-lg border-2 border-gray-600 bg-gray-900/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
                {link && isValidUrl(link) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setLinkType("playlist")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    linkType === "playlist"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Playlist
                </button>
                <button
                  type="button"
                  onClick={() => setLinkType("video")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    linkType === "video"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Single Video
                </button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !link.trim()}
                className="px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
              >
                {isSubmitting ? "Processing..." : "Process"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
// "use client";

// import { useState } from "react";
// import Link from "next/link";

// export default function Home() {
//   const [linkType, setLinkType] = useState("playlist"); // "playlist" or "video"
//   const [link, setLink] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!link.trim()) {
//       alert("Please enter a valid link");
//       return;
//     }

//     setIsSubmitting(true);
    
//     // TODO: Connect to backend API
//     // For now, just show a message
//     setTimeout(() => {
//       alert(`Processing ${linkType === "playlist" ? "playlist" : "video"} link...\n\nLink: ${link}\n\n(Backend integration pending)`);
//       setIsSubmitting(false);
//     }, 1000);
//   };

//   const isValidUrl = (string) => {
//     try {
//       new URL(string);
//       return true;
//     } catch (_) {
//       return false;
//     }
//   };

//   return (
//     <div className="min-h-[85vh] flex flex-col items-center justify-center  px-6 py-12">
//       <div className="max-w-4xl w-full">
//         {/* Hero Section */}
//         <div className="text-center mb-12">
//           <h1 className="text-5xl md:text-6xl font-bold text-gray-200 mb-6">
//             Transform Video Content Into
//             <span className="block text-blue-500 mt-2">Searchable Knowledge</span>
//           </h1>
//           <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
//             Submit your YouTube playlist or video link to process and index content 
//             with AI-powered precision. Enable intelligent search capabilities across 
//             your video library with accurate timestamp retrieval.
//           </p>
//         </div>

//         {/* Link Input Card */}
//         <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-gray-700 shadow-2xl mb-8">
//           {/* Link Type Selector */}
//           <div className="flex gap-4 mb-8 justify-center">
//             <button
//               onClick={() => setLinkType("playlist")}
//               className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
//                 linkType === "playlist"
//                   ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
//                   : "bg-gray-700 text-gray-300 hover:bg-gray-600"
//               }`}
//             >
//               Playlist
//             </button>
//             <button
//               onClick={() => setLinkType("video")}
//               className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
//                 linkType === "video"
//                   ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
//                   : "bg-gray-700 text-gray-300 hover:bg-gray-600"
//               }`}
//             >
//               Single Video
//             </button>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-gray-300 mb-3 text-sm font-medium uppercase tracking-wide">
//                 {linkType === "playlist" ? "YouTube Playlist URL" : "YouTube Video URL"}
//               </label>
//               <div className="flex gap-3">
//                 <div className="flex-1 relative">
//                   <input
//                     type="url"
//                     value={link}
//                     onChange={(e) => setLink(e.target.value)}
//                     placeholder={
//                       linkType === "playlist"
//                         ? "https://www.youtube.com/playlist?list=..."
//                         : "https://www.youtube.com/watch?v=..."
//                     }
//                     className="w-full px-5 py-4 rounded-lg border-2 border-gray-600 bg-gray-900/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
//                     required
//                   />
//                   {link && isValidUrl(link) && (
//                     <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                       <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                       </svg>
//                     </div>
//                   )}
//                 </div>
//                 <button
//                   type="submit"
//                   disabled={isSubmitting || !link.trim()}
//                   className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center gap-2 min-w-35 justify-center"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Processing...
//                     </>
//                   ) : (
//                     "Process"
//                   )}
//                 </button>
//               </div>
//               <p className="mt-2 text-sm text-gray-500">
//                 {linkType === "playlist"
//                   ? "Enter a valid YouTube playlist URL to process all videos in the collection"
//                   : "Enter a valid YouTube video URL to begin processing"}
//               </p>
//             </div>
//           </form>
//         </div>

//         {/* Features Grid */}
//         <div className="grid md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-gray-800/40 rounded-lg p-6 border  border-gray-700 hover:border-blue-500/50 transition-all duration-300 ">
//             <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
//               <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-200 mb-2">High Performance</h3>
//             <p className="text-gray-400 text-sm leading-relaxed">
//               Efficient processing and indexing of video content with optimized algorithms for rapid results
//             </p>
//           </div>
//           <div className="bg-gray-800/40 rounded-lg p-6 border  border-gray-700 hover:border-blue-500/50 transition-all duration-300">
//             <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
//               <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-200 mb-2">Precise Search</h3>
//             <p className="text-gray-400 text-sm leading-relaxed">
//               Accurate timestamp identification for targeted content retrieval within video segments
//             </p>
//           </div>
//           <div className="bg-gray-800/40 rounded-lg p-6 border  border-gray-700 hover:border-blue-500/50 transition-all duration-300">
//             <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
//               <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-gray-200 mb-2">AI-Powered Intelligence</h3>
//             <p className="text-gray-400 text-sm leading-relaxed">
//               Advanced RAG technology enabling semantic understanding and intelligent content analysis
//             </p>
//           </div>
//         </div>

//         {/* CTA Section */}
//         <div className="text-center">
//           <p className="text-gray-400 mb-4">
//             Already have processed content available?
//           </p>
//           <Link
//             href="/search"
//             className="inline-block px-6 py-3  bg-gray-700 text-gray-200 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
//           >
//             Access Search Interface
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }


