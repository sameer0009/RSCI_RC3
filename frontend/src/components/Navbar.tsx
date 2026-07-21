'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from './NotificationBell';

const linkClass =
  'text-sm text-gray-300 hover:text-white transition-colors font-medium whitespace-nowrap';
const adminLinkClass =
  'text-xs font-semibold whitespace-nowrap px-2.5 py-1 rounded-md border transition-colors';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const userLinks =
    isAuthenticated && !isAdmin ? (
      <>
        {user?.role !== 'INSTRUCTOR' && (
          <>
            <Link href="/problems" className={linkClass}>
              Problems
            </Link>
            <Link href="/contests" className={linkClass}>
              Contests
            </Link>
            <Link href="/leaderboard" className={linkClass}>
              Leaderboard
            </Link>
          </>
        )}
        {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN' || user?.role === 'STUDENT') && (
          <Link href="/classrooms" className={linkClass}>
            Classrooms
          </Link>
        )}
        {user?.role === 'INSTRUCTOR' && (
          <Link href="/admin/problems" className={linkClass}>
            Manage Problems
          </Link>
        )}
      </>
    ) : null;

  const adminLinks =
    isAuthenticated && isAdmin ? (
      <>
        <Link
          href="/admin"
          className={`${adminLinkClass} text-gold-400 border-gold-400/40 hover:bg-gold-400/10`}
        >
          Dashboard
        </Link>
        {(user?.role === 'ADMIN' || user?.role === 'PROBLEM_SETTER') && (
          <Link
            href="/admin/problems"
            className={`${adminLinkClass} text-primary-300 border-primary-400/40 hover:bg-primary-400/10`}
          >
            Problems
          </Link>
        )}
        {(user?.role === 'ADMIN' || user?.role === 'CONTEST_MANAGER') && (
          <Link
            href="/admin/competitions"
            className={`${adminLinkClass} text-emerald-300 border-emerald-400/40 hover:bg-emerald-400/10`}
          >
            Contests
          </Link>
        )}
        <Link
          href="/admin/classrooms"
          className={`${adminLinkClass} text-orange-300 border-orange-400/40 hover:bg-orange-400/10`}
        >
          Classes
        </Link>
      </>
    ) : null;

  return (
    <nav className="bg-primary-950/70 dark:bg-dark-card/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <span className="relative w-9 h-9 rounded-full bg-white ring-1 ring-white/20 shadow-sm overflow-hidden shrink-0">
                <Image src="/logo.png" alt="RSCI logo" fill sizes="36px" className="object-contain p-0.5" />
              </span>
              <span className="hidden sm:flex flex-col leading-tight">
                <span className="text-base font-bold text-white tracking-tight group-hover:text-gold-300 transition-colors">
                  RSCI Judge
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  School of Computing &amp; Innovation
                </span>
              </span>
            </Link>
            <div className="hidden lg:flex items-center gap-5 pl-4 ml-1 border-l border-white/10 overflow-x-auto">
              {userLinks}
              {adminLinks}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link
                  href="/settings"
                  className="hidden sm:inline-flex p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  title="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <Link
                  href={`/profile/${user?.username}`}
                  className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/20">
                    {user?.username?.[0].toUpperCase()}
                  </div>
                  <span className="text-gray-300 font-medium text-sm">{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600/80 hover:bg-red-600 rounded-lg transition-all"
                >
                  Logout
                </button>
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  className="lg:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10"
                  aria-label="Toggle navigation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-primary-950 bg-gold-400 hover:bg-gold-300 rounded-lg transition-all shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {isAuthenticated && mobileOpen && (
          <div className="lg:hidden flex flex-col gap-3 pb-4 pt-1 border-t border-white/10">
            {userLinks}
            {adminLinks}
          </div>
        )}
      </div>
    </nav>
  );
}
