'use client';

import { useState, useEffect, useRef } from 'react';
import { buildValueMap, type PlaceholderKey } from '@certify/certificate-core';
import type { Design } from '@/types';

interface CertificateDesignPreviewProps {
  design: Design;
  recipientName: string;
  recipientEmail: string;
  eventName: string;
  issuedDate: string;
  expirationDate: string;
  isDraft?: boolean;
}

export function CertificateDesignPreview({
  design,
  recipientName,
  recipientEmail,
  eventName,
  issuedDate,
  expirationDate,
  isDraft,
}: Readonly<CertificateDesignPreviewProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const layout = design.layout;
  const canvasWidth = layout?.canvasWidth ?? 1100;
  const canvasHeight = layout?.canvasHeight ?? 800;
  const placeholders = layout?.placeholders ?? [];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setScale(width / canvasWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [canvasWidth]);

  const valueMap = buildValueMap({
    recipientName,
    recipientEmail,
    credentialUuid: '',
    issuedDate,
    expirationDate,
    eventName,
  });

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {isDraft && (
        <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-center">
          <span className="text-xs font-medium text-amber-700">Draft Preview</span>
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: canvasHeight * scale,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: canvasWidth,
            height: canvasHeight,
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
          }}
        >
          <img
            src={design.url}
            alt="Certificate background"
            style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }}
          />
          {placeholders.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                transform: `translate(-50%, -50%) scale(${p.scaleX ?? 1}, ${p.scaleY ?? 1})`,
                fontSize: p.fontSize,
                fontFamily: p.fontFamily,
                fontWeight: p.fontWeight ?? 'normal',
                fontStyle: p.fontStyle ?? 'normal',
                color: p.color,
                textAlign: p.align ?? 'left',
                maxWidth: p.maxWidth ?? undefined,
                whiteSpace: p.maxWidth ? 'normal' : 'nowrap',
                lineHeight: 1.2,
                pointerEvents: 'none',
              }}
            >
              {valueMap[p.key as PlaceholderKey] ?? p.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
