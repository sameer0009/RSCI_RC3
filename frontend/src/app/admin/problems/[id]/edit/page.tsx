'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface TestCase {
  id?: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  points: number;
}

export default function EditProblemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    topics: '',
    timeLimit: 2000,
    memoryLimit: 256,
  });
  
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  const { data: problemData, isLoading } = useQuery({
    queryKey: ['adminProblem', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/problems/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (problemData) {
      setFormData({
        title: problemData.title || '',
        description: problemData.description || '',
        inputFormat: problemData.inputFormat || '',
        outputFormat: problemData.outputFormat || '',
        constraints: problemData.constraints || '',
        difficulty: problemData.difficulty || 'Easy',
        topics: problemData.topics ? problemData.topics.join(', ') : '',
        timeLimit: problemData.timeLimit || 2000,
        memoryLimit: problemData.memoryLimit || 256,
      });
      if (problemData.testCases && problemData.testCases.length > 0) {
        setTestCases(problemData.testCases);
      } else {
        setTestCases([{ input: '', expectedOutput: '', isPublic: true, points: 10 }]);
      }
    }
  }, [problemData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const topicsArray = formData.topics
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      await api.put(`/admin/problems/${id}`, {
        ...formData,
        topics: topicsArray,
        testCases: testCases
          .filter((tc) => (tc.input || '').trim() !== '' || (tc.expectedOutput || '').trim() !== '')
          .map(({ id: tcId, ...rest }) => (tcId ? { id: tcId, ...rest } : rest)),
      });

      queryClient.invalidateQueries({ queryKey: ['adminProblems'] });
      queryClient.invalidateQueries({ queryKey: ['adminProblem', id] });

      alert('Problem updated successfully!');
      router.push('/admin/problems');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to update problem');
    } finally {
      setSubmitting(false);
    }
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isPublic: false, points: 10 }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (
    index: number,
    field: keyof TestCase,
    value: string | boolean | number
  ) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Edit Problem
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty *
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value as any })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Topics (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.topics}
                      onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                      placeholder="arrays, strings, dynamic-programming"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Input Format *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.inputFormat}
                    onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Output Format *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.outputFormat}
                    onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Constraints *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.constraints}
                    onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Test Cases</h2>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + Add Test Case
                </button>
              </div>

              <div className="space-y-4">
                {testCases.map((tc, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Test Case {index + 1}
                      </h3>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Input
                        </label>
                        <textarea
                          rows={3}
                          value={tc.input}
                          onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expected Output
                        </label>
                        <textarea
                          rows={3}
                          value={tc.expectedOutput}
                          onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={tc.isPublic}
                            onChange={(e) => updateTestCase(index, 'isPublic', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Public (visible to users)
                          </span>
                        </label>

                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-700 dark:text-gray-300">
                            Points:
                          </label>
                          <input
                            type="number"
                            value={tc.points}
                            onChange={(e) =>
                              updateTestCase(index, 'points', parseInt(e.target.value) || 10)
                            }
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/admin/problems')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
