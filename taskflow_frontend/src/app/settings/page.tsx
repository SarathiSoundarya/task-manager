'use client';

import React, { useEffect, useState } from 'react';
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

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
        return;
      }
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from('users')
        .select('timezone')
        .eq('id', session.user.id)
        .single();

      if (error) console.error('Failed to load profile:', error);
      if (data) setTimezone(data.timezone);
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('users')
      .update({ timezone })
      .eq('id', userId);

    if (error) {
      console.error('Save timezone failed:', error);
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Timezone updated successfully!');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] p-6 flex flex-col items-center pt-12">
      <div className="bg-white w-full max-w-lg rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h1 className="text-3xl font-black text-gray-900">Settings</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 ml-1">Your Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-700 bg-white"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 ml-1">
              This will affect how task deadlines are displayed.
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-2xl text-sm font-medium text-center ${
                message.startsWith('Error')
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-green-600'
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#4285f4] text-white font-bold py-4 rounded-xl w-full shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </main>
  );
}
