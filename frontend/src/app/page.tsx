'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Code2,
  Trophy,
  BarChart3,
  GraduationCap,
  Shield,
  BookOpen,
  Star,
  Target,
  Flame,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated, isAdmin, isInstructor } = useAuth();

  if (isAuthenticated && user) {
    if (isAdmin) return <RoleWelcome role="admin" />;
    if (isInstructor) return <RoleWelcome role="instructor" />;
    return <StudentDashboard />;
  }

  return <GuestLanding />;
}

/* -------------------------------------------------------------------------- */
/* Guest landing page                                                         */
/* -------------------------------------------------------------------------- */

function GuestLanding() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen brand-gradient">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center animate-fade-in">
              <div className="mx-auto mb-8 w-24 h-24 rounded-full bg-white shadow-xl ring-4 ring-gold-400/20 relative">
                <Image src="/logo.png" alt="Riphah School of Computing & Innovation" fill sizes="96px" className="object-contain p-3" />
              </div>
              <div className="inline-block mb-5">
                <span className="px-4 py-1.5 bg-gold-400/10 border border-gold-400/30 rounded-full text-gold-300 text-sm font-medium">
                  Riphah School of Computing &amp; Innovation
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                RSCI Judge
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-4">Master Programming Through Practice</p>
              <p className="text-base sm:text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                The official coding practice, classroom, and contest platform for RSCI students —
                real-time judging, classroom assignments, and campus-wide leaderboards, all in one place.
              </p>

              <div className="flex justify-center gap-4 flex-wrap">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold-500 text-primary-950 rounded-xl hover:bg-gold-400 font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-gold-glow"
                >
                  Sign In to Continue <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Code2 className="w-7 h-7 text-white" />}
              iconBg="from-primary-500 to-primary-700"
              title="Practice Problems"
              description="Solve curated coding problems across difficulty levels, from beginner fundamentals to advanced algorithms."
              delay="0s"
            />
            <FeatureCard
              icon={<Trophy className="w-7 h-7 text-white" />}
              iconBg="from-gold-500 to-gold-700"
              title="Compete & Win"
              description="Participate in timed classroom and campus contests, climb the leaderboard, and earn recognition."
              delay="0.1s"
            />
            <FeatureCard
              icon={<BarChart3 className="w-7 h-7 text-white" />}
              iconBg="from-primary-400 to-primary-600"
              title="Track Progress"
              description="Monitor performance with detailed analytics and watch your skills improve, submission by submission."
              delay="0.2s"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white/[0.04] backdrop-blur-lg border border-white/10 rounded-2xl p-10 sm:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <StatBlock value="500+" label="Problems" />
              <StatBlock value="10K+" label="Students" />
              <StatBlock value="8" label="Languages" />
              <StatBlock value="24/7" label="Available" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className="bg-white/[0.04] backdrop-blur-lg border border-white/10 p-8 rounded-2xl hover:bg-white/[0.07] transition-all animate-slide-up"
      style={{ animationDelay: delay }}
    >
      <div className={`w-[52px] h-[52px] bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center mb-6 shadow-md`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Welcome screen for Admins & Instructors — a short branded landing that     */
/* points them straight at their dedicated dashboards instead of showing     */
/* the marketing page.                                                       */
/* -------------------------------------------------------------------------- */

function RoleWelcome({ role }: { role: 'admin' | 'instructor' }) {
  const { user } = useAuth();
  const isAdminRole = role === 'admin';

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-white shadow-md ring-1 ring-gray-200 dark:ring-gray-700 relative">
            <Image src="/logo.png" alt="RSCI logo" fill sizes="64px" className="object-contain p-2" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">
            {isAdminRole ? 'Administrator' : 'Instructor'}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome back, {user?.fullName || user?.username}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-10">
            {isAdminRole
              ? 'Manage users, problems, contests, and classrooms from your admin dashboard.'
              : 'Manage your classrooms, review student progress, and set problems from your instructor workspace.'}
          </p>

          <div className="flex justify-center flex-wrap gap-4 mb-14">
            <Link
              href={isAdminRole ? '/admin' : '/classrooms'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold transition-all shadow-sm hover:shadow-md"
            >
              {isAdminRole ? <Shield className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
              Go to {isAdminRole ? 'Admin Dashboard' : 'My Classrooms'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/problems"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-card text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all"
            >
              <Code2 className="w-5 h-5" />
              Browse Problems
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {isAdminRole ? (
              <>
                <QuickLinkCard href="/admin/users" title="Users" description="Manage accounts & roles" icon={<GraduationCap className="w-5 h-5" />} />
                <QuickLinkCard href="/admin/competitions" title="Contests" description="Create & schedule events" icon={<Trophy className="w-5 h-5" />} />
                <QuickLinkCard href="/admin/analytics" title="Analytics" description="Platform-wide reports" icon={<BarChart3 className="w-5 h-5" />} />
              </>
            ) : (
              <>
                <QuickLinkCard href="/classrooms/create" title="New Classroom" description="Set up a class for your students" icon={<BookOpen className="w-5 h-5" />} />
                <QuickLinkCard href="/admin/problems" title="Manage Problems" description="Author & curate problem sets" icon={<Code2 className="w-5 h-5" />} />
                <QuickLinkCard href="/leaderboard" title="Leaderboard" description="See top-performing students" icon={<Trophy className="w-5 h-5" />} />
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function QuickLinkCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
    >
      <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Student dashboard — the home page students see once signed in.            */
/* Uses stats already present on the auth'd user object, so no extra calls.  */
/* -------------------------------------------------------------------------- */

function StudentDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Rating',
      value: user?.rating ?? 0,
      icon: <Star className="w-5 h-5" />,
      accent: 'text-gold-600 bg-gold-50 dark:bg-gold-900/20 dark:text-gold-400',
    },
    {
      label: 'Global Rank',
      value: user?.rank ? `#${user.rank}` : '—',
      icon: <Trophy className="w-5 h-5" />,
      accent: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400',
    },
    {
      label: 'Problems Solved',
      value: user?.problemsSolved ?? 0,
      icon: <Target className="w-5 h-5" />,
      accent: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
    },
    {
      label: 'Total Submissions',
      value: user?.totalSubmissions ?? 0,
      icon: <Flame className="w-5 h-5" />,
      accent: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    },
  ];

  const quickLinks = [
    {
      href: '/problems',
      title: 'Problems',
      description: 'Browse and solve the problem set',
      icon: <Code2 className="w-6 h-6" />,
      accent: 'from-primary-500 to-primary-700',
    },
    {
      href: '/contests',
      title: 'Contests',
      description: 'Join upcoming and live contests',
      icon: <Trophy className="w-6 h-6" />,
      accent: 'from-gold-500 to-gold-700',
    },
    {
      href: '/classrooms',
      title: 'Classrooms',
      description: 'View classes you are enrolled in',
      icon: <BookOpen className="w-6 h-6" />,
      accent: 'from-emerald-500 to-emerald-700',
    },
    {
      href: '/leaderboard',
      title: 'Leaderboard',
      description: 'See how you rank campus-wide',
      icon: <BarChart3 className="w-6 h-6" />,
      accent: 'from-purple-500 to-purple-700',
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        {/* Welcome banner */}
        <div className="bg-primary-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]"></div>
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white shadow-md relative shrink-0">
                <Image src="/logo.png" alt="RSCI logo" fill sizes="56px" className="object-contain p-1.5" />
              </div>
              <div>
                <p className="text-gold-300 text-xs font-semibold uppercase tracking-wider mb-1">
                  Student Dashboard
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Welcome back, {user?.fullName || user?.username}
                </h1>
              </div>
            </div>
            <Link
              href="/problems"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-primary-950 font-semibold rounded-lg transition-all shrink-0"
            >
              Continue Practicing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          {/* Stat cards */}
          <section>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white dark:bg-dark-card p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.accent}`}>
                    {s.icon}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick links */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Jump back in</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {quickLinks.map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className="group bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className={`w-11 h-11 bg-gradient-to-br ${q.accent} rounded-lg flex items-center justify-center text-white mb-4 shadow-sm`}>
                    {q.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-1.5">
                    {q.title}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{q.description}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
