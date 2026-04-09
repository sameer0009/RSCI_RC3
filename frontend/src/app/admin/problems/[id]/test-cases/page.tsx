'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  visibility: string;
  points: number;
  orderIndex: number;
  description?: string;
  groupId?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

interface TestCaseGroup {
  id: string;
  name: string;
  description?: string;
  points: number;
  orderIndex: number;
  testCases: TestCase[];
}

export default function TestCaseManagementPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = params.id as string;

  const [problem, setProblem] = useState<any>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [groups, setGroups] = useState<TestCaseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTestCase, setShowAddTestCase] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);

  const [newTestCase, setNewTestCase] = useState({
    input: '',
    expectedOutput: '',
    visibility: 'HIDDEN',
    points: 10,
    description: '',
    groupId: '',
    timeLimit: null as number | null,
    memoryLimit: null as number | null,
  });

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    points: 0,
  });

  useEffect(() => {
    fetchProblemData();
  }, [problemId]);

  const fetchProblemData = async () => {
    try {
      const [problemRes, testCasesRes, groupsRes] = await Promise.all([
        api.get(`/problems/${problemId}`),
        api.get(`/testcases/problem/${problemId}`),
        api.get(`/problems/${problemId}/groups`),
      ]);

      setProblem(problemRes.data.data.problem);
      setTestCases(testCasesRes.data.data.testCases || []);
      setGroups(groupsRes.data.data.groups || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = async () => {
    try {
      await api.post('/testcases', {
        problemId,
        ...newTestCase,
        orderIndex: testCases.length + 1,
      });

      setShowAddTestCase(false);
      setNewTestCase({
        input: '',
        expectedOutput: '',
        visibility: 'HIDDEN',
        points: 10,
        description: '',
        groupId: '',
        timeLimit: null,
        memoryLimit: null,
      });
      fetchProblemData();
    } catch (error) {
      console.error('Failed to add test case:', error);
    }
  };

  const handleUpdateTestCase = async (testCase: TestCase) => {
    try {
      await api.put(`/testcases/${testCase.id}`, testCase);
      setEditingTestCase(null);
      fetchProblemData();
    } catch (error) {
      console.error('Failed to update test case:', error);
    }
  };

  const handleDeleteTestCase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test case?')) return;

    try {
      await api.delete(`/testcases/${id}`);
      fetchProblemData();
    } catch (error) {
      console.error('Failed to delete test case:', error);
    }
  };

  const handleAddGroup = async () => {
    try {
      await api.post(`/problems/${problemId}/groups`, {
        ...newGroup,
        orderIndex: groups.length + 1,
      });

      setShowAddGroup(false);
      setNewGroup({ name: '', description: '', points: 0 });
      fetchProblemData();
    } catch (error) {
      console.error('Failed to add group:', error);
    }
  };

  const calculateTotalPoints = () => {
    return testCases.reduce((sum, tc) => sum + tc.points, 0);
  };

  const getVisibilityBadge = (visibility: string) => {
    const colors = {
      SAMPLE: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      HIDDEN: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      STRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    };
    return colors[visibility as keyof typeof colors] || colors.HIDDEN;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-primary-600 hover:text-primary-700 flex items-center gap-2"
          >
            ← Back to Problems
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Case Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{problem?.title}</p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total Test Cases:{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {testCases.length}
              </span>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Total Points:{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {calculateTotalPoints()}
              </span>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Groups:{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{groups.length}</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setShowAddTestCase(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            + Add Test Case
          </button>
          <button
            onClick={() => setShowAddGroup(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Group
          </button>
        </div>

        {/* Groups Section */}
        {groups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Test Case Groups
            </h2>
            <div className="grid gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-primary-600">
                      {group.points} points
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {group.testCases?.length || 0} test cases
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Cases List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Test Cases</h2>
          <div className="space-y-4">
            {testCases.map((testCase, index) => (
              <div
                key={testCase.id}
                className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
              >
                {editingTestCase?.id === testCase.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Visibility
                        </label>
                        <select
                          value={editingTestCase.visibility}
                          onChange={(e) =>
                            setEditingTestCase({ ...editingTestCase, visibility: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                        >
                          <option value="SAMPLE">Sample (Visible)</option>
                          <option value="HIDDEN">Hidden</option>
                          <option value="STRESS">Stress Test</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Points
                        </label>
                        <input
                          type="number"
                          value={editingTestCase.points}
                          onChange={(e) =>
                            setEditingTestCase({
                              ...editingTestCase,
                              points: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Input
                      </label>
                      <textarea
                        value={editingTestCase.input}
                        onChange={(e) =>
                          setEditingTestCase({ ...editingTestCase, input: e.target.value })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expected Output
                      </label>
                      <textarea
                        value={editingTestCase.expectedOutput}
                        onChange={(e) =>
                          setEditingTestCase({ ...editingTestCase, expectedOutput: e.target.value })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateTestCase(editingTestCase)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingTestCase(null)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          Test Case #{index + 1}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getVisibilityBadge(testCase.visibility)}`}
                        >
                          {testCase.visibility}
                        </span>
                        <span className="text-sm font-semibold text-primary-600">
                          {testCase.points} points
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTestCase(testCase)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTestCase(testCase.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {testCase.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {testCase.description}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Input:
                        </span>
                        <pre className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {testCase.input}
                        </pre>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Expected Output:
                        </span>
                        <pre className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {testCase.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Test Case Modal */}
        {showAddTestCase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Add Test Case
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Visibility
                    </label>
                    <select
                      value={newTestCase.visibility}
                      onChange={(e) =>
                        setNewTestCase({ ...newTestCase, visibility: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    >
                      <option value="SAMPLE">Sample (Visible)</option>
                      <option value="HIDDEN">Hidden</option>
                      <option value="STRESS">Stress Test</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Points
                    </label>
                    <input
                      type="number"
                      value={newTestCase.points}
                      onChange={(e) =>
                        setNewTestCase({ ...newTestCase, points: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newTestCase.description}
                    onChange={(e) =>
                      setNewTestCase({ ...newTestCase, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    placeholder="e.g., Edge case: empty array"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Input
                  </label>
                  <textarea
                    value={newTestCase.input}
                    onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white font-mono text-sm"
                    placeholder="Enter test input..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expected Output
                  </label>
                  <textarea
                    value={newTestCase.expectedOutput}
                    onChange={(e) =>
                      setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white font-mono text-sm"
                    placeholder="Enter expected output..."
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleAddTestCase}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add Test Case
                  </button>
                  <button
                    onClick={() => setShowAddTestCase(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Group Modal */}
        {showAddGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Add Test Case Group
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    placeholder="e.g., Basic Tests, Edge Cases"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    placeholder="Describe this group..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Points
                  </label>
                  <input
                    type="number"
                    value={newGroup.points}
                    onChange={(e) => setNewGroup({ ...newGroup, points: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleAddGroup}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add Group
                  </button>
                  <button
                    onClick={() => setShowAddGroup(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
