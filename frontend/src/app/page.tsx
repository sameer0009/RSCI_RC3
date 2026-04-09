'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-dark-bg dark:via-blue-950 dark:to-purple-950">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center animate-fade-in">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium">
                  🚀 Advanced Coding Platform
                </span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-100">
                RSCI-RC3
              </h1>
              <p className="text-2xl text-gray-300 mb-4">Master Programming Through Practice</p>
              <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
                Advanced coding competition platform with real-time analytics, global leaderboards,
                and multi-language code execution. Join thousands of developers improving their
                skills.
              </p>

              <div className="flex justify-center gap-4 flex-wrap">
                {isAuthenticated ? (
                  <Link
                    href="/problems"
                    className="px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl hover:from-primary-700 hover:to-blue-700 font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-glow"
                  >
                    Browse Problems →
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl hover:from-primary-700 hover:to-blue-700 font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-glow"
                    >
                      Get Started Free
                    </Link>
                    <Link
                      href="/login"
                      className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl hover:bg-white/20 font-semibold text-lg transition-all"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all transform hover:scale-105 animate-slide-up">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Practice Problems</h3>
              <p className="text-gray-400 leading-relaxed">
                Solve hundreds of coding problems across various difficulty levels, from beginner to
                advanced.
              </p>
            </div>

            <div
              className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all transform hover:scale-105 animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Compete & Win</h3>
              <p className="text-gray-400 leading-relaxed">
                Participate in timed contests, climb the global leaderboard, and earn recognition.
              </p>
            </div>

            <div
              className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all transform hover:scale-105 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Track Progress</h3>
              <p className="text-gray-400 leading-relaxed">
                Monitor your performance with detailed analytics and watch your skills improve over
                time.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-gray-400">Problems</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">10K+</div>
                <div className="text-gray-400">Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">8</div>
                <div className="text-gray-400">Languages</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-400">Available</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
