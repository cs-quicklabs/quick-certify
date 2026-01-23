import { BaseFieldProps } from './types';
import { FieldLabel } from '../FieldLabel';
import { FieldIcon } from '../FieldIcon';

export function InputField({ field, value, error, onChange, isDisabled }: BaseFieldProps) {
  return (
    <div>
      <FieldLabel field={field} />
      <div className="flex">
        <FieldIcon icon={field.icon} />
        <input
          id={field.name}
          name={field.name}
          type={field.type}
          value={String(value ?? '')}
          onChange={onChange}
          placeholder={field.placeholder}
          disabled={isDisabled}
          required={field.required}
          className={`form-input-field ${field.icon ? 'rounded-s-none' : ''}`}
        />
      </div>
      {field.description && <p className="form-input-description">{field.description}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
