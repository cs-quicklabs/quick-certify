import { Check, Contact, Dot } from 'lucide-react';
import React from 'react';

export interface Step {
  title: string;
  subtitle?: string;
}

interface StepperProps {
  steps: Step[];
  activeIndex: number;
  onSelect?: (index: number) => void;
}

export function Stepper({ steps, activeIndex, onSelect }: StepperProps) {
  return (
    <aside className="lg:col-span-3">
      <ol className="relative text-body border-s-2 border-gray-400 pt-1 pb-2">
        {steps.map((s, i) => (
          <li key={s.title} className="mb-12 ms-7 cursor-pointer" onClick={() => onSelect?.(i)}>
            <span
              className={`absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-2  ${i === activeIndex ? 'text-fg-success-strong bg-success-soft' : 'bg-neutral-tertiary text-body ring-gray-400'
                }`}
            >
              {i === activeIndex ? (
                <Check size={'18'} strokeWidth={'3'} />
              ) : (
                <Dot size={'40'} strokeWidth={'6'} color="#99a1af" />
              )}
            </span>
            <h3 className="font-medium leading-tight">{s.title}</h3>
            {s.subtitle && <p className="text-sm">{s.subtitle}</p>}
          </li>
        ))}
      </ol>
    </aside>
  );
}
