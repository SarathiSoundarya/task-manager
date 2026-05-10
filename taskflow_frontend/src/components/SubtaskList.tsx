'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase, Subtask } from '@/lib/supabase';

interface SubtaskListProps {
  taskId: string;
  subtasks: Subtask[];
  onChange: (next: Subtask[]) => void;
}

const SortableRow = ({
  subtask,
  onToggle,
  onDelete,
}: {
  subtask: Subtask;
  onToggle: (s: Subtask) => void;
  onDelete: (s: Subtask) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: subtask.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group/sub flex items-center gap-3 py-1"
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <span className="material-symbols-outlined text-sm">drag_indicator</span>
      </button>
      <input
        type="checkbox"
        checked={subtask.is_completed}
        onChange={() => onToggle(subtask)}
        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
      />
      <span
        className={`flex-1 text-sm font-medium ${
          subtask.is_completed ? 'text-gray-300 line-through' : 'text-gray-600'
        }`}
      >
        {subtask.title}
      </span>
      <button
        type="button"
        onClick={() => onDelete(subtask)}
        className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover/sub:opacity-100"
        aria-label="Delete subtask"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
};

const SubtaskList = ({ taskId, subtasks, onChange }: SubtaskListProps) => {
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleToggle = async (s: Subtask) => {
    const next = subtasks.map((x) =>
      x.id === s.id ? { ...x, is_completed: !s.is_completed } : x
    );
    onChange(next);
    const { error } = await supabase
      .from('subtasks')
      .update({ is_completed: !s.is_completed })
      .eq('id', s.id);
    if (error) onChange(subtasks); // revert
  };

  const handleDelete = async (s: Subtask) => {
    const next = subtasks.filter((x) => x.id !== s.id);
    onChange(next);
    const { error } = await supabase
      .from('subtasks')
      .update({ is_deleted: true })
      .eq('id', s.id);
    if (error) onChange(subtasks); // revert
  };

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title || adding) return;
    setAdding(true);
    const nextPosition =
      subtasks.length > 0 ? Math.max(...subtasks.map((s) => s.position)) + 1 : 1;

    const { data, error } = await supabase
      .from('subtasks')
      .insert({ task_id: taskId, title, position: nextPosition })
      .select()
      .single();

    if (!error && data) {
      onChange([...subtasks, data as Subtask]);
      setNewTitle('');
    }
    setAdding(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = subtasks.findIndex((s) => s.id === active.id);
    const newIndex = subtasks.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(subtasks, oldIndex, newIndex).map((s, i) => ({
      ...s,
      position: i + 1,
    }));
    onChange(reordered);

    // Persist the new positions. Only write rows whose position actually changed.
    const changed = reordered.filter(
      (s, i) => subtasks.find((o) => o.id === s.id)?.position !== s.position
    );
    await Promise.all(
      changed.map((s) =>
        supabase.from('subtasks').update({ position: s.position }).eq('id', s.id)
      )
    );
  };

  const sortedIds = subtasks.map((s) => s.id);

  return (
    <div className="mt-4 ml-10 space-y-3 animate-in slide-in-from-top-2 duration-300">
      {subtasks.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {subtasks.map((s) => (
                <SortableRow
                  key={s.id}
                  subtask={s}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex items-center gap-2 pt-1">
        <span className="material-symbols-outlined text-gray-300 text-base ml-7">
          add
        </span>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a subtask..."
          className="flex-1 bg-transparent border-b border-transparent focus:border-primary/30 text-sm text-gray-600 placeholder:text-gray-300 outline-none py-1"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newTitle.trim() || adding}
          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline disabled:text-gray-300 disabled:no-underline"
        >
          {adding ? '...' : 'Add'}
        </button>
      </div>
    </div>
  );
};

export default SubtaskList;
