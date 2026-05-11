'use client';

import React, { useEffect, useState } from 'react';
import TaskList from '@/components/TaskList';
import AddTask from '@/components/AddTask';
import Landing from '@/components/Landing';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session && !loading) {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, loading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const handleTaskAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Unauthenticated visitors see the landing page; sign-in/sign-up are linked from there.
  if (!user) {
    return <Landing />;
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col relative">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center w-full sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="text-primary flex items-center justify-center border-2 border-primary rounded-full p-0.5">
            <span className="material-symbols-outlined text-xl font-black">strikethrough_s</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Strike</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-gray-500 hidden sm:inline">Welcome back, {user.email?.split('@')[0]}</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/settings')}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Logout"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="flex-1 flex flex-col items-center p-6 pb-40 mt-8">
        <TaskList user={user} key={refreshKey} />
      </section>

      {/* Floating Add Task Bar */}
      <AddTask userId={user.id} onTaskAdded={handleTaskAdded} />
    </main>
  );
}





