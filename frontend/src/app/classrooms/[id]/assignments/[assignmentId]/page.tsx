'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import api from '@/lib/api';

export default function AssignmentDetailPage() {
  const { id: classroomId, assignmentId } = useParams();
  const { user } = useAuth();
  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'CONTEST_MANAGER' || user?.role === 'ADMIN';

  const { data: progressData, isLoading } = useQuery({
    queryKey: ['classroom', classroomId, 'assignment', assignmentId, 'progress'],
    queryFn: async () => {
      const response = await api.get(`/classrooms/assignments/${assignmentId}/progress`);
      return response.data.data;
    },
    enabled: isInstructor,
  });

  // Students will just see the assignment details without progress tracking for everyone
  const { data: assignmentData } = useQuery({
    queryKey: ['classroom', classroomId, 'assignment', assignmentId, 'progress'],
    queryFn: async () => {
      const response = await api.get(`/classrooms/assignments/${assignmentId}/progress`);
      return response.data.data;
    },
    enabled: isInstructor, // For now, we only show this page for instructors fully
  });

  // If student, we only need assignment info + their own progress
  // Wait, our backend endpoint `/classrooms/assignments/:assignmentId/progress` was guarded by `authorize('INSTRUCTOR', 'CONTEST_MANAGER', 'ADMIN')`.
  // Oh, I made the endpoint `router.get('/assignments/:assignmentId/progress', authorize(...), classroomController.getAssignmentProgress);` in backend!
  // So a student cannot access it.
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>
          ) : isInstructor && assignmentData ? (
            <>
              <div className="mb-8">
                <Link href={`/classrooms/${classroomId}`} className="text-primary-600 hover:text-primary-700 mb-4 inline-block font-medium">
                  ← Back to Classroom
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{assignmentData.assignment.title}</h1>
                {assignmentData.assignment.description && <p className="text-gray-600 dark:text-gray-400 mb-2">{assignmentData.assignment.description}</p>}
                <div className="text-sm font-medium px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 inline-block rounded-full">
                  Due: {new Date(assignmentData.assignment.dueDate).toLocaleString()}
                </div>
              </div>

              <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Progress Tracking</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        {assignmentData.assignment.problems.map((p: any) => (
                          <th key={p.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {p.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {assignmentData.progress.map((prog: any) => (
                        <tr key={prog.student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {prog.student.fullName || prog.student.username}
                            </div>
                            <div className="text-sm text-gray-500">@{prog.student.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[100px]">
                                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${(prog.solvedCount / prog.totalProblems) * 100}%` }}></div>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{prog.solvedCount}/{prog.totalProblems}</span>
                            </div>
                          </td>
                          {assignmentData.assignment.problems.map((p: any) => {
                            const isSolved = prog.solvedProblemIds.includes(p.id);
                            return (
                              <td key={p.id} className="px-6 py-4 whitespace-nowrap text-center">
                                {isSolved ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600">
                                    -
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-dark-card rounded-lg shadow p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Assignment View (Student)</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Student specific assignment view would be displayed here.</p>
              <Link href={`/classrooms/${classroomId}`} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Back to Classroom
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
