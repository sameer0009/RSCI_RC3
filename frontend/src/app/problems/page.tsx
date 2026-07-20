'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  acceptanceRate: number;
  isSolved?: boolean;
}

export default function ProblemsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    difficulty: '',
    search: '',
    topic: '',
  });

  const fetchProblems = async () => {
    const params = new URLSearchParams();
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.search) params.append('search', filters.search);
    if (filters.topic) params.append('topic', filters.topic);
    
    const { data } = await api.get(`/problems?${params.toString()}`);
    return data.data.problems as Problem[];
  };

  const { data: problems = [], isLoading: loading, error } = useQuery({
    queryKey: ['problems', filters],
    queryFn: fetchProblems,
  });

  const fetchDailyChallenge = async () => {
    const { data } = await api.get('/problems?limit=100');
    const allProblems = data.data.problems as Problem[];
    if (!allProblems || allProblems.length === 0) return null;
    
    const today = new Date();
    const index = (today.getFullYear() * 365 + today.getMonth() * 31 + today.getDate()) % allProblems.length;
    return allProblems[index];
  };

  const { data: dailyChallenge, isLoading: dailyLoading } = useQuery({
    queryKey: ['dailyChallenge'],
    queryFn: fetchDailyChallenge,
  });

  const availableTopics = Array.from(
    new Set(problems.flatMap((p) => p.topics || []))
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'Hard':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!dailyLoading && dailyChallenge && (
            <div className="mb-8 p-6 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-xl text-white relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-3xl shadow-inner">
                    🔥
                  </div>
                  <div>
                    <span className="text-white/80 text-sm font-bold uppercase tracking-wider block mb-1">
                      Daily Challenge
                    </span>
                    <h2 className="text-2xl font-black text-white">{dailyChallenge.title}</h2>
                    <div className="flex gap-3 mt-2 text-sm font-medium">
                      <span className={
                        dailyChallenge.difficulty === 'Easy' ? 'text-green-300' :
                        dailyChallenge.difficulty === 'Medium' ? 'text-yellow-300' :
                        'text-red-300'
                      }>● {dailyChallenge.difficulty}</span>
                      {dailyChallenge.topics && dailyChallenge.topics.length > 0 && (
                        <span className="text-white/70">{dailyChallenge.topics.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/problems/${dailyChallenge.slug}`}
                  className="px-6 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-50 hover:shadow-lg transition-all transform hover:-translate-y-1"
                >
                  Solve Now
                </Link>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Problems</h1>

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search problems..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {availableTopics.length > 0 && (
                <select
                  value={filters.topic}
                  onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Topics</option>
                  {availableTopics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {filters.topic && (
              <div className="mt-3 flex gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                  Topic: {filters.topic}
                  <button
                    onClick={() => setFilters({ ...filters, topic: '' })}
                    className="hover:text-primary-900 dark:hover:text-primary-100"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Title</th>
                    <th className="px-6 py-3 text-left">Difficulty</th>
                    <th className="px-6 py-3 text-left">Acceptance</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Error loading problems. Please try again.
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acceptance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {problems.map((problem) => (
                    <tr key={problem.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {problem.isSolved ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-400">○</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/problems/${problem.slug}`}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {problem.title}
                        </Link>
                        <div className="flex gap-2 mt-1">
                          {problem.topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(problem.acceptanceRate * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
