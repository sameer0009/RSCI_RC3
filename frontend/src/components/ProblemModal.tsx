import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import ProblemForm, { ProblemFormData, TestCase } from './ProblemForm';

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (problemId: string) => void;
}

export default function ProblemModal({ isOpen, onClose, onSuccess }: ProblemModalProps) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleSubmit = async (formData: ProblemFormData, testCases: TestCase[]) => {
    setLoading(true);

    try {
      const topicsArray = formData.topics
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      // Force isGlobal to false for contest-only problems
      const res = await api.post('/admin/problems', {
        ...formData,
        topics: topicsArray,
        isGlobal: false,
        testCases: testCases.filter(
          (tc) => (tc.input || '').trim() !== '' || (tc.expectedOutput || '').trim() !== ''
        ),
      });

      queryClient.invalidateQueries({ queryKey: ['adminProblems'] });
      
      const newProblemId = res.data?.data?.id;
      if (newProblemId) {
        onSuccess(newProblemId);
      }
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to create custom problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-black dark:opacity-80"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-dark-bg rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="px-4 py-5 sm:p-6 h-[80vh] overflow-y-auto">
            <h3 className="text-2xl leading-6 font-bold text-gray-900 dark:text-white mb-6">
              Create Custom Contest Question
            </h3>
            
            <p className="text-sm text-gray-500 mb-6">
              This question will only be visible within this contest. It will not appear in the global public problem bank.
            </p>

            <ProblemForm
              initialData={{ isGlobal: false }}
              onSubmit={handleSubmit}
              onCancel={onClose}
              loading={loading}
              submitButtonText="Create & Add to Contest"
              showIsGlobalToggle={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
