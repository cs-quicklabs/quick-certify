import { BaseFieldProps } from './types';
import { FieldLabel } from '../FieldLabel';
import { FieldIcon } from '../FieldIcon';
import { Input } from '@/components/ui';

export function InputField({ field, value, error, onChange, isDisabled }: BaseFieldProps) {
  function renderInput() {
    if (field.type === 'password') {
      return (
        <Input
          id={field.name}
          name={field.name}
          type="password"
          value={String(value ?? '')}
          onChange={onChange}
          placeholder={field.placeholder}
          disabled={isDisabled}
          required={field.required}
          min={field.min}
          max={field.max}
          className={`form-input-field ${field.icon ? 'rounded-s-none' : ''}`}
          showPasswordToggle
        />
      );
    }

    return (
      <input
        id={field.name}
        name={field.name}
        type={field.type}
        value={String(value ?? '')}
        onChange={onChange}
        placeholder={field.placeholder}
        disabled={isDisabled}
        required={field.required}
        min={field.min}
        max={field.max}
        className={`form-input-field ${field.icon ? 'rounded-s-none' : ''}`}
      />
    );
  }

  return (
    <div className={field.className ?? ''}>
      <FieldLabel field={field} />
      <div className="flex">
        <FieldIcon icon={field.icon} />
        {renderInput()}
      </div>
      {field.description && <p className="form-input-description">{field.description}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
