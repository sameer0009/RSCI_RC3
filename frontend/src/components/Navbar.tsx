'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin, viewMode, toggleViewMode } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleToggleView = () => {
    toggleViewMode();
    if (viewMode === 'USER') {
      router.push('/admin');
    } else {
      router.push('/problems');
    }
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
                {/* User View Links */}
                {viewMode === 'USER' && (
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
                  </>
                )}

                {/* Admin View Links */}
                {viewMode === 'ADMIN' && (
                  <>
                    <Link
                      href="/admin"
                      className="text-purple-400 hover:text-purple-300 transition-colors font-medium flex items-center gap-1 border border-purple-400/30 px-2 py-0.5 rounded"
                    >
                      Dashboard
                    </Link>
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
                    <Link
                      href="/admin/classrooms"
                      className="text-orange-400 hover:text-orange-300 transition-colors font-medium text-sm border border-orange-400/30 px-2 py-0.5 rounded"
                    >
                      Manage Classes
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* View Switcher Toggle */}
                {isAdmin && (
                  <button
                    onClick={handleToggleView}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      viewMode === 'ADMIN'
                        ? 'bg-purple-600/20 text-purple-400 border-purple-500/50 hover:bg-purple-600/30'
                        : 'bg-blue-600/20 text-blue-400 border-blue-500/50 hover:bg-blue-600/30'
                    }`}
                  >
                    {viewMode === 'ADMIN' ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Switch to User View
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Switch to Admin View
                      </>
                    )}
                  </button>
                )}
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
