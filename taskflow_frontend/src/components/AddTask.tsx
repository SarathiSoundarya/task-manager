'use client';

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AddTaskProps {
  userId: string;
  onTaskAdded: () => void;
}

type Priority = 'low' | 'medium' | 'high';
type Status = 'pending' | 'in-progress' | 'done';

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const STATUSES: Status[] = ['pending', 'in-progress', 'done'];

const AddTask = ({ userId, onTaskAdded }: AddTaskProps) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('pending');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [priorityOpen, setPriorityOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const priorityRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Close any open menu on outside-click or Escape.
  useEffect(() => {
    if (!priorityOpen && !statusOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (priorityOpen && priorityRef.current && !priorityRef.current.contains(t)) {
        setPriorityOpen(false);
      }
      if (statusOpen && statusRef.current && !statusRef.current.contains(t)) {
        setStatusOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPriorityOpen(false);
        setStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [priorityOpen, statusOpen]);

  const handleAddTask = async () => {
    if (!title.trim()) return;
    setLoading(true);

    const { error } = await supabase
      .from('tasks')
      .insert([{ user_id: userId, title, priority, status }]);

    if (!error) {
      setTitle('');
      setPriority('medium');
      setStatus('pending');
      onTaskAdded();
      setIsFocused(false);
    }
    setLoading(false);
  };

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case 'high': return 'priority_high';
      case 'medium': return 'horizontal_rule';
      case 'low': return 'keyboard_arrow_down';
      default: return 'priority_high';
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50 animate-in slide-in-from-bottom duration-500">
      <div
        className={`
          bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)]
          rounded-[24px] p-2 flex items-center gap-2 transition-all duration-300
          ${isFocused ? 'ring-2 ring-primary/20 shadow-[0_25px_60px_rgba(66,133,244,0.15)]' : ''}
        `}
      >
        {/* Priority Selector */}
        <div ref={priorityRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={priorityOpen}
            aria-label={`Priority: ${priority}`}
            onClick={() => {
              setPriorityOpen((o) => !o);
              setStatusOpen(false);
            }}
            className={`
              p-3 rounded-2xl flex items-center justify-center transition-colors
              ${priority === 'high' ? 'text-red-500 bg-red-50'
                : priority === 'medium' ? 'text-amber-500 bg-amber-50'
                : 'text-green-500 bg-green-50'}
            `}
          >
            <span className="material-symbols-outlined text-xl">{getPriorityIcon(priority)}</span>
          </button>
          {priorityOpen && (
            <ul
              role="listbox"
              className="absolute bottom-full left-0 mb-3 min-w-[8rem] bg-white rounded-2xl shadow-xl border border-gray-100 p-2 animate-in fade-in zoom-in-95 duration-150 z-10"
            >
              {PRIORITIES.map((p) => (
                <li
                  key={p}
                  role="option"
                  aria-selected={priority === p}
                  onClick={() => {
                    setPriority(p);
                    setPriorityOpen(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-left hover:bg-gray-50 transition-colors cursor-pointer ${
                    priority === p ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Type a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !title && setIsFocused(false)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-3 text-gray-700 font-medium placeholder:text-gray-300"
        />

        {/* Status Selector */}
        <div ref={statusRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={statusOpen}
            aria-label={`Status: ${status}`}
            onClick={() => {
              setStatusOpen((o) => !o);
              setPriorityOpen(false);
            }}
            className="px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {status.replace('-', ' ')}
          </button>
          {statusOpen && (
            <ul
              role="listbox"
              className="absolute bottom-full right-0 mb-3 min-w-[8rem] bg-white rounded-2xl shadow-xl border border-gray-100 p-2 animate-in fade-in zoom-in-95 duration-150 z-10"
            >
              {STATUSES.map((s) => (
                <li
                  key={s}
                  role="option"
                  aria-selected={status === s}
                  onClick={() => {
                    setStatus(s);
                    setStatusOpen(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-right hover:bg-gray-50 transition-colors cursor-pointer ${
                    status === s ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  {s.replace('-', ' ')}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={handleAddTask}
          disabled={loading || !title.trim()}
          className={`
            w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
            ${title.trim() ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-100' : 'bg-gray-100 text-gray-300 scale-95'}
          `}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
          ) : (
            <span className="material-symbols-outlined font-black">arrow_upward</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddTask;
