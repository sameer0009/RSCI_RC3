'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, KeyRound } from 'lucide-react';

export default function ClassroomDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'CONTEST_MANAGER' || user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'assignments' | 'members' | 'leaderboard' | 'analytics'>('assignments');

  const { data: classroom, isLoading } = useQuery({
    queryKey: ['classroom', id],
    queryFn: async () => {
      const response = await api.get(`/classrooms/${id}`);
      return response.data.data;
    },
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['classroom', id, 'leaderboard'],
    queryFn: async () => {
      const response = await api.get(`/classrooms/${id}/leaderboard`);
      return response.data.data;
    },
    enabled: activeTab === 'leaderboard',
  });

  const { data: analytics } = useQuery({
    queryKey: ['classroom', id, 'analytics'],
    queryFn: async () => {
      const response = await api.get(`/classrooms/${id}/analytics`);
      return response.data.data;
    },
    enabled: activeTab === 'analytics' && isInstructor,
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8">
          <div className="max-w-7xl mx-auto h-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>
        </div>
      </>
    );
  }

  if (!classroom) return <div>Classroom not found</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        {/* Header */}
        <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{classroom.name}</h1>
                {classroom.description && (
                  <p className="text-gray-600 dark:text-gray-400">{classroom.description}</p>
                )}
              </div>
              {isInstructor && (
                <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 px-4 py-2.5 rounded-xl text-center shrink-0">
                  <div className="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
                    <KeyRound className="w-3 h-3" /> Invite Code
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-widest font-mono">{classroom.code}</div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mt-8 border-b border-gray-200 dark:border-gray-800">
              <button
                className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'assignments'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('assignments')}
              >
                Assignments
              </button>
              <button
                className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'members'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('members')}
              >
                Members ({classroom.members.length})
              </button>
              <button
                className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'leaderboard'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('leaderboard')}
              >
                Leaderboard
              </button>
              {isInstructor && (
                <button
                  className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
                    activeTab === 'analytics'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('analytics')}
                >
                  Instructor Analytics
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assignments</h2>
                {isInstructor && (
                  <Link
                    href={`/classrooms/${id}/assignments/create`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" /> New Assignment
                  </Link>
                )}
              </div>
              {classroom.assignments.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-12 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-gray-800">
                  No assignments yet.
                </div>
              ) : (
                classroom.assignments.map((assignment: any) => (
                  <Link
                    key={assignment.id}
                    href={`/classrooms/${id}/assignments/${assignment.id}`}
                    className="block bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{assignment.title}</h3>
                      <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {assignment.description && <p className="text-gray-600 dark:text-gray-400 mb-4">{assignment.description}</p>}
                    <div className="text-sm text-gray-500">
                      {assignment.problems.length} problems assigned
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {classroom.members.map((member: any) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                            {member.user.username[0].toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.user.fullName || member.user.username}
                            </div>
                            <div className="text-sm text-gray-500">@{member.user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problems Solved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Global Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {leaderboard?.map((entry: any, index: number) => (
                    <tr key={entry.user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">#{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {entry.user.fullName || entry.user.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">
                        {entry.problemsSolved}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.user.rating || 0}
                      </td>
                    </tr>
                  ))}
                  {(!leaderboard || leaderboard.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No leaderboard data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'analytics' && isInstructor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analytics?.map((data: any) => (
                <div key={data.student.id} className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                      {data.student.username[0].toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{data.student.fullName || data.student.username}</h3>
                      <p className="text-sm text-gray-500">@{data.student.username}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Total Attempts</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{data.totalAttempts}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Success Rate</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{data.successRate.toFixed(1)}%</div>
                    </div>
                  </div>

                  {data.strugglingTopics && data.strugglingTopics.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Struggling Topics:</div>
                      <div className="flex flex-wrap gap-2">
                        {data.strugglingTopics.map((topic: string) => (
                          <span key={topic} className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-full font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {(!analytics || analytics.length === 0) && (
                <div className="col-span-full text-center py-12 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                  No analytics data available yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
