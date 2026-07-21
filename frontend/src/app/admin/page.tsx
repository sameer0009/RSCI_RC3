'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import {
  Users,
  FileText,
  Trophy,
  School,
  BarChart3,
  Medal,
  Activity,
  Award,
  type LucideIcon,
} from 'lucide-react';

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
    refetchInterval: 10000, // Poll every 10 seconds
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
        <div className="text-center max-w-sm px-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Please try refreshing the page.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        {/* Header band */}
        <div className="bg-primary-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-gold-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
              Admin Dashboard
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Platform overview</h1>
            <p className="text-primary-200 text-sm mt-1">
              Manage users, content, and monitor platform activity at a glance
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          {/* Quick Actions */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Manage
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <QuickAction href="/admin/users" icon={Users} label="Users" hint="Accounts" accent="text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400" />
              <QuickAction href="/admin/problems" icon={FileText} label="Problems" hint="Problem bank" accent="text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400" />
              <QuickAction href="/admin/competitions" icon={Trophy} label="Contests" hint="Events" accent="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" />
              <QuickAction href="/admin/classrooms" icon={School} label="Classes" hint="Learning" accent="text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400" />
              <QuickAction href="/admin/analytics" icon={BarChart3} label="Analytics" hint="Reports" accent="text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400" />
              <QuickAction href="/leaderboard" icon={Medal} label="Rankings" hint="Global board" accent="text-gold-600 bg-gold-50 dark:bg-gold-900/20 dark:text-gold-400" />
            </div>
          </section>

          {/* Overview Stats */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Overview
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <StatCard
                icon={Users}
                accent="text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400"
                label="Total Users"
                value={stats.overview.totalUsers}
                note={`${stats.overview.activeUsers} active (7d)`}
              />
              <StatCard
                icon={FileText}
                accent="text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400"
                label="Total Problems"
                value={stats.overview.totalProblems}
                note={stats.problemsByDifficulty.map((d) => `${d.difficulty} ${d.count}`).join(' · ')}
              />
              <StatCard
                icon={Activity}
                accent="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
                label="Total Submissions"
                value={stats.overview.totalSubmissions}
                note={`${stats.overview.acceptanceRate}% acceptance rate`}
              />
              <StatCard
                icon={Trophy}
                accent="text-gold-600 bg-gold-50 dark:bg-gold-900/20 dark:text-gold-400"
                label="Total Contests"
                value={stats.overview.totalContests}
                note={`${stats.overview.activeContests} currently active`}
              />
            </div>

            {/* Platform summary strip */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Active Contests</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.overview.activeContests}</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Active Classes</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.overview.activeClassrooms}</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2.5">
                  User Roles
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.usersByRole.map((item) => (
                    <span
                      key={item.role}
                      className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                    >
                      {item.role} · {item.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Submissions */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                Recent Submissions
              </h3>
              <div className="space-y-2.5">
                {stats.recentSubmissions.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No submissions yet.</p>
                )}
                {stats.recentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {sub.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {sub.problemTitle} • {sub.language}
                      </p>
                    </div>
                    <span
                      className={`ml-3 shrink-0 px-2 py-1 text-xs font-semibold rounded ${getVerdictColor(
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
            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-400" />
                Top Performers
              </h3>
              <div className="space-y-2.5">
                {stats.topPerformers.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No data yet.</p>
                )}
                {stats.topPerformers.map((user, index) => (
                  <div
                    key={user.username}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? 'bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400'
                            : index === 1
                            ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.problemsSolved} problems solved
                        </p>
                      </div>
                    </div>
                    <span className="ml-3 shrink-0 px-3 py-1 text-sm font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full">
                      {user.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  hint,
  accent,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  hint: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-center gap-2 p-4 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{label}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{hint}</p>
      </div>
    </Link>
  );
}

function StatCard({
  icon: Icon,
  accent,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  accent: string;
  label: string;
  value: number | string;
  note?: string;
}) {
  return (
    <div className="bg-white dark:bg-dark-card p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{label}</p>
      {note && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 truncate">{note}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole={['ADMIN']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
