import { InfoTooltip } from '@/components/ui';
import { FormFieldConfig } from '@/types/form.types';

interface FieldLabelProps {
  field: FormFieldConfig;
}

export function FieldLabel({ field }: FieldLabelProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={field.name} className="form-input-label">
        {field.label}
        {/* {field.required && <span className="text-red-500 ml-1">*</span>} */}
      </label>
      {field.tooltipText && (
        <InfoTooltip tooltipText={field.tooltipText} id={`tooltip-${field.name}`} iconSize={14} />
      )}
    </div>
  );
}
