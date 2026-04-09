'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityCalendar } from 'react-activity-calendar';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  bio: string | null;
  profilePicture: string | null;
  location: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  rating: number;
  rank: number;
  problemsSolved: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  createdAt: string;
  role: string;
  recentSubmissions: Array<{
    id: string;
    submittedAt: string;
    problem: {
      title: string;
      slug: string;
      difficulty: string;
    };
  }>;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    twitterUrl: '',
    websiteUrl: ''
  });
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Generate mock data for the ActivityCalendar
  const [activityData, setActivityData] = useState<Array<{date: string; count: number; level: number}>>([]);
  
  useEffect(() => {
    // Generate past 365 days of mock activity
    const data = [];
    const today = new Date();
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Random activity
      const isActive = Math.random() > 0.6;
      const count = isActive ? Math.floor(Math.random() * 10) + 1 : 0;
      let level = 0;
      if (count > 0) level = 1;
      if (count > 3) level = 2;
      if (count > 6) level = 3;
      if (count > 8) level = 4;
      
      data.push({ date: dateString, count, level });
    }
    setActivityData(data);
  }, []);


  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/users/${username}/profile`);
      setProfile(data.data);
      setEditForm({
        fullName: data.data.fullName || '',
        bio: data.data.bio || '',
        location: data.data.location || '',
        linkedinUrl: data.data.linkedinUrl || '',
        githubUrl: data.data.githubUrl || '',
        twitterUrl: data.data.twitterUrl || '',
        websiteUrl: data.data.websiteUrl || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/users/profile', {
        fullName: editForm.fullName,
        bio: editForm.bio,
        location: editForm.location
      });

      await api.put('/users/profile/social', {
        linkedinUrl: editForm.linkedinUrl,
        githubUrl: editForm.githubUrl,
        twitterUrl: editForm.twitterUrl,
        websiteUrl: editForm.websiteUrl
      });

      await fetchProfile();
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('picture', file);

      await api.post('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchProfile();
    } catch (error) {
      console.error('Failed to upload picture:', error);
      alert('Failed to upload picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'Hard': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    return '👤';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User not found</h2>
          </div>
        </div>
      </>
    );
  }

  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white dark:bg-dark-card rounded-lg shadow p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                {profile.profilePicture ? (
                  <img
                    src={`http://localhost:5000${profile.profilePicture}`}
                    alt={profile.username}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center text-white text-4xl font-bold">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}
                {isOwnProfile && (
                  <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureUpload}
                      className="hidden"
                      disabled={uploadingPicture}
                    />
                    📷
                  </label>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profile.fullName || profile.username}
                  </h1>
                  <span className="text-3xl">{getRankBadge(profile.rank)}</span>
                  {profile.role === 'ADMIN' && (
                    <span className="px-2 py-1 text-xs font-semibold rounded text-purple-600 bg-purple-100 dark:bg-purple-900/20">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">@{profile.username}</p>
                {profile.location && (
                  <p className="text-gray-600 dark:text-gray-400 mb-2">📍 {profile.location}</p>
                )}
                {profile.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>
                )}

                {/* Social Links */}
                <div className="flex gap-3 justify-center md:justify-start mb-4">
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:text-blue-700">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                       className="text-gray-900 dark:text-white hover:text-gray-700">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  )}
                  {profile.twitterUrl && (
                    <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer"
                       className="text-blue-400 hover:text-blue-500">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                      </svg>
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer"
                       className="text-gray-600 dark:text-gray-400 hover:text-gray-700">
                      🌐
                    </a>
                  )}
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-primary-600">{profile.problemsSolved}</div>
              <div className="text-gray-600 dark:text-gray-400">Problems Solved</div>
            </div>
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-green-600">{profile.acceptedSubmissions}</div>
              <div className="text-gray-600 dark:text-gray-400">Accepted</div>
            </div>
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-blue-600">{profile.rating}</div>
              <div className="text-gray-600 dark:text-gray-400">Rating</div>
            </div>
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-purple-600">#{profile.rank}</div>
              <div className="text-gray-600 dark:text-gray-400">Global Rank</div>
            </div>
          </div>

{/* Submission Heatmap */}
          <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6 mb-6 overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Submission Activity
            </h2>
            <div className="flex justify-center w-full overflow-x-auto pb-4 custom-scrollbar">
              {activityData.length > 0 && (
                <ActivityCalendar 
                  data={activityData} 
                  theme={{
                    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                  }}
                  colorScheme="dark"
                  labels={{
                    legend: {
                      less: 'Less',
                      more: 'More'
                    },
                    months: [
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ],
                    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                  }}
                />
              )}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Accepted Submissions
            </h2>
            <div className="space-y-3">
              {profile.recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {submission.problem.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getDifficultyColor(submission.problem.difficulty)}`}>
                    {submission.problem.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Edit Profile
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <p className="text-sm text-gray-500 mt-1">{editForm.bio.length}/500 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={editForm.linkedinUrl}
                  onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={editForm.githubUrl}
                  onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={editForm.twitterUrl}
                  onChange={(e) => setEditForm({ ...editForm, twitterUrl: e.target.value })}
                  placeholder="https://twitter.com/username"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={editForm.websiteUrl}
                  onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
