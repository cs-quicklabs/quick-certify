'use client';

import { useState } from 'react';
import { Eye, SquarePen, Trash, UploadCloud } from 'lucide-react';
import { ConfigForm } from '@/components/ConfigForm';
import type { FormConfig } from '@/types/form.types';
import type { ZodTypeAny } from 'zod';

interface EventFormStep0Props {
  config: FormConfig<ZodTypeAny>;
  initialValues: Record<string, unknown>;
  formRef: React.RefObject<HTMLFormElement | null>;
  onFormChange: (values: Record<string, unknown>) => void;
  hasDesign: boolean;
  designUrl?: string;
  designTitle?: string;
  designType?: string;
  onDesignAdd: () => void;
  onDesignEdit: (e: React.MouseEvent<SVGElement>) => void;
  onDesignDelete: (e: React.MouseEvent<SVGElement>) => void;
  onCancel: () => void;
  onNext: () => void;
}

export function EventFormStep0({
  config,
  initialValues,
  formRef,
  onFormChange,
  hasDesign,
  designUrl,
  designTitle,
  designType,
  onDesignAdd,
  onDesignEdit,
  onDesignDelete,
  onCancel,
  onNext,
}: EventFormStep0Props) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="max-w-xl pb-12 px-4 lg:col-span-6">
      <ConfigForm
        config={{ ...config, showSubmit: false }}
        initialValues={initialValues}
        formRef={formRef}
        isLoading={false}
        onChange={onFormChange}
      />

      {/* Design Selection */}
      <div className="mt-4">
        <div className="mb-2">
          <label className="form-input-label">Appearance</label>
          <p className="form-input-description -mt-2 mb-2">Add a design to this event (required)</p>
        </div>

        {hasDesign ? (
          <div className="relative flex overflow-hidden rounded-lg border border-gray-300">
            <div className="relative flex h-30 w-40 items-center justify-center overflow-hidden bg-gray-100 p-2">
              <img alt={designTitle} src={designUrl} className="size-full object-contain" />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h4 className="mb-1 text-sm font-medium">{designTitle}</h4>
              <div className="flex items-center gap-x-1.5 text-gray-600">
                <span className="capitalize bg-brand-softer border border-brand-subtle text-fg-brand-strong text-xs font-medium px-1.5 py-0.5 rounded">
                  {designType}
                </span>
              </div>
              <div className="w-full mt-auto flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Eye size={16} strokeWidth={1} />
                  <span className="text-xs font-medium ml-1">Preview</span>
                </button>
                <div className="flex items-center gap-2">
                  <SquarePen
                    size={16}
                    strokeWidth={1}
                    className="cursor-pointer hover:text-blue-600"
                    onClick={onDesignEdit}
                  />
                  <Trash
                    size={16}
                    strokeWidth={1}
                    className="cursor-pointer hover:text-red-600"
                    onClick={onDesignDelete}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={onDesignAdd}
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <UploadCloud className="w-10 h-10 mb-2 text-gray-400" strokeWidth={1.5} />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold text-black">Click to select a design</span>
            </p>
            <p className="text-xs text-gray-500">Choose from your saved designs</p>
          </div>
        )}
      </div>

      {/* Step 0 Actions */}
      <div className="flex justify-end items-center mt-6">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn-primary ml-3 flex items-center gap-2" onClick={onNext}>
          Next
        </button>
      </div>

      {/* Design Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">{designTitle}</h3>
            <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6 min-h-64">
              <img src={designUrl} alt={designTitle} className="max-h-[60vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
