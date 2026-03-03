'use client';

import { useSearchParams } from 'next/navigation';
import { DesignFormPage } from '../_components/DesignFormPage';
import { DesignType } from '@/types';
export default function AddDesignPage() {
  const params = useSearchParams();
  const type = params.get('type') as DesignType;

  return <DesignFormPage mode="add" designType={type ?? 'certificate'} />;
}
