'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface LeaderboardUser {
  id: string;
  username: string;
  rank: number;
  problemsSolved: number;
  totalSubmissions: number;
  rating: number;
  accuracy: string;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLeaderboard = async () => {
    const { data } = await api.get(`/leaderboard?page=${currentPage}&limit=50`);
    return {
      users: data.data.users as LeaderboardUser[],
      totalPages: data.data.pages as number,
    };
  };

  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['leaderboard', currentPage],
    queryFn: fetchLeaderboard,
  });

  const users = data?.users || [];
  const totalPages = data?.totalPages || 1;

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🏆 Global Leaderboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Top performers ranked by problems solved and rating
            </p>
          </div>

          {loading ? (
            <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left">Rank</th>
                      <th className="px-6 py-3 text-left">Username</th>
                      <th className="px-6 py-3 text-center">Problems Solved</th>
                      <th className="px-6 py-3 text-center">Total Submissions</th>
                      <th className="px-6 py-3 text-center">Accuracy</th>
                      <th className="px-6 py-3 text-center">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div></td>
                        <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                        <td className="px-6 py-4 flex justify-center"><div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div></td>
                        <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div></td>
                        <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div></td>
                        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Error loading leaderboard. Please try again.
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Problems Solved
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Submissions
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Accuracy
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((leaderboardUser) => (
                        <tr
                          key={leaderboardUser.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            user?.id === leaderboardUser.id
                              ? 'bg-primary-50 dark:bg-primary-900/20'
                              : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-2xl mr-2">
                                {getMedalIcon(leaderboardUser.rank)}
                              </span>
                              {leaderboardUser.rank > 3 && (
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  #{leaderboardUser.rank}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {leaderboardUser.username}
                                {user?.id === leaderboardUser.id && (
                                  <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
                                    (You)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {leaderboardUser.problemsSolved}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {leaderboardUser.totalSubmissions}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {leaderboardUser.accuracy}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                              {leaderboardUser.rating}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
