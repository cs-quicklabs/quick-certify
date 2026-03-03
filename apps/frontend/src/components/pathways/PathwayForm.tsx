'use client';

import { useState, useRef, useEffect } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { Plus } from 'lucide-react';
import { FileDropzone } from '@/components/ui';
import {
  SortableCredentialList,
  type SelectedCredential,
} from '@/components/pathways/SortableCredentialList';

export interface PathwayFormValues {
  name: string;
  description: string;
  bannerUrl: string | null;
  selectedCredentials: SelectedCredential[];
}

interface PathwayFormProps {
  title: string;
  subtitle: string;
  initialValues?: PathwayFormValues;
  isPending: boolean;
  onSubmit: (values: PathwayFormValues, status: 'active' | 'draft') => void;
}

export function PathwayForm({
  title,
  subtitle,
  initialValues,
  isPending,
  onSubmit,
}: PathwayFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialValues?.bannerUrl ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCredentials, setSelectedCredentials] = useState<SelectedCredential[]>(
    initialValues?.selectedCredentials ?? [],
  );

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
    setSelectedCredentials((prev) => {
      const finalIndex = prev.findIndex((c) => c.isFinal);
      const newItem = { ...credential, isFinal: false };
      if (finalIndex !== -1) {
        const updated = [...prev];
        updated.splice(finalIndex, 0, newItem);
        return updated;
      }
      return [...prev, newItem];
    });
    setSearchQuery('');
    setDropdownOpen(false);
  };

  const removeCredential = (uuid: string) => {
    setSelectedCredentials((prev) => prev.filter((c) => c.uuid !== uuid));
  };

  const toggleFinal = (index: number) => {
    setSelectedCredentials((prev) => {
      const wasFinal = prev[index].isFinal;
      const updated = prev.map((c, i) => ({
        ...c,
        isFinal: i === index ? !wasFinal : false,
      }));
      const item = updated[index];
      if (item.isFinal) {
        const withoutItem = updated.filter((_, i) => i !== index);
        return [...withoutItem, item];
      }
      return updated;
    });
  };

  const getFormValues = (): PathwayFormValues => ({
    name,
    description,
    bannerUrl,
    selectedCredentials,
  });

  const handleFormSubmit = (status: 'active' | 'draft') => {
    if (!name.trim()) return;
    onSubmit(getFormValues(), status);
  };

  return (
    <main>
      <section className="min-h-screen">
        <div className="py-6 px-4 mx-auto max-w-2xl lg:py-8">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="form-title">{title}</h1>
            <p className="form-subtitle">{subtitle}</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit('active');
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
              <p className="form-input-description">Give your pathway a clear, descriptive name.</p>
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
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-sm shadow-lg max-h-60 overflow-y-auto">
                  {filteredCredentials.length > 0 ? (
                    <ul className="py-1 text-sm text-gray-700">
                      {filteredCredentials.map((credential) => (
                        <li key={credential.uuid}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                            onClick={() => addCredential(credential)}
                          >
                            <Plus className="w-4 h-4 text-gray-400 shrink-0" />
                            {credential.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
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
              <button type="submit" className="btn-primary" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save & Activate'}
              </button>
              <button
                type="button"
                className="cursor-pointer px-4 py-2 text-sm font-medium rounded-sm border border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                disabled={isPending}
                onClick={() => handleFormSubmit('draft')}
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
