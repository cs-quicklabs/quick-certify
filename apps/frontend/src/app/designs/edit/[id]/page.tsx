'use client'

import { useParams } from 'next/navigation';
import { DesignFormPage } from '@/app/designs/_components/DesignFormPage';
import { useDesignById } from '@/hooks/useDesigns';

export default function EditDesignPage() {
  const { id } = useParams<{ id: string }>();
  const { design, loading, error } = useDesignById(id);

  if (loading) return <div>Loading...</div>;
  if (error || !design) return <div>Failed to load design</div>;

  return (
    <DesignFormPage
      mode="edit"
      id={id}
      designType={design.type}
    />
  );
}
