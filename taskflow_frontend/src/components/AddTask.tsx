'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AddTaskProps {
  userId: string;
  onTaskAdded: () => void;
}

const AddTask = ({ userId, onTaskAdded }: AddTaskProps) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'done'>('pending');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleAddTask = async () => {
    if (!title.trim()) return;
    setLoading(true);

    const { error } = await supabase
      .from('tasks')
      .insert([
        { 
          user_id: userId, 
          title, 
          priority, 
          status 
        }
      ]);

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
      <div className={`
        bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] 
        rounded-[24px] p-2 flex items-center gap-2 transition-all duration-300
        ${isFocused ? 'ring-2 ring-primary/20 shadow-[0_25px_60px_rgba(66,133,244,0.15)]' : ''}
      `}>
        
        {/* Priority Selector */}
        <div className="relative group">
          <button className={`
            p-3 rounded-2xl flex items-center justify-center transition-colors
            ${priority === 'high' ? 'text-red-500 bg-red-50' : 
              priority === 'medium' ? 'text-amber-500 bg-amber-50' : 'text-green-500 bg-green-50'}
          `}>
            <span className="material-symbols-outlined text-xl">{getPriorityIcon(priority)}</span>
          </button>
          <div className="absolute bottom-full left-0 mb-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 hidden group-hover:block animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col gap-1">
              {['high', 'medium', 'low'].map((p) => (
                <button 
                  key={p}
                  onClick={() => setPriority(p as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-left hover:bg-gray-50 transition-colors ${priority === p ? 'text-primary' : 'text-gray-400'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
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
        <div className="relative group">
          <button className="px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors">
            {status.replace('-', ' ')}
          </button>
          <div className="absolute bottom-full right-0 mb-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 hidden group-hover:block animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col gap-1">
              {['pending', 'in-progress', 'done'].map((s) => (
                <button 
                  key={s}
                  onClick={() => setStatus(s as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-right hover:bg-gray-50 transition-colors ${status === s ? 'text-primary' : 'text-gray-400'}`}
                >
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add Button */}
        <button 
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
