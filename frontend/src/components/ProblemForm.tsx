import { useState, FormEvent } from 'react';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  points: number;
}

export interface ProblemFormData {
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string;
  timeLimit: number;
  memoryLimit: number;
  isGlobal: boolean;
}

interface ProblemFormProps {
  initialData?: Partial<ProblemFormData>;
  initialTestCases?: TestCase[];
  onSubmit: (data: ProblemFormData, testCases: TestCase[]) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  submitButtonText?: string;
  showIsGlobalToggle?: boolean;
}

export default function ProblemForm({
  initialData,
  initialTestCases,
  onSubmit,
  onCancel,
  loading,
  submitButtonText = 'Submit',
  showIsGlobalToggle = true,
}: ProblemFormProps) {
  const [formData, setFormData] = useState<ProblemFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    inputFormat: initialData?.inputFormat || '',
    outputFormat: initialData?.outputFormat || '',
    constraints: initialData?.constraints || '',
    difficulty: initialData?.difficulty || 'Easy',
    topics: initialData?.topics || '',
    timeLimit: initialData?.timeLimit || 2000,
    memoryLimit: initialData?.memoryLimit || 256,
    isGlobal: initialData?.isGlobal !== undefined ? initialData.isGlobal : true,
  });

  const [testCases, setTestCases] = useState<TestCase[]>(
    initialTestCases || [{ input: '', expectedOutput: '', isPublic: true, points: 10 }]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, testCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isPublic: false, points: 10 }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean | number) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>

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
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
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
          
          {showIsGlobalToggle && (
            <div className="flex items-center pt-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isGlobal}
                  onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Global Problem (visible in public problem bank)
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
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
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Test Case {index + 1}</h3>
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
                    <label className="text-sm text-gray-700 dark:text-gray-300">Points:</label>
                    <input
                      type="number"
                      value={tc.points}
                      onChange={(e) => updateTestCase(index, 'points', parseInt(e.target.value) || 10)}
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
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : submitButtonText}
        </button>
      </div>
    </form>
  );
}
