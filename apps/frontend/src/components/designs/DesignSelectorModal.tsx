'use client';

import { useState } from 'react';
import { designs as designsList, DesignType } from '@/app/(designs)/design.data';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (design: DesignType) => void;
}

export function DesignSelectorModal({ isOpen, onClose, onSelect }: Props) {
  const [filter, setFilter] = useState<'All' | 'Certificate' | 'Badge'>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = designsList.filter((d) => {
    const matchFilter = filter === 'All' || d.type === filter;
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleConfirm = () => {
    const found = designsList.find((d) => d.id === selectedId);
    if (found) {
      onSelect(found);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm py-8" onClick={onClose}>
      <div className="relative w-full max-w-5xl rounded-md" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-lg shadow-lg border border-default p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Select the design(s) you want to attach to the group</h3>
              <p className="text-sm text-muted mt-1">A group may include one certificate and one badge.</p>
            </div>
            <button onClick={onClose} className="text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-full text-sm w-8 h-8 inline-flex justify-center items-center">
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M18 18 6 6" />
              </svg>
            </button>
          </div>

          {/* Tabs + Search */}
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-3">
              <button className={`px-3 py-2 text-sm ${filter === 'All' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700'}`} onClick={() => setFilter('All')}>All Designs</button>
              <button className={`px-3 py-2 text-sm ${filter === 'Certificate' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700'}`} onClick={() => setFilter('Certificate')}>Certificates</button>
              <button className={`px-3 py-2 text-sm ${filter === 'Badge' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700'}`} onClick={() => setFilter('Badge')}>Badges</button>
            </div>

            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="Search designs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-stone-300 rounded px-3 py-2 w-80 text-sm"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-auto mb-4">
            {filtered.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`cursor-pointer rounded-md p-3 border ${selectedId === d.id ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'} bg-white`}
              >
                <div className="w-full h-36 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
                  <img src={d.thumbnail} alt={d.title} className="object-contain max-h-full" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{d.title}</div>
                      <div className="text-xs text-muted mt-1">{d.type}</div>
                    </div>
                    <div>
                      <input type="checkbox" checked={selectedId === d.id} readOnly className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3">
            <a href="/designs/add-design" className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">+ Create New Design</a>
            <button onClick={handleConfirm} disabled={!selectedId} className={`px-4 py-2 text-white rounded ${selectedId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
              Add to Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
