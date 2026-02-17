'use client';

import { useParams } from 'next/navigation';
import DesignPreview from '@/app/designs/_components/DesignPreview';
import { useDesignById } from '@/hooks/useDesigns';

export default function PreviewModalPage() {
  const { id } = useParams<{ id: string }>();

  const { data: design, isLoading, error } = useDesignById(id ?? '');

  if (isLoading) return null; // or spinner
  if (error || !design) return null;

  return <DesignPreview name={design.name} imageUrl={design.url} />;
}
