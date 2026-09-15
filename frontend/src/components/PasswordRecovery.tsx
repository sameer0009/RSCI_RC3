'use client';

import { FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function PasswordRecovery({ token }: { token?: string | null }) {
  const resetting = token !== undefined;
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      await api.post(resetting ? '/auth/reset-password' : '/auth/forgot-password', resetting ? { token, password } : { email });
      setMessage(resetting ? 'Your password has been updated. You can now sign in.' : 'If an account exists for this email, a reset link has been sent.');
      setPassword('');
    } catch (failure: any) { setError(failure.response?.data?.error?.message || 'Could not complete your request. Please try again.'); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen brand-gradient flex items-center justify-center px-4 py-12">
    <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] p-8 text-white">
      <h1 className="text-2xl font-bold">{resetting ? 'Choose a new password' : 'Reset your password'}</h1>
      <p className="mt-3 text-gray-300">{resetting ? 'Use at least 6 characters, including an uppercase letter, a lowercase letter, and a number.' : 'Enter the email address associated with your assigned account.'}</p>
      {resetting && !token ? <p role="alert" className="mt-6 text-red-200">This reset link is missing its token. Request a new link.</p> : <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block" htmlFor="recovery-input">{resetting ? 'New password' : 'Email address'}</label>
        <input disabled={!ready} id="recovery-input" type={resetting ? 'password' : 'email'} autoComplete={resetting ? 'new-password' : 'email'} required minLength={resetting ? 6 : undefined} value={resetting ? password : email} onChange={e => resetting ? setPassword(e.target.value) : setEmail(e.target.value)} className="w-full rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-400" />
        <button disabled={!ready || busy || (resetting && !!message)} className="w-full rounded-lg bg-gold-400 px-4 py-3 font-semibold text-gray-950 disabled:opacity-50">{busy ? 'Please wait…' : resetting ? 'Update password' : 'Send reset link'}</button>
      </form>}
      {error && <p role="alert" className="mt-4 text-red-200">{error}</p>}
      {message && <p role="status" className="mt-4 text-green-200">{message}</p>}
      <Link className="mt-6 inline-block text-gold-300 underline underline-offset-4" href="/login">Back to sign in</Link>
      {resetting && <Link className="mt-4 block text-gray-200 underline" href="/forgot-password">Request a new reset link</Link>}
    </section>
  </main>;
}
