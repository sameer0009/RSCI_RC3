'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, Trophy, Users } from 'lucide-react';

interface Contest {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'Upcoming' | 'Active' | 'Ended';
  _count: {
    participants: number;
  };
}

function AdminCompetitionsContent() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const { data } = await api.get('/contests');
      setContests(data.data.contests);
    } catch (error) {
      console.error('Failed to fetch contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contest?')) return;
    try {
      await api.delete(`/contests/${id}`);
      fetchContests();
    } catch (error) {
      console.error('Failed to delete contest:', error);
      alert('Failed to delete contest');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Competition Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {contests.length} contest{contests.length === 1 ? '' : 's'} · create and manage events
              </p>
            </div>
            <Link
              href="/admin/competitions/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Create Contest
            </Link>
          </div>

          {contests.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
                <Trophy className="w-7 h-7 text-primary-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No contests yet</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Create your first contest to get started.</p>
            </div>
          ) : (
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contest Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Timing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {contests.map((contest) => (
                  <tr key={contest.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {contest.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          contest.status === 'Active'
                            ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                            : contest.status === 'Upcoming'
                            ? 'text-primary-700 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'
                            : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {contest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div>Start: {new Date(contest.startTime).toLocaleString()}</div>
                      <div>End: {new Date(contest.endTime).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {contest._count.participants}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/competitions/${contest.id}`}
                          title="Edit contest"
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(contest.id)}
                          title="Delete contest"
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminCompetitionsPage() {
  return (
    <ProtectedRoute requiredRole={['ADMIN', 'CONTEST_MANAGER']}>
      <AdminCompetitionsContent />
    </ProtectedRoute>
  );
}
