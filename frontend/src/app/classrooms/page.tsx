'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import api from '@/lib/api';
import { School, Users, Plus, LogIn, KeyRound, type LucideIcon } from 'lucide-react';

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

  const totalStudents = isInstructor
    ? (classrooms || []).reduce((sum: number, cls: any) => sum + (cls._count?.members || 0), 0)
    : 0;
  const avgClassSize =
    isInstructor && classrooms?.length ? Math.round(totalStudents / classrooms.length) : 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        {/* Header band */}
        <div className="bg-primary-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-gold-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {isInstructor ? 'Instructor Dashboard' : 'Classrooms'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {isInstructor ? 'My Classrooms' : 'Enrolled Classes'}
              </h1>
            </div>
            <div className="flex gap-3 shrink-0">
              {!isInstructor && (
                <Link
                  href="/classrooms/join"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors font-medium text-sm"
                >
                  <LogIn className="w-4 h-4" /> Join Class
                </Link>
              )}
              {isInstructor && (
                <Link
                  href="/classrooms/create"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-primary-950 font-semibold rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Create Class
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Stats strip — instructors only, computed from already-loaded data */}
          {isInstructor && !isLoading && classrooms && classrooms.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <MiniStat icon={School} label="Classrooms" value={classrooms.length} accent="text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400" />
              <MiniStat icon={Users} label="Total Students" value={totalStudents} accent="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" />
              <MiniStat icon={Users} label="Avg. Class Size" value={avgClassSize} accent="text-gold-600 bg-gold-50 dark:bg-gold-900/20 dark:text-gold-400" />
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 p-4 rounded-lg text-sm">
              Failed to load classrooms.
            </div>
          ) : classrooms?.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
                <School className="w-7 h-7 text-primary-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No classes found</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                {isInstructor
                  ? "You haven't created any classrooms yet. Set one up to start assigning problems to your students."
                  : "You haven't joined any classrooms yet. Ask your instructor for a class code."}
              </p>
              <Link
                href={isInstructor ? '/classrooms/create' : '/classrooms/join'}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
              >
                {isInstructor ? <Plus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {isInstructor ? 'Create your first classroom' : 'Join a classroom'}
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                {isInstructor ? `${classrooms.length} Classroom${classrooms.length === 1 ? '' : 's'}` : 'Your Classes'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classrooms.map((cls: any) => {
                  const classroom = isInstructor ? cls : cls.classroom;
                  return (
                    <Link
                      key={classroom.id}
                      href={`/classrooms/${classroom.id}`}
                      className="group block bg-white dark:bg-dark-card rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-6 border border-gray-100 dark:border-gray-800"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                          <School className="w-5 h-5" />
                        </div>
                        {isInstructor && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-700 shrink-0">
                            <KeyRound className="w-3 h-3" /> {classroom.code}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                        {classroom.name}
                      </h3>
                      {classroom.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {classroom.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-50 dark:border-gray-800">
                        <Users className="w-3.5 h-3.5" />
                        {isInstructor
                          ? `${classroom._count?.members || 0} students`
                          : `${classroom.instructor?.fullName || classroom.instructor?.username}`}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="bg-white dark:bg-dark-card p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}
