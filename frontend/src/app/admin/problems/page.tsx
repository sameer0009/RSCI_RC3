'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, FileText } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  acceptanceRate: number;
  _count: {
    testCases: number;
    submissions: number;
  };
}

function AdminProblemsContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState<string | null>(null);

  const { data: problems = [], isLoading: loading } = useQuery({
    queryKey: ['adminProblems', search, difficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (difficulty) params.append('difficulty', difficulty);

      const { data } = await api.get(`/admin/problems?${params.toString()}`);
      return data.data.problems as Problem[];
    },
    refetchInterval: 15000, // Poll every 15 seconds
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/problems/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProblems'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      setShowDeleteDialog(false);
      setProblemToDelete(null);
    },
  });

  const handleDelete = async () => {
    if (!problemToDelete) return;
    try {
      await deleteMutation.mutateAsync(problemToDelete);
    } catch (error) {
      console.error('Failed to delete problem:', error);
      alert('Failed to delete problem');
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
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
                Problem Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {problems.length} problem{problems.length === 1 ? '' : 's'} in the bank
              </p>
            </div>
            <Link
              href="/admin/problems/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Create Problem
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3 bg-white dark:bg-dark-card p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Problems Table */}
          {problems.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-primary-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No problems found</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Test Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acceptance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {problems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {problem.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {problem.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {problem._count.testCases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {problem._count.submissions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {problem.acceptanceRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/problems/${problem.id}/edit`}
                          title="Edit problem"
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setProblemToDelete(problem.id);
                            setShowDeleteDialog(true);
                          }}
                          title="Delete problem"
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="w-11 h-11 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Problem</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this problem? This will also delete all associated
              test cases and submissions. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setProblemToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminProblemsPage() {
  return (
    <ProtectedRoute requiredRole={['ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER']}>
      <AdminProblemsContent />
    </ProtectedRoute>
  );
}
