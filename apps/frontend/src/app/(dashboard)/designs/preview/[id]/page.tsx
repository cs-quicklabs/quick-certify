'use client';

import { useParams } from 'next/navigation';
import DesignPreview from '../../_components/DesignPreview';
import { useDesignById } from '@/hooks/useDesigns';

export default function PreviewDesignPage() {
  const { id } = useParams<{ id: string }>();

  const { data: design, isLoading, error } = useDesignById(id);

  if (isLoading) return null;
  if (error || !design) return null;

  return <DesignPreview name={design.name} imageUrl={design.url} />;
}
