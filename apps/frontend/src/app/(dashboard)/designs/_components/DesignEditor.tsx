'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage, IText } from 'fabric';
import { DesignLayout, PlaceholderKey } from '@/types';
import { PlaceholderToolbar } from './PlaceholderToolbar';
import { PLACEHOLDER_VARIABLES, type PlaceholderVariable } from '@/config/placeholder-variables';

const CANVAS_WIDTH = 1100;
const CANVAS_HEIGHT = 800;

/** Extends Fabric IText with custom placeholder metadata */
interface PlaceholderIText extends IText {
  placeholderKey?: PlaceholderKey;
  placeholderId?: string;
}

type Props = {
  backgroundUrl: string;
  initialLayout?: DesignLayout | null;
  onLayoutChangeAction?: (layout: DesignLayout) => void;
};

export function DesignEditor({ backgroundUrl, initialLayout, onLayoutChangeAction }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const layoutLoadedRef = useRef(false);
  const [insertedKeys, setInsertedKeys] = useState<PlaceholderKey[]>([]);

  // Use refs so async callbacks (FabricImage.fromURL, canvas events) never go stale
  const onLayoutChangeRef = useRef(onLayoutChangeAction);
  onLayoutChangeRef.current = onLayoutChangeAction;

  const initialLayoutRef = useRef(initialLayout);
  initialLayoutRef.current = initialLayout;

  const bgReadyRef = useRef(false);

  const emitLayout = useCallback(() => {
    if (canvasRef.current) {
      onLayoutChangeRef.current?.(extractLayout(canvasRef.current));
    }
  }, []);

  const handleInsertVariable = useCallback(
    (variable: PlaceholderVariable) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const text = new IText(variable.template, {
        left: CANVAS_WIDTH / 2,
        top: CANVAS_HEIGHT / 2,
        originX: 'center',
        originY: 'center',
        fontSize: 36,
        fontFamily: 'Times New Roman',
        fill: '#000',
        fontWeight: 'normal',
        editable: false,
        selectable: true,
        hasControls: true,
        lockScalingFlip: true,
      });

      // Store placeholder metadata as custom properties
      (text as PlaceholderIText).placeholderKey = variable.key;
      (text as PlaceholderIText).placeholderId = crypto.randomUUID();

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();

      setInsertedKeys((prev) => [...prev, variable.key]);
      emitLayout();
    },
    [emitLayout],
  );

  const handleRemoveVariable = useCallback(
    (key: PlaceholderKey) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const obj = canvas.getObjects().find((o) => (o as PlaceholderIText).placeholderKey === key);

      if (obj) {
        canvas.remove(obj);
        canvas.renderAll();
      }

      setInsertedKeys((prev) => prev.filter((k) => k !== key));
      emitLayout();
    },
    [emitLayout],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Reset refs so layout can load on the correct canvas instance
    layoutLoadedRef.current = false;
    bgReadyRef.current = false;

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
      // Guard: skip if this canvas was disposed (React Strict Mode double-invoke)
      if (canvasRef.current !== canvas) return;

      const iw = img.width ?? CANVAS_WIDTH;
      const ih = img.height ?? CANVAS_HEIGHT;
      const scale = Math.min(CANVAS_WIDTH / iw, CANVAS_HEIGHT / ih);
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

      // Load existing layout (for edit mode) after background is ready
      const layoutToLoad = initialLayoutRef.current;
      if (layoutToLoad && !layoutLoadedRef.current) {
        layoutLoadedRef.current = true;
        loadLayout(canvas, layoutToLoad);
        setInsertedKeys(layoutToLoad.placeholders.map((p) => p.key));
      }

      // Mark background as ready so the layout effect can load if data arrives later
      bgReadyRef.current = true;
    });

    // Listen for object modifications
    canvas.on('object:modified', emitLayout);

    // Clamp position within canvas bounds while dragging
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (!obj) return;
      const halfW = ((obj.width ?? 0) * (obj.scaleX ?? 1)) / 2;
      const halfH = ((obj.height ?? 0) * (obj.scaleY ?? 1)) / 2;
      obj.set({
        left: Math.max(halfW, Math.min(CANVAS_WIDTH - halfW, obj.left ?? 0)),
        top: Math.max(halfH, Math.min(CANVAS_HEIGHT - halfH, obj.top ?? 0)),
      });
      emitLayout();
    });

    // Limit resize: height capped at 45px (font size cap); width can stretch freely
    canvas.on('object:scaling', (e) => {
      const obj = e.target;
      if (!obj) return;
      const naturalW = obj.width ?? 0;
      const naturalH = obj.height ?? 0;
      if (!naturalW || !naturalH) return;
      const maxScaleY = 68 / naturalH;
      const maxScaleX = (CANVAS_WIDTH - 40) / naturalW;
      const clampedScaleX = Math.max(0.5, Math.min(obj.scaleX ?? 1, maxScaleX));
      const clampedScaleY = Math.max(0.5, Math.min(obj.scaleY ?? 1, maxScaleY));
      const halfW = (naturalW * clampedScaleX) / 2;
      const halfH = (naturalH * clampedScaleY) / 2;
      obj.set({
        scaleX: clampedScaleX,
        scaleY: clampedScaleY,
        left: Math.max(halfW, Math.min(CANVAS_WIDTH - halfW, obj.left ?? 0)),
        top: Math.max(halfH, Math.min(CANVAS_HEIGHT - halfH, obj.top ?? 0)),
      });
    });

    // Handle delete key to remove placeholders
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = canvas.getActiveObject();
        if (active && (active as PlaceholderIText).placeholderKey) {
          const key = (active as PlaceholderIText).placeholderKey!;
          canvas.remove(active);
          canvas.renderAll();
          setInsertedKeys((prev) => prev.filter((k) => k !== key));
          emitLayout();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Resize observer → adapt to parent
    const resize = () => {
      if (!containerRef.current) return;

      const parentWidth = containerRef.current.clientWidth;
      const zoomScale = parentWidth / CANVAS_WIDTH;

      canvas.setZoom(zoomScale);
      canvas.setDimensions({
        width: CANVAS_WIDTH * zoomScale,
        height: CANVAS_HEIGHT * zoomScale,
      });
      canvas.renderAll();
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('keydown', handleKeyDown);
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [backgroundUrl, emitLayout]);

  // Handle late-arriving initialLayout (when API data loads after background image)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !initialLayout || layoutLoadedRef.current || !bgReadyRef.current) return;

    layoutLoadedRef.current = true;
    loadLayout(canvas, initialLayout);
    setInsertedKeys(initialLayout.placeholders.map((p) => p.key));
  }, [initialLayout]);

  return (
    <div className="space-y-2">
      <PlaceholderToolbar
        insertedKeys={insertedKeys}
        onInsertVariable={handleInsertVariable}
        onRemoveVariable={handleRemoveVariable}
      />
      <div ref={containerRef} className="w-full aspect-11/8 bg-white border rounded-sm" />
    </div>
  );
}

