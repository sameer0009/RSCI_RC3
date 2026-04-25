'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function ContestLeaderboardPage() {
  const params = useParams();
  const contestId = params.id as string;

  const { data: contest, isLoading: loadingContest } = useQuery({
    queryKey: ['contest', contestId],
    queryFn: async () => {
      const res = await api.get(`/contests/${contestId}`);
      return res.data.data.contest;
    },
  });

  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['contestLeaderboard', contestId],
    queryFn: async () => {
      const res = await api.get(`/contests/${contestId}/leaderboard`);
      return res.data.data.leaderboard;
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });

  if (loadingContest || loadingLeaderboard) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8 animate-pulse">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Leaderboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {contest?.title}
              </p>
            </div>
            <Link
              href={`/contests/${contestId}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Back to Contest
            </Link>
          </div>

          <div className="bg-white dark:bg-dark-card shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-[#1a1a1a]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Participant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Penalty (mins)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-800">
                  {leaderboard && leaderboard.length > 0 ? (
                    leaderboard.map((participant: any, index: number) => (
                      <tr key={participant.userId} className={index % 2 === 0 ? 'bg-white dark:bg-dark-card' : 'bg-gray-50 dark:bg-gray-800/30'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                              {participant.user.username[0].toUpperCase()}
                            </div>
                            <Link href={`/profile/${participant.user.username}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                              {participant.user.username}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                          {participant.totalPoints}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {participant.penalty}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No participants or submissions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
