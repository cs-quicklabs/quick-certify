'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DesignPreview from '@/app/designs/_components/DesignPreview';
import { designService } from '@/services/api';
import { Design } from '@/services/api/design.service';

export default function PreviewDesignPage() {
  const { id } = useParams<{ id: string }>();

  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    designService
      .getDesignById(id)
      .then((data) => {
        if (mounted) setDesign(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return null; // or spinner
  if (!design) return null;

  return <DesignPreview name={design.name} imageUrl={design.url} />;
}
