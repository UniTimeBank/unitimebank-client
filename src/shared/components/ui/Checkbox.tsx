import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  label?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  error,
  className = '',
  id,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <label
        htmlFor={id}
        onClick={handleToggle}
        className={`inline-flex items-center gap-2.5 select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'
        }`}
      >
        {/* Custom Green Checkbox Box */}
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
            checked
              ? 'bg-primary-600 border-primary-600 text-white shadow-xs shadow-primary-500/30 scale-105'
              : 'bg-white border-gray-300 group-hover:border-primary-500 group-hover:bg-primary-50/30'
          }`}
        >
          {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>

        {/* Label Text */}
        {label && (
          <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
            {label}
          </span>
        )}
      </label>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
