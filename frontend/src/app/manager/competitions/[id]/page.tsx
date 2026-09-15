'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import ProblemModal from '@/components/ProblemModal';
import { ArrowLeft } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
}

function EditContestContent() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'participants' | 'scoring'>('settings');
  const [bulkData, setBulkData] = useState('');
  const [bulkRegistering, setBulkRegistering] = useState(false);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: 120,
    isPublic: true,
    password: '',
  });
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [problemsRes, contestRes] = await Promise.all([
        api.get('/admin/problems'),
        api.get(`/contests/${id}`),
      ]);
      
      setProblems(problemsRes.data.data.problems);
      
      const contest = contestRes.data.data.contest;
      if (!contest) throw new Error('Contest data missing in response');
      
      setFormData({
        title: contest.title || '',
        description: contest.description || '',
        startTime: contest.startTime ? new Date(contest.startTime).toISOString().slice(0, 16) : '',
        endTime: contest.endTime ? new Date(contest.endTime).toISOString().slice(0, 16) : '',
        duration: contest.duration || 120,
        isPublic: contest.isPublic ?? true,
        password: contest.password || '',
      });
      setSelectedProblems(contest.problems?.map((p: any) => p.id) || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProblemCreated = async (newProblemId: string) => {
    // We only need to fetch the problems list, not the contest data again
    try {
      const { data } = await api.get('/admin/problems');
      setProblems(data.data.problems);
      setSelectedProblems((prev) => [...prev, newProblemId]);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        problemIds: selectedProblems,
      };

      await api.put(`/contests/${id}`, payload);
      router.push('/manager/competitions');
    } catch (error: any) {
      console.error('Failed to update contest:', error);
      alert(error.response?.data?.error?.message || 'Failed to update contest');
    } finally {
      setSaving(false);
    }
  };

  const toggleProblem = (id: string) => {
    if (selectedProblems.includes(id)) {
      setSelectedProblems(selectedProblems.filter((p) => p !== id));
    } else {
      setSelectedProblems([...selectedProblems, id]);
    }
  };

  const handleBulkRegister = async () => {
    if (!bulkData.trim()) return;
    setBulkRegistering(true);
    try {
      const users = bulkData.split('\n').map(line => {
        const [email, password] = line.split(',').map(s => s.trim());
        return { email, password };
      }).filter(u => u.email && u.password);
      
      if (users.length === 0) {
        alert('Please enter valid email, password pairs');
        return;
      }
      
      const { data } = await api.post(`/contests/${id}/bulk-register`, { users });
      alert(`Successfully registered ${data.data.registered} users.`);
      setBulkData('');
    } catch (error: any) {
      console.error('Failed to bulk register:', error);
      alert(error.response?.data?.error?.message || 'Failed to bulk register users');
    } finally {
      setBulkRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Competition</h1>
          </div>
          
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'settings' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'participants' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                onClick={() => setActiveTab('participants')}
              >
                Participants
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'scoring' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                onClick={() => setActiveTab('scoring')}
              >
                Scoring
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="p-6 sm:p-8">
              {activeTab === 'settings' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contest Title</label>
                    <input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                    <input
                      required
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => {
                        const newStartTime = e.target.value;
                        let newDuration = formData.duration;
                        if (newStartTime && formData.endTime) {
                          const start = new Date(newStartTime).getTime();
                          const end = new Date(formData.endTime).getTime();
                          if (end > start) newDuration = Math.round((end - start) / 60000);
                        }
                        setFormData({ ...formData, startTime: newStartTime, duration: newDuration });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                    <input
                      required
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => {
                        const newEndTime = e.target.value;
                        let newDuration = formData.duration;
                        if (formData.startTime && newEndTime) {
                          const start = new Date(formData.startTime).getTime();
                          const end = new Date(newEndTime).getTime();
                          if (end > start) newDuration = Math.round((end - start) / 60000);
                        }
                        setFormData({ ...formData, endTime: newEndTime, duration: newDuration });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                    <input
                      required
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visibility</label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <input
                          type="radio"
                          checked={formData.isPublic}
                          onChange={() => setFormData({ ...formData, isPublic: true })}
                        />
                        Public
                      </label>
                      <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <input
                          type="radio"
                          checked={!formData.isPublic}
                          onChange={() => setFormData({ ...formData, isPublic: false })}
                        />
                        Private (Password)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Problems</h3>
                    <button
                      type="button"
                      onClick={() => setIsProblemModalOpen(true)}
                      className="px-4 py-2 text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-medium transition-colors"
                    >
                      + Create Custom Question
                    </button>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-64 overflow-y-auto">
                    {problems.map((problem) => (
                      <label
                        key={problem.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b last:border-b-0 border-gray-100 dark:border-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProblems.includes(problem.id)}
                          onChange={() => toggleProblem(problem.id)}
                          className="rounded text-primary-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{problem.title}</p>
                          <p className="text-xs text-gray-500">{problem.difficulty}</p>
                        </div>
                      </label>
                    ))}
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
                    disabled={saving}
                    type="submit"
                    className="px-8 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
              )}

              {activeTab === 'participants' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Register Participants</h3>
                  <p className="text-sm text-gray-500">
                    Enter one participant per line in the format: <strong>email, password</strong>
                  </p>
                  <textarea
                    rows={10}
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    placeholder={`student1@example.com, password123\nstudent2@example.com, password456`}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleBulkRegister}
                      disabled={bulkRegistering || !bulkData.trim()}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      {bulkRegistering ? 'Registering...' : 'Register Participants'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'scoring' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Scoring</h3>
                  <p className="text-sm text-gray-500">Live scoring dashboard is coming soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ProblemModal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        onSuccess={handleProblemCreated}
      />
    </>
  );
}

export default function EditContestPage() {
  return (
    <ProtectedRoute requiredRole={['ADMIN', 'CONTEST_MANAGER']}>
      <EditContestContent />
    </ProtectedRoute>
  );
}
