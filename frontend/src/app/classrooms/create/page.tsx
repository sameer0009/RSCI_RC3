'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { School } from 'lucide-react';

export default function CreateClassroomPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      if (!isAdmin) return [];
      const response = await api.get('/admin/users?role=INSTRUCTOR');
      // Also get CONTEST_MANAGERs as they can be instructors
      const response2 = await api.get('/admin/users?role=CONTEST_MANAGER');
      return [...response.data.data, ...response2.data.data];
    },
    enabled: isAdmin,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const payload: any = { 
        name: name.trim(), 
        description: description.trim() 
      };
      
      if (isAdmin && selectedInstructorId) {
        payload.instructorId = selectedInstructorId;
      }

      const response = await api.post('/classrooms', payload);
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      router.push(`/classrooms/${response.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create classroom.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
              <School className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create a Classroom</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Set up a new class. A unique join code will be generated automatically.
            </p>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Classroom Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g. Data Structures 101"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (Optional)
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Brief description of the course..."
              />
            </div>

            {isAdmin && (
              <div>
                <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assign Instructor
                </label>
                <select
                  id="instructor"
                  value={selectedInstructorId}
                  onChange={(e) => setSelectedInstructorId(e.target.value)}
                  required={isAdmin}
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select an instructor</option>
                  {instructors?.map((instructor: any) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.fullName || instructor.username} ({instructor.role})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  As an ADMIN, you must assign an instructor to this classroom.
                </p>
              </div>
            )}

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Classroom'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/classrooms')}
              className="w-full mt-3 flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
