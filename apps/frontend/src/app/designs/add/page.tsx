'use client';

import { useSearchParams } from 'next/navigation';
import { DesignFormPage } from "../_components/DesignFormPage";
export default function AddDesignPage() {
  const params = useSearchParams();
  const type = params.get('type') as 'certificate' | 'badge' | null;

  return (
    <DesignFormPage
      mode="add"
      designType={type ?? 'certificate'}
    />
  );
}
