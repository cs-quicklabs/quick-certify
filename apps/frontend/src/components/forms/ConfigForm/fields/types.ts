import { FormFieldConfig } from '@/types/form.types';
import { ChangeEvent } from 'react';

export interface BaseFieldProps {
    field: FormFieldConfig;
    value: unknown;
    error?: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isDisabled?: boolean;
}
