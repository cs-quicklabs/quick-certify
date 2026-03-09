'use client';

import { useState, useEffect, useRef } from 'react';
import { buildValueMap, type PlaceholderKey } from '@certify/certificate-core';
import type { Design } from '@/types';

/** Measures rendered text width using an off-screen canvas. */
function measureTextWidth(
  text: string,
  fontSize: number,
  fontFamily: string,
  fontWeight = 'normal',
  fontStyle = 'normal',
): number {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`;
  return ctx.measureText(text).width;
}

/** Returns the largest font size ≤ maxFontSize at which text fits within maxWidth. */
function fitFontSize(
  text: string,
  maxFontSize: number,
  maxWidth: number,
  fontFamily: string,
  fontWeight?: string,
  fontStyle?: string,
): number {
  if (maxWidth <= 0) return maxFontSize;
  const measured = measureTextWidth(text, maxFontSize, fontFamily, fontWeight, fontStyle);
  if (measured <= maxWidth) return maxFontSize;
  return Math.max(6, Math.floor(maxFontSize * (maxWidth / measured)));
}

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
          {placeholders.map((p) => {
            // Use the designer's intended width; fall back to canvas-edge for old designs
            const maxTextWidth = p.maxWidth
              ? p.maxWidth
              : Math.max(60, (Math.min(p.x, canvasWidth - p.x) - 20) * 2);
            // Cap font size at 68px (height constraint), then shrink to fit width
            const baseFontSize = Math.min(Math.round(p.fontSize * (p.scaleY ?? 1)), 68);
            const displayText = valueMap[p.key as PlaceholderKey] ?? p.text;
            const fittedFontSize = fitFontSize(
              displayText,
              baseFontSize,
              maxTextWidth,
              p.fontFamily,
              p.fontWeight,
              p.fontStyle,
            );
            return (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: p.x,
                  top: p.y,
                  transform: 'translate(-50%, -50%)',
                  fontSize: fittedFontSize,
                  fontFamily: p.fontFamily,
                  fontWeight: p.fontWeight ?? 'normal',
                  fontStyle: p.fontStyle ?? 'normal',
                  color: p.color,
                  textAlign: p.align ?? 'center',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                  pointerEvents: 'none',
                }}
              >
                {displayText}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
