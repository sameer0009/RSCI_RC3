'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import ProblemForm, { ProblemFormData, TestCase } from '@/components/ProblemForm';

export default function CreateProblemPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: ProblemFormData, testCases: TestCase[]) => {
    setLoading(true);

    try {
      const topicsArray = formData.topics
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      await api.post('/admin/problems', {
        ...formData,
        topics: topicsArray,
        testCases: testCases.filter(
          (tc) => (tc.input || '').trim() !== '' || (tc.expectedOutput || '').trim() !== ''
        ),
      });

      queryClient.invalidateQueries({ queryKey: ['adminProblems'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });

      alert('Problem created successfully!');
      router.push('/admin/problems');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to create problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Create New Problem
          </h1>

          <ProblemForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin/problems')}
            loading={loading}
            submitButtonText="Create Problem"
          />
        </div>
      </div>
    </>
  );
}
