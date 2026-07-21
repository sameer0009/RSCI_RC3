'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, Users, Lock, Trophy } from 'lucide-react';

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
          
          <div className="bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800 rounded-xl p-8 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">{contest.title}</h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className={`px-2.5 py-1 rounded-full font-semibold text-xs ${
                    contest.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' :
                    contest.status === 'Ended' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                    'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400'
                  }`}>
                    {contest.status}
                  </span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(contest.startTime).toLocaleString()}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {contest.duration} mins</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {contest._count?.participants || 0} participants</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                {contest.status === 'Upcoming' && (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) router.push('/login');
                      else registerMutation.mutate();
                    }}
                    disabled={registerMutation.isPending}
                    className="px-6 py-2.5 bg-primary-600 text-white font-medium text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
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
                    className="px-6 py-2.5 bg-gray-800 text-white font-medium text-sm rounded-lg hover:bg-gray-900 disabled:opacity-50 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300 transition-colors"
                  >
                    {startVirtualMutation.isPending ? 'Starting...' : 'Virtual Participate'}
                  </button>
                )}

                <Link
                  href={`/contests/${contestId}/leaderboard`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                >
                  <Trophy className="w-4 h-4" /> Leaderboard
                </Link>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mt-8 prose-headings:text-base prose-headings:font-semibold">
              <h3>Description</h3>
              <p>{contest.description}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800 rounded-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Problems</h2>

            {contest.status === 'Upcoming' && user?.role !== 'ADMIN' ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                <div className="mx-auto w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Problems will be revealed when the contest starts.
                </p>
              </div>
            ) : problems ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                {problems.map((problem: any, index: number) => (
                  <Link
                    key={problem.id}
                    href={`/contests/${contestId}/problems/${problem.slug}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-gray-300 dark:text-gray-600 w-8">{String.fromCharCode(65 + index)}</span>
                      <div>
                        <h3 className="font-semibold text-primary-600 dark:text-primary-400 text-sm">{problem.title}</h3>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </Link>
                ))}
                {problems.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No problems have been added to this contest yet.</div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
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
