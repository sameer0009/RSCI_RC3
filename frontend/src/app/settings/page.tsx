'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  if (!isAuthenticated && typeof window !== 'undefined') {
    router.push('/login');
  }

  const { data: settings, isLoading } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: async () => {
      const res = await api.get('/notifications/settings');
      return res.data.data;
    },
    enabled: !!isAuthenticated,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const res = await api.put('/notifications/settings', newSettings);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notificationSettings'], data);
    },
  });

  const handleToggle = (key: string, value: boolean) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    updateSettingsMutation.mutate(newSettings);
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-6 space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-48"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-64"></div>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Account Settings</h1>
          
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage how and when you want to be notified.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive important updates via email.</p>
                </div>
                <button
                  onClick={() => handleToggle('emailNotifications', !settings?.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings?.emailNotifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive real-time alerts in your browser.</p>
                </div>
                <button
                  onClick={() => handleToggle('pushNotifications', !settings?.pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings?.pushNotifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Contest Reminders</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified 15 minutes before a contest starts.</p>
                </div>
                <button
                  onClick={() => handleToggle('contestReminders', !settings?.contestReminders)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings?.contestReminders ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.contestReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Marketing Emails</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly digests and platform updates.</p>
                </div>
                <button
                  onClick={() => handleToggle('marketingEmails', !settings?.marketingEmails)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings?.marketingEmails ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
