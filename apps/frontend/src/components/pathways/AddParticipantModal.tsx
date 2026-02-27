'use client';

import { useState, useRef, useEffect } from 'react';
import { useAddParticipant } from '@/hooks/usePathways';
import { showSuccessToast } from '@/lib/toast';
import { X } from 'lucide-react';

interface AddParticipantModalProps {
  pathwayId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddParticipantModal({ pathwayId, isOpen, onClose }: AddParticipantModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const addParticipant = useAddParticipant();

  // Close modal on backdrop click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div ref={modalRef} className="relative w-full max-w-md bg-white rounded-sm shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add Participant</h3>
          <button className="cursor-pointer p-1 rounded-sm hover:bg-gray-100" onClick={onClose}>
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form
          className="p-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !email.trim()) return;
            addParticipant.mutate(
              {
                pathwayUuid: pathwayId,
                name: name.trim(),
                email: email.trim(),
              },
              {
                onSuccess: () => {
                  showSuccessToast('Participant added successfully');
                  setName('');
                  setEmail('');
                  onClose();
                },
              },
            );
          }}
        >
          <div>
            <label htmlFor="participant-name" className="form-input-label">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="participant-name"
              type="text"
              required
              className="form-input-field w-full"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="participant-email" className="form-input-label">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="participant-email"
              type="email"
              required
              className="form-input-field w-full"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="form-input-description">
              An invitation will be sent to this email address.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="submit" className="btn-primary" disabled={addParticipant.isPending}>
              {addParticipant.isPending ? 'Adding...' : 'Send Invite'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
