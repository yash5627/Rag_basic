"use client";

import { useState } from "react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  const exampleQueries = [
    "What is DOM manipulation?",
    "How do callbacks work in JavaScript?",
    "Explain error handling in Node.js",
    "What are CRUD operations?",
    "How to handle events in JavaScript?"
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    
    // TODO: Connect to backend API
    // Simulate API call
    setTimeout(() => {
      // Mock results for demonstration
      setResults({
        query: query,
        answer: "This is a placeholder answer. The actual implementation will connect to your RAG backend to retrieve accurate responses with video timestamps.",
        video: "01_Dom",
        timestamp: "02:34",
        confidence: 0.92
      });
      setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
      setIsSearching(false);
    }, 1500);
  };

  const handleExampleClick = (example) => {
    setQuery(example);
  };

  return (
    <div className="min-h-[85vh] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-2xl font-bold text-gray-200 mb-6">
            Intelligent Course
            <span className="block text-blue-500 mt-2">Content Search</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Ask questions in natural language and receive precise answers with exact video timestamps
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-gray-700 shadow-2xl mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-3 text-sm font-medium uppercase tracking-wide">
                Enter Your Question
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., How does DOM manipulation work?"
                    className="w-full px-5 py-4 rounded-lg border-2 border-gray-600 bg-gray-900/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
                    disabled={isSearching}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center gap-2  justify-center"
                >
                  {isSearching ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Example Queries */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-4 font-medium">Example Questions:</p>
            <div className="flex flex-wrap gap-3">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  disabled={isSearching}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 hover:border-blue-500/50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-4 font-medium">Recent Searches:</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(item)}
                    disabled={isSearching}
                    className="px-3 py-1.5 bg-gray-900/50 text-gray-400 rounded text-xs hover:bg-gray-800 hover:text-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-200 mb-2">Search Results</h2>
                <p className="text-sm text-gray-400">Query: "{results.query}"</p>
              </div>
              <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium border border-green-500/30">
                {Math.round(results.confidence * 100)}% Match
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-6 mb-6 border border-gray-700">
              <p className="text-gray-300 leading-relaxed text-lg">
                {results.answer}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Video</p>
                    <p className="text-gray-200 font-semibold">{results.video}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Timestamp</p>
                    <p className="text-gray-200 font-semibold">{results.timestamp}</p>
                  </div>
                </div>
                <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200">
                  Jump to Video
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Tips */}
        {!results && !isSearching && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700 hover:scale-[1.02] transition-transform duration-200 hover:cursor-pointer">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Ask Questions</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Use natural language to ask questions about course content
              </p>
            </div>

            <div className="bg-gray-800/40 rounded-lg hover:scale-[1.02] transition-transform duration-200 hover:cursor-pointer p-6 border border-gray-700">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Get Instant Results</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Receive precise answers with exact video timestamps in seconds
              </p>
            </div>

            <div className="bg-gray-800/40 rounded-lg hover:scale-[1.02] transition-transform duration-200 hover:cursor-pointer p-6 border border-gray-700">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Accurate Answers</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI-powered semantic search ensures relevant and accurate responses
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
