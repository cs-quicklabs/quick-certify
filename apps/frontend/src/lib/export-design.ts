import { Canvas } from 'fabric';

let canvasRef: Canvas | null = null;

export function registerCanvas(canvas: Canvas) {
  canvasRef = canvas;
}

export async function exportCertificate(): Promise<File> {
  if (!canvasRef) {
    throw new Error('Canvas not ready');
  }

  const dataUrl = canvasRef.toDataURL({
    format: 'png',
    multiplier: 2, // high-res
  });

  const blob = await fetch(dataUrl).then((r) => r.blob());

  return new File([blob], 'certificate.png', {
    type: 'image/png',
  });
}
