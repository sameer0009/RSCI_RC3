'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white/10 dark:bg-dark-card/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent hover:from-primary-300 hover:to-blue-300 transition-all"
            >
              RSCI-RC3
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/problems"
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Problems
                </Link>
                <Link
                  href="/contests"
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Contests
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Leaderboard
                </Link>
                {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN' || user?.role === 'STUDENT') && (
                  <Link
                    href="/classrooms"
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    Classrooms
                  </Link>
                )}
                {(user?.role === 'ADMIN' || user?.role === 'PROBLEM_SETTER') && (
                  <Link
                    href="/admin/problems"
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm border border-blue-400/30 px-2 py-0.5 rounded"
                  >
                    Manage Problems
                  </Link>
                )}
                {(user?.role === 'ADMIN' || user?.role === 'CONTEST_MANAGER') && (
                  <Link
                    href="/admin/competitions"
                    className="text-green-400 hover:text-green-300 transition-colors font-medium text-sm border border-green-400/30 px-2 py-0.5 rounded"
                  >
                    Manage Contests
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-purple-400 hover:text-purple-300 transition-colors font-medium flex items-center gap-1 border border-purple-400/30 px-2 py-0.5 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link
                  href="/settings"
                  className="p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  title="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <Link
                  href={`/profile/${user?.username}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.username?.[0].toUpperCase()}
                  </div>
                  <span className="text-gray-300 font-medium">{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600/80 hover:bg-red-600 rounded-lg transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
