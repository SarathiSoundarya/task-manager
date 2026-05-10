'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  /** Tailwind classes applied to this option's pill when it's the current value */
  color?: string;
}

interface DropdownProps<T extends string = string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  /** Visual class to apply to the trigger pill based on current value (overrides option.color). */
  triggerColor?: string;
  /** Optional aria-label for the trigger button. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Tiny click-to-open dropdown. Replaces a native <select> in cases where
 * the controlled-select round-trip causes the dropdown to collapse before the
 * user's choice sticks. Behaviour:
 *   - Click the trigger → menu expands.
 *   - Click an option → onChange fires, menu collapses.
 *   - Click anywhere outside → menu collapses.
 *   - Press Escape → menu collapses.
 */
export default function Dropdown<T extends string = string>({
  value,
  options,
  onChange,
  triggerColor,
  ariaLabel,
  className = '',
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pickColor = triggerColor ?? current?.color ?? 'bg-gray-50 text-gray-600 border-gray-100';

  return (
    <div ref={wrapperRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border transition-colors cursor-pointer outline-none flex items-center gap-1 ${pickColor}`}
      >
        <span>{current?.label ?? value}</span>
        <span
          className={`material-symbols-outlined text-sm transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          expand_more
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 right-0 min-w-[7rem] bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setOpen(false);
                  if (!isSelected) onChange(opt.value);
                }}
                className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
