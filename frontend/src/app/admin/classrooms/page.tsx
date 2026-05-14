'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

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
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Classroom Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Manage virtual classrooms and instructors</p>
            </div>
            <Link
              href="/admin/classrooms/create"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              Create Classroom
            </Link>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
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
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                {classrooms.map((classroom) => (
                  <tr key={classroom.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {classroom.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm">
                        {classroom.code}
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <Link
                        href={`/admin/classrooms/${classroom.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(classroom.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
