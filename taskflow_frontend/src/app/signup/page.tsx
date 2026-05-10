'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Australia/Sydney',
];

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          timezone: timezone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/signin?message=Check your email to confirm your account');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center border-2 border-primary rounded-full p-1 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl font-black">check</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">Create Account</h1>
          <p className="text-gray-500 font-medium">Join TaskFlow and stay organized.</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
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

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 ml-1">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-700 bg-white"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#4285f4] text-white font-bold py-4 rounded-2xl w-full flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-500 font-medium">
          Already have an account?{' '}
          <Link href="/signin" className="text-primary font-bold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}

