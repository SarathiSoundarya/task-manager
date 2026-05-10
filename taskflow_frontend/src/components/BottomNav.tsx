'use client';

import React from 'react';
import Link from 'next/link';

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center z-50">
      <Link href="/" className="flex flex-col items-center gap-1 text-primary">
        <span className="material-symbols-outlined text-2xl">list_alt</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">Tasks</span>
      </Link>
      <Link href="/calendar" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
        <span className="material-symbols-outlined text-2xl">calendar_today</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">Calendar</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
        <span className="material-symbols-outlined text-2xl">person</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
