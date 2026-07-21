'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
}

function CreateAssignmentContent() {
  const router = useRouter();
  const { id: classroomId } = useParams();
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const { data } = await api.get('/problems');
      setProblems(data.data.problems);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProblems.length === 0) {
      alert('Please select at least one problem');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/classrooms/${classroomId}/assignments`, {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        problemIds: selectedProblems,
      });
      router.push(`/classrooms/${classroomId}`);
    } catch (error: any) {
      console.error('Failed to create assignment:', error);
      alert(error.response?.data?.error?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const toggleProblem = (id: string) => {
    if (selectedProblems.includes(id)) {
      setSelectedProblems(selectedProblems.filter((p) => p !== id));
    } else {
      setSelectedProblems([...selectedProblems, id]);
    }
  };

  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Assignment</h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assignment Title</label>
                    <input
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="e.g., Week 1: Basic Algorithms"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="Provide instructions for the students..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                    <input
                      required
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Problems ({selectedProblems.length} selected)</h3>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search problems..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                      <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
                    {filteredProblems.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No problems found.</div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredProblems.map((problem) => (
                          <label
                            key={problem.id}
                            className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedProblems.includes(problem.id)}
                              onChange={() => toggleProblem(problem.id)}
                              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{problem.title}</p>
                              <div className="flex gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                  problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {problem.difficulty}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    type="submit"
                    className="px-8 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:transform-none transform active:scale-95"
                  >
                    {loading ? 'Creating...' : 'Create Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CreateAssignmentPage() {
  return (
    <ProtectedRoute requiredRole={['ADMIN', 'INSTRUCTOR', 'CONTEST_MANAGER']}>
      <CreateAssignmentContent />
    </ProtectedRoute>
  );
}
