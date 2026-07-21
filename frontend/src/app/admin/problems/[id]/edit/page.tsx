'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import ProblemForm, { ProblemFormData, TestCase } from '@/components/ProblemForm';

export default function EditProblemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  
  const { data: problemData, isLoading } = useQuery({
    queryKey: ['adminProblem', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/problems/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  const handleSubmit = async (formData: ProblemFormData, testCases: TestCase[]) => {
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
          // @ts-ignore
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole={['ADMIN', 'INSTRUCTOR', 'PROBLEM_SETTER']}>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Edit Problem
          </h1>

          {problemData && (
            <ProblemForm
              initialData={{
                title: problemData.title || '',
                description: problemData.description || '',
                inputFormat: problemData.inputFormat || '',
                outputFormat: problemData.outputFormat || '',
                constraints: problemData.constraints || '',
                difficulty: problemData.difficulty || 'Easy',
                topics: problemData.topics ? problemData.topics.join(', ') : '',
                timeLimit: problemData.timeLimit || 2000,
                memoryLimit: problemData.memoryLimit || 256,
                isGlobal: problemData.isGlobal !== undefined ? problemData.isGlobal : true,
              }}
              initialTestCases={
                problemData.testCases && problemData.testCases.length > 0
                  ? problemData.testCases
                  : [{ input: '', expectedOutput: '', isPublic: true, points: 10 }]
              }
              onSubmit={handleSubmit}
              onCancel={() => router.push('/admin/problems')}
              loading={submitting}
              submitButtonText="Save Changes"
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
