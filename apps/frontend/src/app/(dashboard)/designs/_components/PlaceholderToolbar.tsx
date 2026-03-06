'use client';

import { useState, useRef, useEffect } from 'react';
import { Variable, ChevronDown, X } from 'lucide-react';
import { PLACEHOLDER_VARIABLES, type PlaceholderVariable } from '@/config/placeholder-variables';
import type { PlaceholderKey } from '@/types/design.types';

type Props = {
  insertedKeys: PlaceholderKey[];
  onInsertVariable: (variable: PlaceholderVariable) => void;
  onRemoveVariable: (key: PlaceholderKey) => void;
};

export function PlaceholderToolbar({ insertedKeys, onInsertVariable, onRemoveVariable }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      >
        <Variable className="h-4 w-4" />
        Insert Variable
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 w-56 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="py-1">
            {PLACEHOLDER_VARIABLES.map((variable) => {
              const isInserted = insertedKeys.includes(variable.key);
              return (
                <button
                  key={variable.key}
                  type="button"
                  disabled={isInserted}
                  onClick={() => {
                    onInsertVariable(variable);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                    isInserted
                      ? 'cursor-not-allowed text-gray-400'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{variable.label}</span>
                  <span className="font-mono text-xs text-gray-400">{variable.template}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Inserted placeholder chips */}
      {insertedKeys.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {insertedKeys.map((key) => {
            const variable = PLACEHOLDER_VARIABLES.find((v) => v.key === key);
            if (!variable) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
              >
                {variable.label}
                <button
                  type="button"
                  onClick={() => onRemoveVariable(key)}
                  className="ml-0.5 rounded-sm p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
