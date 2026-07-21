'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { ContestStatus } from '@/types';
import { Calendar, Clock, Users, Trophy } from 'lucide-react';

interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: ContestStatus;
  _count: {
    participants: number;
  };
}

export default function ContestsPage() {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Active' | 'Ended'>('Active');

  const { data, isLoading } = useQuery({
    queryKey: ['contests', activeTab],
    queryFn: async () => {
      const res = await api.get(`/contests?status=${activeTab}`);
      return res.data.data.contests as Contest[];
    },
    refetchInterval: 20000, // Poll every 20 seconds
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
              Competitive Programming Contests
            </h1>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
              Compete globally, solve challenges, and climb the leaderboard.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
            <nav className="-mb-px flex space-x-8 justify-center">
              {['Active', 'Upcoming', 'Ended'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {tab} Contests
                </button>
              ))}
            </nav>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-gray-800 p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-4">
              {data.map((contest) => (
                <div
                  key={contest.id}
                  className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      <Link href={`/contests/${contest.id}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                        {contest.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {contest.description}
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(contest.startTime).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {contest.duration} mins
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> {contest._count?.participants || 0} participants
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      href={`/contests/${contest.id}`}
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                    >
                      {activeTab === 'Upcoming' ? 'Register' : activeTab === 'Ended' ? 'Virtual Participate' : 'Enter Contest'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
                <Trophy className="w-7 h-7 text-primary-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No {activeTab.toLowerCase()} contests found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Check back later for more competitions.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
