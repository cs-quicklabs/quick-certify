'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { useCreatePathway } from '@/hooks/usePathways';
import { ROUTES } from '@/config/routes';
import { showSuccessToast } from '@/lib/toast';
import { FileDropzone } from '@/components/ui';
import {
  SortableCredentialList,
  type SelectedCredential,
} from '@/components/pathways/SortableCredentialList';

export default function AddPathwayPage() {
  const router = useRouter();
  const createPathway = useCreatePathway();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCredentials, setSelectedCredentials] = useState<SelectedCredential[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: eventsData } = useEvents({ limit: 100 });
  const availableCredentials = eventsData?.data ?? [];

  const filteredCredentials = availableCredentials.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedCredentials.some((s) => s.uuid === c.uuid),
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addCredential = (credential: { uuid: string; name: string }) => {
    setSelectedCredentials((prev) => [...prev, { ...credential, isFinal: false }]);
    setSearchQuery('');
    setDropdownOpen(false);
  };

  const removeCredential = (uuid: string) => {
    setSelectedCredentials((prev) => prev.filter((c) => c.uuid !== uuid));
  };

  const toggleFinal = (index: number) => {
    setSelectedCredentials((prev) => {
      const updated = prev.map((c, i) =>
        i === index ? { ...c, isFinal: !c.isFinal } : c,
      );
      const item = updated[index];
      if (item.isFinal) {
        const withoutItem = updated.filter((_, i) => i !== index);
        return [...withoutItem, item];
      }
      return updated;
    });
  };

  const handleSubmit = useCallback(
    async (status: 'active' | 'draft') => {
      if (!name.trim()) return;

      createPathway.mutate(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          bannerUrl: bannerUrl || undefined,
          status,
          events: selectedCredentials.map((c) => ({
            eventId: c.uuid,
            isFinal: c.isFinal,
          })),
        },
        {
          onSuccess: () => {
            showSuccessToast('Pathway created successfully');
            router.push(ROUTES.PATHWAYS);
          },
        },
      );
    },
    [name, selectedCredentials, createPathway, router],
  );

  return (
    <main>
      <section className="min-h-screen">
        <div className="py-6 px-4 mx-auto max-w-2xl lg:py-8">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="form-title">Create New Pathway</h1>
            <p className="form-subtitle">
              Define a learning pathway by adding credentials in the order they should be completed.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit('active');
            }}
          >
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="pathway-name" className="form-input-label">
                Name
              </label>
              <input
                id="pathway-name"
                type="text"
                className="form-input-field w-full"
                placeholder="e.g. Full Stack Developer"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="form-input-description">
                Give your pathway a clear, descriptive name.
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label htmlFor="pathway-description" className="form-input-label">
                Description
              </label>
              <textarea
                id="pathway-description"
                rows={3}
                className="form-input-field w-full"
                placeholder="Describe what this pathway covers and who it's for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="form-input-description">
                Briefly explain the purpose and goals of this pathway.
              </p>
            </div>

            {/* Banner Image */}
            <FileDropzone
              label="Banner Image"
              description="Upload a banner image for this pathway. PNG, JPG or SVG (1920x300)"
              accept="image/png,image/jpeg,image/svg+xml"
              currentImage={bannerUrl}
              onImageChange={setBannerUrl}
              category="banner"
              imageSize="large"
              dropzoneHeight="large"
              dropzoneWidth="full"
            />

            {/* Credentials Search & Dropdown */}
            <div className="mb-2">
              <label htmlFor="credential-search" className="form-input-label">
                Credentials
              </label>
              <p className="form-input-description -mt-1 mb-2">
                Search and add credentials to this pathway. Drag to reorder.
              </p>
            </div>

            <div className="relative mb-4" ref={wrapperRef}>
              <div className="relative">
                <input
                  id="credential-search"
                  type="text"
                  className="form-input-field w-full"
                  placeholder="Search credentials to add..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setDropdownOpen(true)}
                />
              </div>

              {/* Dropdown */}
              {dropdownOpen && searchQuery.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-sm shadow-lg max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                  {filteredCredentials.length > 0 ? (
                    <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                      {filteredCredentials.map((credential) => (
                        <li key={credential.uuid}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white flex items-center gap-2 cursor-pointer"
                            onClick={() => addCredential(credential)}
                          >
                            <svg
                              className="w-4 h-4 text-gray-400 shrink-0"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                              />
                            </svg>
                            {credential.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      No matching credentials found.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Credentials List (Drag & Drop) */}
            <SortableCredentialList
              credentials={selectedCredentials}
              onReorder={setSelectedCredentials}
              onToggleFinal={toggleFinal}
              onRemove={removeCredential}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="btn-primary"
                disabled={createPathway.isPending}
              >
                {createPathway.isPending ? 'Saving...' : 'Save & Activate'}
              </button>
              <button
                type="button"
                className="cursor-pointer px-4 py-2 text-sm font-medium rounded-sm border border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                disabled={createPathway.isPending}
                onClick={() => handleSubmit('draft')}
              >
                Save as Draft
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
