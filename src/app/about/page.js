export default function About() {
  return (
    <div className="min-h-[80vh] px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-200 mb-4">
            About VideoAssistant  AI
          </h1>
          <p className="text-xl text-gray-400">
            Intelligent Course Content Search Powered by AI
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* What We Do */}
          <section className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              What We Do
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Sigma Course AI is an innovative platform that revolutionizes how you interact with 
              course content. Using advanced AI and RAG (Retrieval-Augmented Generation) technology, 
              we enable you to search through video lectures and instantly find the exact moments 
              where specific topics are discussed.
            </p>
          </section>

          {/* Features */}
          <section className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-200 mb-6">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🔍</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">
                    Intelligent Search
                  </h3>
                  <p className="text-gray-300">
                    Ask questions in natural language and get precise answers with video timestamps.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="text-2xl">⏱️</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">
                    Precise Timestamps
                  </h3>
                  <p className="text-gray-300">
                    Jump directly to the exact moment in videos where your question is answered.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="text-2xl">🎥</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">
                    Video Integration
                  </h3>
                  <p className="text-gray-300">
                    Seamlessly navigate through course videos with contextual understanding.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="text-2xl">📚</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">
                    Course Coverage
                  </h3>
                  <p className="text-gray-300">
                    Search across multiple course topics including DOM, JavaScript, Backend, and more.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              How It Works
            </h2>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 font-bold">1.</span>
                <p>
                  Course videos are processed and transcribed, creating a searchable knowledge base.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 font-bold">2.</span>
                <p>
                  Advanced embeddings and vector search technology enable semantic understanding of your queries.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 font-bold">3.</span>
                <p>
                  When you ask a question, our AI finds the most relevant video segments and provides exact timestamps.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 font-bold">4.</span>
                <p>
                  You can instantly jump to the relevant part of the video and continue learning.
                </p>
              </div>
            </div>
          </section>

          {/* Technology */}
          <section className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">
              Technology Stack
            </h2>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-blue-800/30 text-blue-300 rounded-lg text-sm font-medium">
                Next.js
              </span>
              <span className="px-4 py-2 bg-blue-800/30 text-blue-300 rounded-lg text-sm font-medium">
                React
              </span>
              <span className="px-4 py-2 bg-blue-800/30 text-blue-300 rounded-lg text-sm font-medium">
                RAG
              </span>
              <span className="px-4 py-2 bg-blue-800/30 text-blue-300 rounded-lg text-sm font-medium">
                FAISS
              </span>
              <span className="px-4 py-2 bg-blue-800/30 text-blue-300 rounded-lg text-sm font-medium">
                Vector Search
              </span>
              <span className="px-4 py-2 bg-blue-800/30 text-blue-300 rounded-lg text-sm font-medium">
                AI/ML
              </span>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-400">
          <p>
            Built with ❤️ to make learning more efficient and accessible.
          </p>
        </div>
      </div>
    </div>
  );
}