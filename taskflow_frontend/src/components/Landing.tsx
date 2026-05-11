'use client';

import React from 'react';
import Link from 'next/link';

const FEATURES = [
  {
    icon: 'auto_awesome',
    title: 'AI Subtasks',
    body: 'Turn one big task into clean, actionable steps in a click.',
  },
  {
    icon: 'drag_indicator',
    title: 'Drag to Reorder',
    body: 'Sort your day exactly how it should flow — no friction.',
  },
  {
    icon: 'task_alt',
    title: 'Stay on Track',
    body: 'Priorities, statuses, and progress in one calm place.',
  },
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] relative overflow-hidden">
      {/* Soft background accents */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -right-32 w-[520px] h-[520px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[480px] h-[480px] bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      {/* Top nav */}
      <header className="relative z-10 px-6 sm:px-10 py-5 flex items-center">
        <div className="flex items-center gap-2">
          <div className="text-primary flex items-center justify-center border-2 border-primary rounded-full p-0.5">
            <span className="material-symbols-outlined text-xl font-black">strikethrough_s</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Strike</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-gray-100 px-4 py-1.5 rounded-full mb-8 shadow-sm">
          <span className="material-symbols-outlined text-primary text-base">bolt</span>
          <span className="text-xs font-bold tracking-widest uppercase text-gray-500">
            Now with AI subtasks
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight leading-[1.05]">
          Get more done,
          <br />
          <span className="text-primary">with less friction.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
          A calm, focused task manager that breaks the busy work into bite-sized pieces — so you can
          actually ship the day.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="group bg-primary text-white font-bold px-7 py-4 rounded-2xl text-base shadow-lg shadow-primary/20 hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            Get Started — it&apos;s free
            <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </Link>
          <Link
            href="/signin"
            className="bg-white text-gray-700 font-bold px-7 py-4 rounded-2xl text-base border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all"
          >
            Log In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl">{f.icon}</span>
              </div>
              <h3 className="text-base font-black text-gray-900 tracking-tight mb-1.5">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <footer className="relative z-10 pb-10 text-center text-xs font-bold tracking-widest uppercase text-gray-300">
        Stay focused. Stay organized.
      </footer>
    </main>
  );
}
