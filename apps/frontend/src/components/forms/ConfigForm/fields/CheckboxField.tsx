import { BaseFieldProps } from './types';
import { InfoTooltip } from '@/components/ui';

export function CheckboxField({ field, value, error, onChange, isDisabled }: BaseFieldProps) {
  return (
    <div className={`${field.className ?? ''} flex mt-6`}>
      <div className="flex items-center h-5">
        <input
          id={field.name}
          name={field.name}
          type="checkbox"
          checked={Boolean(value)}
          onChange={onChange}
          disabled={isDisabled}
          className="checkbox"
        />
      </div>
      <div className="ms-2 text-sm">
        <div className="flex items-center gap-2">
          <label htmlFor={field.name} className="form-input-label">
            {field.label}
          </label>
          {field.tooltipText && (
            <InfoTooltip
              tooltipText={field.tooltipText}
              id={`tooltip-${field.name}`}
              iconSize={14}
            />
          )}
        </div>
        {field.description && <p className="form-input-description -mt-2">{field.description}</p>}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
