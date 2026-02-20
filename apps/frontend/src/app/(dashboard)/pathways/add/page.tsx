'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { useCreatePathway } from '@/hooks/usePathways';
import { ROUTES } from '@/config/routes';
import { showSuccessToast } from '@/lib/toast';
import { FileDropzone } from '@/components/ui';

interface SelectedCredential {
  uuid: string;
  name: string;
  isFinal: boolean;
}

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
    setSelectedCredentials((prev) =>
      prev.map((c, i) => (i === index ? { ...c, isFinal: !c.isFinal } : c)),
    );
  };

  const handleSubmit = useCallback(
    async (status: 'active' | 'draft') => {
      if (!name.trim()) return;

      createPathway.mutate(
        {
          name: name.trim(),
          status,
          credentialIds: selectedCredentials.map((c) => c.uuid),
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

            {/* Credentials List */}
            {selectedCredentials.length > 0 ? (
              <div className="border border-gray-200 rounded-sm dark:border-gray-600 overflow-hidden mb-6">
                <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                  {selectedCredentials.map((credential, index) => (
                    <li
                      key={credential.uuid}
                      className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        credential.isFinal
                          ? 'ring-1 ring-inset ring-green-200 bg-green-50 hover:bg-green-50 dark:bg-green-900/20'
                          : ''
                      }`}
                    >
                      {/* Drag handle */}
                      <span className="shrink-0 cursor-grab text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                          <circle cx="5" cy="3" r="1.5" />
                          <circle cx="11" cy="3" r="1.5" />
                          <circle cx="5" cy="8" r="1.5" />
                          <circle cx="11" cy="8" r="1.5" />
                          <circle cx="5" cy="13" r="1.5" />
                          <circle cx="11" cy="13" r="1.5" />
                        </svg>
                      </span>

                      {/* Order number */}
                      <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {index + 1}
                      </span>

                      {/* Credential name */}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">
                          {credential.name}
                        </span>
                      </div>

                      {/* Mark as final */}
                      <button
                        type="button"
                        className={`shrink-0 text-xs px-2 py-1 rounded-sm border cursor-pointer transition-opacity ${
                          credential.isFinal
                            ? 'opacity-100 bg-green-100 text-green-800 border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-600'
                            : 'opacity-0 group-hover:opacity-100 bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600'
                        }`}
                        onClick={() => toggleFinal(index)}
                      >
                        {credential.isFinal ? 'Final' : 'Mark Final'}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        className="shrink-0 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
                        onClick={() => removeCredential(credential.uuid)}
                        aria-label="Remove credential"
                      >
                        <svg
                          className="w-4 h-4 text-red-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-sm px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400 mb-6">
                No credentials added yet. Search and add credentials above.
              </div>
            )}

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
