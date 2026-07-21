'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import api from '@/lib/api';
import { CheckCircle, Clock, Lock, Edit2, Trash2 } from 'lucide-react';

export default function AssignmentDetailPage() {
  const router = useRouter();
  const { id: classroomId, assignmentId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const isInstructor = user ? ['ADMIN', 'INSTRUCTOR', 'CONTEST_MANAGER'].includes(user.role) : false;

  const { data: progressData, isLoading: loadingProgress, error: progressError } = useQuery<any, any>({
    queryKey: ['classroom', classroomId, 'assignment', assignmentId, 'progress'],
    queryFn: async () => {
      const response = await api.get(`/classrooms/assignments/${assignmentId}/progress`);
      return response.data.data;
    },
    enabled: !authLoading && !!isInstructor,
  });
  
  const { data: studentData, isLoading: loadingStudent, error: studentError } = useQuery<any, any>({
    queryKey: ['classroom', classroomId, 'assignment', assignmentId, 'details'],
    queryFn: async () => {
      const response = await api.get(`/classrooms/assignments/${assignmentId}`);
      return response.data.data;
    },
    enabled: !authLoading && !isInstructor,
  });

  const queryClient = useQueryClient();
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  const handleSubmitAssignment = async () => {
    if (!window.confirm('Are you sure you want to submit this assignment? Once submitted, your work will be finalized for grading.')) return;
    
    setSubmittingAssignment(true);
    try {
      await api.post(`/classrooms/assignments/${assignmentId}/submit`);
      queryClient.invalidateQueries({ queryKey: ['classroom', classroomId, 'assignment', assignmentId] });
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to submit assignment');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/classrooms/assignments/${assignmentId}`);
      router.push(`/classrooms/${classroomId}`);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to delete assignment');
    }
  };

  const isLoading = authLoading || (isInstructor ? loadingProgress : loadingStudent);
  const apiError = isInstructor 
    ? (progressError as any)?.response?.data?.error?.message 
    : (studentError as any)?.response?.data?.error?.message;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>
          ) : isInstructor && progressData ? (
            <>
              <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                  <Link href={`/classrooms/${classroomId}`} className="text-primary-600 hover:text-primary-700 font-medium">
                    ← Back to Classroom
                  </Link>
                  <div className="flex gap-2">
                    <Link 
                      href={`/classrooms/${classroomId}/assignments/${assignmentId}/edit`}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium shadow-sm"
                    >
                      <Edit2 size={16} /> Edit
                    </Link>
                    <button 
                      onClick={handleDeleteAssignment}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium shadow-sm"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{progressData.assignment.title}</h1>
                {progressData.assignment.description && <p className="text-gray-600 dark:text-gray-400 mb-2">{progressData.assignment.description}</p>}
                <div className="text-sm font-medium px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 inline-block rounded-full">
                  Due: {new Date(progressData.assignment.dueDate).toLocaleString()}
                </div>
              </div>

              <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Progress Tracking</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        {progressData.assignment.problems.map((p: any) => (
                          <th key={p.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {p.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {progressData.progress.map((prog: any) => (
                        <tr key={prog.student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {prog.student.fullName || prog.student.username}
                            </div>
                            <div className="text-sm text-gray-500">@{prog.student.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {prog.isSubmitted ? (
                              <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md">
                                SUBMITTED
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-md">
                                IN PROGRESS
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[100px]">
                                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${(prog.solvedCount / prog.totalProblems) * 100}%` }}></div>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{prog.solvedCount}/{prog.totalProblems}</span>
                            </div>
                          </td>
                          {progressData.assignment.problems.map((p: any) => {
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
          ) : studentData ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <Link href={`/classrooms/${classroomId}`} className="text-primary-600 hover:text-primary-700 mb-4 inline-block font-medium">
                  ← Back to Classroom
                </Link>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{studentData.title}</h1>
                    {studentData.description && <p className="text-gray-600 dark:text-gray-400 mb-2">{studentData.description}</p>}
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <div className="flex flex-col items-end">
                      <div className="text-sm font-medium px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-full mb-1 flex items-center gap-1.5">
                        <Clock size={14} /> Due: {new Date(studentData.dueDate).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {studentData.solvedProblemIds.length} / {studentData.problems.length} Solved
                      </div>
                    </div>

                    {studentData.userSubmission ? (
                      <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-bold flex items-center gap-2 border border-green-200 dark:border-green-800/50 shadow-sm">
                        <CheckCircle size={18} /> Assignment Submitted
                      </div>
                    ) : (
                      <button
                        onClick={handleSubmitAssignment}
                        disabled={submittingAssignment}
                        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-lg shadow-primary-500/20 transition-all transform active:scale-95"
                      >
                        {submittingAssignment ? 'Submitting...' : 'Final Submission'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {studentData.problems.map((problem: any) => {
                  const isSolved = studentData.solvedProblemIds.includes(problem.id);
                  return (
                    <Link
                      key={problem.id}
                      href={studentData.userSubmission ? '#' : `/problems/${problem.slug || problem.id}`}
                      className={`block bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border-2 transition-all ${
                        studentData.userSubmission 
                          ? 'opacity-80 cursor-default border-gray-100 dark:border-gray-800' 
                          : isSolved 
                            ? 'border-green-500/50 dark:border-green-500/30 bg-green-50/30 dark:bg-green-900/5 hover:shadow-md' 
                            : 'border-transparent hover:border-primary-500/50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          {studentData.userSubmission ? (
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                              <Lock size={18} />
                            </div>
                          ) : isSolved ? (
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                              ✓
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                              {problem.title[0]}
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{problem.title}</h3>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {problem.difficulty}
                              </span>
                              {problem.topics.slice(0, 2).map((topic: string) => (
                                <span key={topic} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className={`font-medium flex items-center gap-1 ${studentData.userSubmission ? 'text-gray-400' : 'text-primary-600'}`}>
                          {studentData.userSubmission ? 'Locked' : isSolved ? 'Re-solve' : 'Solve'} <span className="text-xl">→</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {apiError || 'Access Denied'}
              </h2>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                {isInstructor && !progressData ? 'We couldn\'t load the tracking data. You may not be the instructor for this class.' : 
                 !isInstructor && !studentData ? 'You might not be a member of this classroom or the assignment was removed.' : 
                 'Something went wrong while fetching the data.'}
              </p>
              <div className="text-xs text-gray-400 mb-8 font-mono bg-gray-50 dark:bg-gray-800/50 p-2 rounded inline-block">
                Assignment ID: {assignmentId}
              </div>
              <br />
              <Link href={`/classrooms/${classroomId}`} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Return to Classroom
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
