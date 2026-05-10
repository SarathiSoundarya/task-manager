'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase, Task, Subtask } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import AddTask from './AddTask';
import AISubtaskManager from './AISubtaskManager';
import SubtaskList from './SubtaskList';
import Dropdown, { DropdownOption } from './Dropdown';

const PRIORITY_OPTIONS: DropdownOption<'low' | 'medium' | 'high'>[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const STATUS_OPTIONS: DropdownOption<'pending' | 'in-progress' | 'done'>[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

interface TaskListProps {
  user: User;
}

const TaskList = ({ user }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Record<string, Subtask[]>>({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [aiManagerOpen, setAiManagerOpen] = useState<string | null>(null);

  const fetchSubtasks = useCallback(async (taskId: string) => {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .eq('is_deleted', false)
      .order('position', { ascending: true });

    if (!error && data) {
      setSubtasks(prev => ({ ...prev, [taskId]: data }));
    }
  }, []);

  const setSubtasksForTask = useCallback((taskId: string, next: Subtask[]) => {
    setSubtasks(prev => ({ ...prev, [taskId]: next }));
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (!error && data) {
      setTasks(data);
      // Fetch subtasks for all tasks
      data.forEach(task => fetchSubtasks(task.id));
    }
    setLoading(false);
  }, [user.id, fetchSubtasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    // Optimistic: flip UI now, then sync DB.
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id);
    if (error) {
      console.error('toggleTask failed:', error);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
    }
  };

  const deleteTask = async (id: string) => {
    const removed = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase
      .from('tasks')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error && removed) {
      console.error('deleteTask failed:', error);
      setTasks(prev => [removed, ...prev]);
    }
  };

  const updateTaskField = async (
    id: string,
    field: 'priority' | 'status',
    value: string,
  ) => {
    // Capture the previous value so we can revert if the DB rejects.
    const oldValue = tasks.find(t => t.id === id)?.[field];

    // Optimistic update — controlled <select> requires this; otherwise React
    // reverts the user's selection because state hasn't changed yet.
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));

    const { error } = await supabase
      .from('tasks')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      console.error(`updateTaskField(${field}) failed:`, error);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: oldValue ?? t[field] } : t));
    }
  };

  const toggleExpand = (taskId: string) => {
    const next = new Set(expandedTasks);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    setExpandedTasks(next);
  };

  const filteredTasks = tasks.filter(task => {
    const matchStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-600 border-red-100';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'low': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-primary/10 text-primary border-primary/20';
      case 'in-progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-700">
      <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 space-y-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <h2 className="text-[32px] font-black text-gray-900 tracking-tight">Your Tasks</h2>
          
          <div className="flex flex-wrap gap-2">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-bold bg-gray-50 border-none rounded-lg px-3 py-2 text-gray-500 focus:ring-1 focus:ring-primary/20 outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs font-bold bg-gray-50 border-none rounded-lg px-3 py-2 text-gray-500 focus:ring-1 focus:ring-primary/20 outline-none"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">search</span>
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/10 outline-none placeholder:text-gray-300 text-gray-600"
          />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div key={task.id} className="group bg-gray-50/50 p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <input 
                        type="checkbox" 
                        checked={task.status === 'done'} 
                        onChange={() => toggleTask(task)}
                        className="checkbox-large flex-shrink-0"
                      />
                      <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(task.id)}>
                        <span className={`text-[16px] font-semibold tracking-tight leading-snug flex items-center gap-2 ${task.status === 'done' ? 'text-gray-300 line-through' : 'text-gray-800'}`}>
                          {task.title}
                          {(subtasks[task.id]?.length > 0) && (
                            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                              {subtasks[task.id]?.filter(s => s.is_completed).length}/{subtasks[task.id]?.length}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:ml-auto">
                      <Dropdown
                        value={task.priority}
                        options={PRIORITY_OPTIONS}
                        triggerColor={getPriorityColor(task.priority)}
                        ariaLabel="Task priority"
                        onChange={(v) => updateTaskField(task.id, 'priority', v)}
                      />

                      <Dropdown
                        value={task.status}
                        options={STATUS_OPTIONS}
                        triggerColor={getStatusColor(task.status)}
                        ariaLabel="Task status"
                        onChange={(v) => updateTaskField(task.id, 'status', v)}
                      />

                      <button 
                        onClick={() => setAiManagerOpen(task.id)}
                        className="text-primary/40 hover:text-primary transition-colors"
                        title="AI Subtasks"
                      >
                        <span className="material-symbols-outlined text-xl">auto_awesome</span>
                      </button>

                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Subtasks Area */}
                  {expandedTasks.has(task.id) && (
                    <SubtaskList
                      taskId={task.id}
                      subtasks={subtasks[task.id] ?? []}
                      onChange={(next) => setSubtasksForTask(task.id, next)}
                    />
                  )}

                  {/* AI Manager Component */}
                  {aiManagerOpen === task.id && (
                    <AISubtaskManager 
                      taskId={task.id} 
                      taskTitle={task.title}
                      onSubtasksAccepted={() => fetchSubtasks(task.id)}
                      onClose={() => setAiManagerOpen(null)}
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center space-y-2">
                <span className="material-symbols-outlined text-gray-200 text-5xl">task_alt</span>
                <p className="text-gray-400 font-bold">No tasks found</p>
              </div>
            )}
          </div>
        )}

        <div className="h-px bg-gray-50 w-full"></div>
      </div>
    </div>
  );
};

export default TaskList;




