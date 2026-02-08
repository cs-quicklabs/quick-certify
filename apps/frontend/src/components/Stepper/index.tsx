import { Check, Dot } from 'lucide-react';
import React from 'react';

export interface Step {
  title: string;
  subtitle?: string;
}

interface StepperProps {
  steps: Step[];
  activeIndex: number;
  completedSteps?: number[]; // Array of step indices that are completed
    partialSteps?: number[];   // Array of step indices that are partially complete (show dot)
  onSelect?: (index: number) => void;
}

export function Stepper({
  steps,
  activeIndex,
  completedSteps = [],
  partialSteps = [],
  onSelect
}: StepperProps) {
  const isStepCompleted = (index: number) => completedSteps.includes(index);
  const isStepPartial = (index: number) => partialSteps.includes(index) && !completedSteps.includes(index);
  const isStepActive = (index: number) => index === activeIndex;

  return (
    <aside className="lg:col-span-3">
      <ol className="relative text-body border-s-2 border-gray-400 pb-2">
        {steps.map((s, i) => {
          const completed = isStepCompleted(i);
          const partial = isStepPartial(i);
          const active = isStepActive(i);

          // Determine styles based on step status
          const containerClasses = active
            ? 'text-gray-900'
            : completed
              ? 'text-gray-700'
              : 'text-gray-500';

          const iconContainerClasses = active
            ? 'bg-blue-200 ring-blue-400'
            : completed
              ? 'bg-gray-100 ring-gray-400'
              : partial
                ? 'bg-yellow-50 ring-yellow-400'
                : 'bg-neutral-tertiary ring-gray-400';

          const iconColor = active
            ? 'text-blue-900'
            : completed
              ? 'text-gray-700'
              : partial
                ? 'text-yellow-600'
                : 'text-gray-400';

          return (
            <li
              key={s.title}
              className={`mb-12 ms-7 ${onSelect ? 'cursor-pointer' : ''} ${containerClasses}`}
              onClick={() => onSelect?.(i)}
            >
              <span
                className={`absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-2 ${iconContainerClasses}`}
              >
                {completed ? (
                  <Check size={18} strokeWidth={3} className={iconColor} />
                ) : active ? (
                  <span className={`w-2.5 h-2.5 rounded-full ${iconColor.replace('text-', 'bg-')}`} />
                ) : (
                  <Dot size={40} strokeWidth={6} className={iconColor} />
                )}
              </span>
              <h3 className="font-medium leading-tight">{s.title}</h3>
              {s.subtitle && <p className="text-sm opacity-80">{s.subtitle}</p>}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
