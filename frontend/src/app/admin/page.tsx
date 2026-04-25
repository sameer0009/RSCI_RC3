'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalProblems: number;
    totalSubmissions: number;
    totalContests: number;
    activeUsers: number;
    acceptanceRate: string;
  };
  problemsByDifficulty: Array<{ difficulty: string; count: number }>;
  submissionsByVerdict: Array<{ verdict: string; count: number }>;
  recentSubmissions: Array<{
    id: string;
    username: string;
    problemTitle: string;
    language: string;
    verdict: string;
    submittedAt: string;
  }>;
  topPerformers: Array<{
    username: string;
    problemsSolved: number;
    rating: number;
  }>;
}

function AdminDashboardContent() {
  const fetchStats = async () => {
    const { data } = await api.get('/analytics/dashboard');
    return data.data as DashboardStats;
  };

  const { data: stats, isLoading: loading, error } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: fetchStats,
  });

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Accepted':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'WrongAnswer':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'TimeLimitExceeded':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'RuntimeError':
      case 'CompilationError':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8 animate-pulse">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
            <div className="col-span-2 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Failed to load dashboard
          </h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  📊 Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Platform analytics and management
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Link
                href="/admin/problems"
                className="p-4 bg-white dark:bg-dark-card rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-blue-500"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📝</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Problems</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage problems</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/users"
                className="p-4 bg-white dark:bg-dark-card rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-green-500"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">👥</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Users</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage users</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/analytics"
                className="p-4 bg-white dark:bg-dark-card rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-purple-500"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📈</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Analytics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View charts</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/leaderboard"
                className="p-4 bg-white dark:bg-dark-card rounded-lg shadow hover:shadow-lg transition-all border-l-4 border-yellow-500"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🏆</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Leaderboard</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View rankings</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.overview.totalUsers}
                  </p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                {stats.overview.activeUsers} active (7 days)
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Problems</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.overview.totalProblems}
                  </p>
                </div>
                <div className="text-4xl">📝</div>
              </div>
              <div className="mt-2 flex gap-2">
                {stats.problemsByDifficulty.map((item) => (
                  <span key={item.difficulty} className="text-xs text-gray-600 dark:text-gray-400">
                    {item.difficulty}: {item.count}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.overview.totalSubmissions}
                  </p>
                </div>
                <div className="text-4xl">💻</div>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                {stats.overview.acceptanceRate}% acceptance rate
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Contests</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.overview.totalContests}
                  </p>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Submissions by Verdict
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.submissionsByVerdict.map((item) => (
                  <div key={item.verdict} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.verdict}</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Submissions */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Submissions
              </h3>
              <div className="space-y-3">
                {stats.recentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {sub.username}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {sub.problemTitle} • {sub.language}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${getVerdictColor(
                        sub.verdict
                      )}`}
                    >
                      {sub.verdict}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Performers
              </h3>
              <div className="space-y-3">
                {stats.topPerformers.map((user, index) => (
                  <div
                    key={user.username}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.problemsSolved} problems solved
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-sm font-semibold bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 rounded-full">
                      {user.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
