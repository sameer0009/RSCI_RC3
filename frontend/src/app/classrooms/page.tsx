'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import api from '@/lib/api';

export default function ClassroomsPage() {
  const { user } = useAuth();
  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'CONTEST_MANAGER' || user?.role === 'ADMIN';

  const { data: classrooms, isLoading, error } = useQuery({
    queryKey: ['classrooms'],
    queryFn: async () => {
      const response = await api.get('/classrooms');
      return response.data.data;
    },
    refetchInterval: 15000, // Poll every 15 seconds
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isInstructor ? 'My Classrooms' : 'Enrolled Classes'}
            </h1>
            <div className="flex gap-4">
              {!isInstructor && (
                <Link
                  href="/classrooms/join"
                  className="px-4 py-2 bg-white dark:bg-dark-card text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Join Class
                </Link>
              )}
              {isInstructor && (
                <Link
                  href="/classrooms/create"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Class
                </Link>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500 bg-red-100 p-4 rounded-lg">Failed to load classrooms.</div>
          ) : classrooms?.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-dark-card rounded-lg shadow">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">No classes found</h2>
              <p className="text-gray-500 mb-6">
                {isInstructor ? "You haven't created any classrooms yet." : "You haven't joined any classrooms yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((cls: any) => {
                const classroom = isInstructor ? cls : cls.classroom;
                return (
                  <Link
                    key={classroom.id}
                    href={`/classrooms/${classroom.id}`}
                    className="block bg-white dark:bg-dark-card rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-gray-800"
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{classroom.name}</h3>
                    {classroom.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {classroom.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{isInstructor ? `${classroom._count?.members || 0} Students` : `Instructor: ${classroom.instructor?.fullName || classroom.instructor?.username}`}</span>
                      {isInstructor && <span>Code: {classroom.code}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
