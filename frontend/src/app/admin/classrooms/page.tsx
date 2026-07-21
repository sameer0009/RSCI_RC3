'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, School, KeyRound } from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  code: string;
  instructor: {
    username: string;
    fullName: string | null;
  };
  _count: {
    members: number;
    assignments: number;
  };
}

function AdminClassroomsContent() {
  const queryClient = useQueryClient();

  const { data: classrooms = [], isLoading: loading } = useQuery({
    queryKey: ['adminClassrooms'],
    queryFn: async () => {
      const { data } = await api.get('/classrooms');
      return data.data as Classroom[];
    },
    refetchInterval: 15000, // Poll every 15 seconds
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/classrooms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClassrooms'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this classroom?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete classroom:', error);
      alert('Failed to delete classroom');
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
                Classroom Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {classrooms.length} classroom{classrooms.length === 1 ? '' : 's'} across the platform
              </p>
            </div>
            <Link
              href="/admin/classrooms/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Create Classroom
            </Link>
          </div>

          {classrooms.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
                <School className="w-7 h-7 text-primary-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No classrooms yet</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Create a classroom to get started.</p>
            </div>
          ) : (
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Class Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {classrooms.map((classroom) => (
                  <tr key={classroom.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {classroom.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded font-mono text-xs text-gray-600 dark:text-gray-300">
                        <KeyRound className="w-3 h-3" /> {classroom.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{classroom.instructor.fullName || classroom.instructor.username}</div>
                      <div className="text-xs text-gray-500">@{classroom.instructor.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div>{classroom._count.members} students</div>
                      <div>{classroom._count.assignments} assignments</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/classrooms/${classroom.id}`}
                          title="Edit classroom"
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(classroom.id)}
                          title="Delete classroom"
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

export default function AdminClassroomsPage() {
  return (
    <ProtectedRoute requiredRole={['ADMIN']}>
      <AdminClassroomsContent />
    </ProtectedRoute>
  );
}
