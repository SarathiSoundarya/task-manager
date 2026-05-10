'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AISubtaskManagerProps {
  taskId: string;
  taskTitle: string;
  onSubtasksAccepted: () => void;
  onClose: () => void;
}

const AISubtaskManager = ({ taskId, taskTitle, onSubtasksAccepted, onClose }: AISubtaskManagerProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generateSubtasks = async (refinementComments?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('generate-subtasks', {
        body: {
          taskTitle,
          comments: refinementComments,
          currentSubtasks: suggestions,
        },
      });

      if (funcError) {
        let serverMessage = funcError.message;
        try {
          const ctxBody = await (funcError as any)?.context?.json?.();
          if (ctxBody?.error) serverMessage = ctxBody.error;
        } catch (_) {
          // ignore — fall back to funcError.message
        }
        throw new Error(serverMessage);
      }
      if (data?.error) throw new Error(data.error);
      if (!Array.isArray(data?.subtasks)) {
        throw new Error('Unexpected response from subtask generator');
      }

      setSuggestions(data.subtasks);
      // Select all by default whenever a new suggestion list arrives.
      setSelected(new Set(data.subtasks.map((_: string, i: number) => i)));
    } catch (err: any) {
      console.error('AI Error:', err);
      setError(err?.message || 'Unable to create subtasks this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelected = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const insertSubtasks = async (titles: string[]) => {
    if (titles.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      // Append after any existing (non-deleted) subtasks for this task.
      const { data: existing, error: posError } = await supabase
        .from('subtasks')
        .select('position')
        .eq('task_id', taskId)
        .eq('is_deleted', false)
        .order('position', { ascending: false })
        .limit(1);

      if (posError) throw posError;
      const startPosition = (existing?.[0]?.position ?? 0) + 1;

      const { error: insertError } = await supabase.from('subtasks').insert(
        titles.map((title, i) => ({
          task_id: taskId,
          title,
          position: startPosition + i,
        }))
      );

      if (insertError) throw insertError;
      onSubtasksAccepted();
      onClose();
    } catch (err: any) {
      console.error('Save subtasks failed:', err);
      setError(err?.message || 'Failed to save subtasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAll = () => insertSubtasks(suggestions);
  const handleAcceptSelected = () =>
    insertSubtasks(suggestions.filter((_, i) => selected.has(i)));

  const selectedCount = selected.size;

  return (
    <div className="bg-blue-50/50 rounded-2xl p-6 mt-4 border border-blue-100 space-y-4 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined font-black">auto_awesome</span>
          <h4 className="font-black text-sm uppercase tracking-wider">AI Suggestions</h4>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold text-center">
          {error}
        </div>
      )}

      {suggestions.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
            <span>{selectedCount} of {suggestions.length} selected</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelected(new Set(suggestions.map((_, i) => i)))}
                className="text-primary hover:underline disabled:text-gray-300 disabled:no-underline"
                disabled={selectedCount === suggestions.length}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-gray-500 hover:underline disabled:text-gray-300 disabled:no-underline"
                disabled={selectedCount === 0}
              >
                Clear
              </button>
            </div>
          </div>

          {suggestions.map((s, i) => (
            <label
              key={i}
              className={`bg-white px-4 py-2 rounded-xl text-sm text-gray-700 border shadow-sm flex items-center gap-3 cursor-pointer transition-colors ${
                selected.has(i) ? 'border-primary/30' : 'border-blue-50 opacity-60'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(i)}
                onChange={() => toggleSelected(i)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
              />
              <span className="flex-1">{s}</span>
            </label>
          ))}

          <div className="pt-4 space-y-3">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Feedback for AI (e.g. 'More detailed')"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-white border border-blue-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
              <button
                onClick={() => generateSubtasks(comments)}
                disabled={loading}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline self-end disabled:text-gray-300 disabled:no-underline"
              >
                Refine with AI
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAcceptSelected}
                disabled={loading || selectedCount === 0}
                className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl text-xs hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Accept Selected ({selectedCount})
              </button>
              <button
                onClick={handleAcceptAll}
                disabled={loading}
                className="flex-1 bg-white text-primary font-bold py-2.5 rounded-xl text-xs border border-primary/30 hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                Accept All
              </button>
              <button
                onClick={() => {
                  setSuggestions([]);
                  setSelected(new Set());
                }}
                disabled={loading}
                className="flex-1 sm:flex-initial sm:px-5 bg-white text-gray-500 font-bold py-2.5 rounded-xl text-xs border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => generateSubtasks()}
          disabled={loading}
          className="w-full py-6 border-2 border-dashed border-blue-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-primary/60 hover:text-primary hover:border-blue-200 transition-all font-bold"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary"></div>
          ) : (
            <>
              <span className="material-symbols-outlined text-3xl">psychology</span>
              <span className="text-xs uppercase tracking-widest">Generate Subtasks</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default AISubtaskManager;