function loadLayout(canvas: Canvas, layout: DesignLayout): void {
  for (const ph of layout.placeholders) {
    // Find the display template for this key
    const variable = PLACEHOLDER_VARIABLES.find((v) => v.key === ph.key);
    const displayText = variable?.template ?? ph.text;

    const text = new IText(displayText, {
      left: ph.x,
      top: ph.y,
      originX: 'center',
      originY: 'center',
      fontSize: ph.fontSize,
      fontFamily: ph.fontFamily,
      fill: ph.color,
      fontWeight: ph.fontWeight ?? 'normal',
      fontStyle: (ph.fontStyle as 'italic' | 'normal') ?? 'normal',
      textAlign: ph.align ?? 'center',
      scaleX: ph.scaleX ?? 1,
      scaleY: ph.scaleY ?? 1,
      editable: false,
      selectable: true,
      hasControls: true,
      lockScalingFlip: true,
    });

    (text as PlaceholderIText).placeholderKey = ph.key;
    (text as PlaceholderIText).placeholderId = ph.id;

    canvas.add(text);
  }
  canvas.renderAll();
}

export function extractLayout(canvas: Canvas): DesignLayout {
  const placeholders = canvas
    .getObjects()
    .filter((obj) => obj.type === 'i-text' && (obj as PlaceholderIText).placeholderKey)
    .map((obj) => {
      const text = obj as PlaceholderIText;
      const key = text.placeholderKey!;
      const id = text.placeholderId ?? crypto.randomUUID();

      return {
        id,
        type: 'text' as const,
        key,
        text: text.text ?? '',
        x: text.left ?? 0,
        y: text.top ?? 0,
        fontSize: text.fontSize ?? 36,
        fontFamily: text.fontFamily ?? 'Times New Roman',
        fontWeight: text.fontWeight as string | undefined,
        fontStyle: text.fontStyle as string | undefined,
        color: String(text.fill),
        align: (text.textAlign as 'left' | 'center' | 'right') ?? 'center',
        scaleX: text.scaleX ?? 1,
        scaleY: text.scaleY ?? 1,
        maxWidth: Math.round((text.width ?? 0) * (text.scaleX ?? 1)),
      };
    });

  return {
    version: 2,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    placeholders,
  };
}
