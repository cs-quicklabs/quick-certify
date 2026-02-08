'use client';

import { Design } from '@/types';
import { Images, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (design: Design) => void;
  designsList: Design[];
}

export function DesignSelectorModal({ isOpen, onClose, onSelect, designsList }: Props) {
  const [filter, setFilter] = useState<'All' | 'Certificate' | 'Badge'>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = designsList.filter((d: Design) => {
    const matchFilter = filter === 'All' || d.type.toLocaleLowerCase() === filter.toLocaleLowerCase();
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleConfirm = () => {
    const found = designsList.find((d) => d.uuid === selectedId);
    if (found) {
      onSelect(found);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm py-8" onClick={onClose}>
      <div className="relative w-full max-w-5xl rounded-md" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-lg shadow-lg border border-default p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Select the design you’d like to add in this group</h3>
              <p className="text-sm text-gray-500 mt-1">A group may consist of one certificate and one badge.</p>
            </div>
            <button onClick={onClose} className="text-body bg-gray-200 hover:bg-gray-300 hover:text-heading rounded-full text-sm w-8 h-8 inline-flex justify-center items-center">
              <X size={'18'} />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[50vh] overflow-auto mb-4">
            {filtered.length > 0 && filtered.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedId(d.uuid)}
                className={`cursor-pointer rounded-md p-3 border ${selectedId === d.uuid ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'} bg-white`}
              >
                <div className="w-full h-24 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
                  <img src={d.url} alt={d.name} className="object-contain max-h-full" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{d.name}</div>
                      <span className="capitalize bg-brand-softer border border-brand-subtle text-fg-brand-strong text-xs font-medium px-1.5 py-0.5 rounded">{d.type}</span>
                    </div>
                    <div>
                      <input type="checkbox" checked={selectedId === d.uuid} readOnly className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))
            }
          </div>
          {!filtered.length &&
            <div className="flex h-20 flex-col items-center rounded-lg mt-12">
              <div className="flex items-center gap-x-2 text-gray-600">
                <span className="text-sm">{"No design is available yet. You can create a new design from the Design page."}</span>
              </div>
            </div>
          }

          <div className="flex items-center justify-end gap-3">
            {filtered.length > 0 ? <button onClick={handleConfirm} disabled={!selectedId} className={`btn-primary ${selectedId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
              Add to Group
            </button> : <Link href="/designs" className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">Create New Design</Link>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
