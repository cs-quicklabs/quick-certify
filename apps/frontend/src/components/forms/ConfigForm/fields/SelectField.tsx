import { BaseFieldProps } from './types';
import { FieldLabel } from '../FieldLabel';

export function SelectField({ field, value, error, onChange, isDisabled }: BaseFieldProps) {
  return (
    <div className="relative">
      <FieldLabel field={field} />
      <div className="relative">
        <select
          id={field.name}
          name={field.name}
          value={String(value ?? '')}
          onChange={onChange}
          disabled={isDisabled}
          className="form-input-field pr-8 appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          }}
        >
          <option value="">Select an option</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {field.description && <p className="form-input-description">{field.description}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
