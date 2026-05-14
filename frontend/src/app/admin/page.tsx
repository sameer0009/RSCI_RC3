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
    activeContests: number;
    activeClassrooms: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Link
                href="/admin/users"
                className="p-4 bg-white dark:bg-dark-card rounded-lg shadow hover:shadow-lg transition-all border-t-4 border-purple-500 text-center"
              >
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Users</h3>
                <p className="text-xs text-gray-500 mt-1">Manage accounts</p>
              </Link>

              <Link
                href="/admin/problems"
                className="p-4 bg-white dark:bg-dark-card rounded-lg shadow hover:shadow-lg transition-all border-t-4 border-blue-500 text-center"
              >
                <div className="text-3xl mb-2">📝</div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Problems</h3>
                <p className="text-xs text-gray-500 mt-1">Manage bank</p>
              </Link>

              <Link
                href="/admin/competitions"
                className="p-4 bg-white dark:bg-dark-card rounded-lg shadow hover:shadow-lg transition-all border-t-4 border-green-500 text-center"
              >
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Contests</h3>
                <p className="text-xs text-gray-500 mt-1">Manage events</p>
              </Link>

              <Link
                href="/admin/classrooms"
                className="p-4 bg-white dark:bg-dark-card rounded-lg shadow hover:shadow-lg transition-all border-t-4 border-orange-500 text-center"
              >
                <div className="text-3xl mb-2">🏫</div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Classes</h3>
                <p className="text-xs text-gray-500 mt-1">Manage learning</p>
              </Link>

              <Link
                href="/admin/analytics"
                className="p-4 bg-white dark:bg-dark-card rounded-lg shadow hover:shadow-lg transition-all border-t-4 border-pink-500 text-center"
              >
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Analytics</h3>
                <p className="text-xs text-gray-500 mt-1">View reports</p>
              </Link>

              <Link
                href="/leaderboard"
                className="p-4 bg-white dark:bg-dark-card rounded-lg shadow hover:shadow-lg transition-all border-t-4 border-yellow-500 text-center"
              >
                <div className="text-3xl mb-2">🏅</div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Rankings</h3>
                <p className="text-xs text-gray-500 mt-1">Global board</p>
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
                Platform Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Active Contests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.overview.activeContests}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Active Classes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.overview.activeClassrooms}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">User Roles Breakdown</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.usersByRole.map(item => (
                      <span key={item.role} className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                        {item.role}: {item.count}
                      </span>
                    ))}
                  </div>
                </div>
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
    <ProtectedRoute requiredRole={['ADMIN']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
