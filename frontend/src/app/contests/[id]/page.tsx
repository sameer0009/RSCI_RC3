'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ContestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contestId = params.id as string;
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: contest, isLoading } = useQuery({
    queryKey: ['contest', contestId],
    queryFn: async () => {
      const res = await api.get(`/contests/${contestId}`);
      return res.data.data.contest;
    },
  });

  const { data: problems } = useQuery({
    queryKey: ['contestProblems', contestId],
    queryFn: async () => {
      const res = await api.get(`/contests/${contestId}/problems`);
      return res.data.data.problems;
    },
    enabled: !!contest && (contest.status === 'Active' || contest.status === 'Ended' || user?.role === 'ADMIN'),
    retry: false, // Don't retry if it fails (e.g., user not registered)
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/contests/${contestId}/register`);
    },
    onSuccess: () => {
      alert('Successfully registered!');
      queryClient.invalidateQueries({ queryKey: ['contest', contestId] });
      queryClient.invalidateQueries({ queryKey: ['contestProblems', contestId] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error?.message || 'Failed to register');
    },
  });

  const startVirtualMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/contests/${contestId}/virtual`);
    },
    onSuccess: () => {
      alert('Virtual contest started!');
      router.push(`/contests/${contestId}/problems`); // You can decide where this routes
    },
    onError: (err: any) => {
      alert(err.response?.data?.error?.message || 'Failed to start virtual contest');
    },
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8 animate-pulse">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </>
    );
  }

  if (!contest) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contest Not Found</h1>
            <Link href="/contests" className="text-primary-600 hover:underline mt-4 inline-block">
              Back to Contests
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white dark:bg-dark-card shadow rounded-lg p-8 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{contest.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <span className={`px-2 py-1 rounded font-semibold ${
                    contest.status === 'Active' ? 'bg-green-100 text-green-800' :
                    contest.status === 'Ended' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {contest.status}
                  </span>
                  <span>📅 {new Date(contest.startTime).toLocaleString()}</span>
                  <span>⏱️ {contest.duration} mins</span>
                  <span>👥 {contest._count?.participants || 0} participants</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {contest.status === 'Upcoming' && (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) router.push('/login');
                      else registerMutation.mutate();
                    }}
                    disabled={registerMutation.isPending}
                    className="px-6 py-2 bg-primary-600 text-white font-medium rounded hover:bg-primary-700 disabled:opacity-50"
                  >
                    {registerMutation.isPending ? 'Registering...' : 'Register Now'}
                  </button>
                )}
                
                {contest.status === 'Ended' && (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) router.push('/login');
                      else startVirtualMutation.mutate();
                    }}
                    disabled={startVirtualMutation.isPending}
                    className="px-6 py-2 bg-gray-800 text-white font-medium rounded hover:bg-gray-900 disabled:opacity-50 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300"
                  >
                    {startVirtualMutation.isPending ? 'Starting...' : 'Virtual Participate'}
                  </button>
                )}

                <Link
                  href={`/contests/${contestId}/leaderboard`}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-center"
                >
                  Leaderboard
                </Link>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mt-8">
              <h3>Description</h3>
              <p>{contest.description}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card shadow rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Problems</h2>
            
            {contest.status === 'Upcoming' && user?.role !== 'ADMIN' ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-4xl mb-4 block">🔒</span>
                <p className="text-gray-500 dark:text-gray-400">
                  Problems will be revealed when the contest starts.
                </p>
              </div>
            ) : problems ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {problems.map((problem: any, index: number) => (
                  <Link
                    key={problem.id}
                    href={`/contests/${contestId}/problems/${problem.slug}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-gray-400 w-8">{String.fromCharCode(65 + index)}</span>
                      <div>
                        <h3 className="font-semibold text-primary-600 dark:text-primary-400">{problem.title}</h3>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </Link>
                ))}
                {problems.length === 0 && (
                  <div className="p-4 text-center text-gray-500">No problems have been added to this contest yet.</div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  You must register to view problems.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
