'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Public registration is disabled. Redirecting to login.
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 brand-gradient">
      <div className="relative w-14 h-14 rounded-full bg-white shadow-lg overflow-hidden">
        <Image src="/logo.png" alt="RSCI logo" fill sizes="56px" className="object-contain p-1.5" />
      </div>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
      <p className="text-gray-400 text-sm">Redirecting to sign in…</p>
    </div>
  );
}
