import { BaseFieldProps } from './types';
import { FieldLabel } from '../FieldLabel';

export function TextareaField({ field, value, error, onChange, isDisabled }: BaseFieldProps) {
    return (
        <div>
            <FieldLabel field={field} />
            <textarea
                id={field.name}
                name={field.name}
                value={String(value ?? '')}
                onChange={onChange}
                placeholder={field.placeholder}
                disabled={isDisabled}
                rows={field.rows || 4}
                className="form-input-field"
            />
            {field.description && <p className="form-input-description">{field.description}</p>}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
