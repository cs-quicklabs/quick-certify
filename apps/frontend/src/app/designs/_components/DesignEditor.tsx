'use client';

import { useEffect, useRef } from 'react';
import { Canvas, FabricImage, IText } from 'fabric';

const CANVAS_WIDTH = 1100;
const CANVAS_HEIGHT = 800;

type Props = {
  backgroundUrl: string;
};

export function DesignEditor({ backgroundUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup
    containerRef.current.innerHTML = '';

    const canvasEl = document.createElement('canvas');
    canvasEl.width = CANVAS_WIDTH;
    canvasEl.height = CANVAS_HEIGHT;
    containerRef.current.appendChild(canvasEl);

    const canvas = new Canvas(canvasEl, {
      preserveObjectStacking: true,
      selection: true,
    });

    canvasRef.current = canvas;

    // Background image
    FabricImage.fromURL(backgroundUrl).then((img) => {
      const iw = img.width ?? CANVAS_WIDTH;
      const ih = img.height ?? CANVAS_HEIGHT;
      const scale = Math.min(
        CANVAS_WIDTH / iw,
        CANVAS_HEIGHT / ih
      );
      img.set({
        originX: 'center',
        originY: 'center',
        left: CANVAS_WIDTH / 2,
        top: CANVAS_HEIGHT / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });

      canvas.backgroundImage = img;
      canvas.requestRenderAll();
    });

    // Editable name
    const text = new IText('[recipient.name]', {
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 42,
      fontFamily: 'Times New Roman',
      fill: '#000',
      fontWeight: 'normal',
      editable: true,
      selectable: true,
      hasControls: true,
      lockScalingFlip: true,
    });
    text.on('selected', () => {
      text.set({
        fill: '#111',
      });
      canvas.renderAll();
    });

    canvas.add(text);
    canvas.setActiveObject(text);

    // Resize observer → adapt to parent
    const resize = () => {
      if (!containerRef.current) return;

      const parentWidth = containerRef.current.clientWidth;
      const scale = parentWidth / CANVAS_WIDTH;

      canvas.setZoom(scale);
      canvas.setDimensions({
        width: CANVAS_WIDTH * scale,
        height: CANVAS_HEIGHT * scale,
      });
      canvas.renderAll();
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [backgroundUrl]);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[11/8] bg-white overflow-hidden"
    />
  );
}
