'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

// useSearchParams() forces this part of the tree out of static prerender,
// so it must live inside a <Suspense> boundary (Next 14 App Router rule).
function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMessage(searchParams.get('message'));
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white w-full max-w-md rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center border-2 border-primary rounded-full p-1 mb-4">
          <span className="material-symbols-outlined text-primary text-2xl font-black">check</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">Welcome Back</h1>
        <p className="text-gray-500 font-medium">Log in to manage your tasks.</p>
      </div>

      {message && (
        <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl text-sm font-medium text-center">
          {message}
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900 ml-1">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-700"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900 ml-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-700"
          />
        </div>

        {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#4285f4] text-white font-bold py-4 rounded-2xl w-full flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-center text-gray-500 font-medium">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

function SignInFallback() {
  return (
    <div className="bg-white w-full max-w-md rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
      <Suspense fallback={<SignInFallback />}>
        <SignInForm />
      </Suspense>
    </main>
  );
}
