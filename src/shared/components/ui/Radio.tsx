import React, { type InputHTMLAttributes, type ReactNode } from 'react';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  label?: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  onSelect?: () => void;
  size?: 'sm' | 'md';
  error?: string;
  className?: string;
  wrapperClassName?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  description,
  checked,
  onChange,
  onSelect,
  size = 'sm',
  disabled = false,
  error,
  className = '',
  wrapperClassName = '',
  id,
  name,
  value,
  ...rest
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange?.(true);
      onSelect?.();
    }
  };

  const isSmall = size === 'sm';

  return (
    <div className={`inline-flex flex-col ${wrapperClassName}`}>
      <label
        htmlFor={id}
        onClick={handleClick}
        className={`inline-flex items-center gap-2 select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'
        } ${className}`}
      >
        {/* Mathematically Centered SVG Radio Indicator */}
        <svg
          className={`aspect-square shrink-0 transition-transform duration-150 ${
            isSmall ? 'w-4 h-4' : 'w-4.5 h-4.5'
          } ${checked ? 'scale-105' : 'group-hover:scale-105'}`}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring */}
          <circle
            cx="8"
            cy="8"
            r="6.8"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`transition-colors duration-150 ${
              checked
                ? 'text-primary-600'
                : 'text-slate-300 group-hover:text-primary-500'
            }`}
            fill="white"
          />

          {/* Inner Dot - Absolutely Concentric at cx="8" cy="8" */}
          {checked && (
            <circle
              cx="8"
              cy="8"
              r="4.2"
              fill="currentColor"
              className="text-primary-600 animate-in zoom-in-75 duration-100"
            />
          )}
        </svg>

        {/* Hidden Accessible Native Input */}
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={() => {}}
          disabled={disabled}
          className="sr-only"
          {...rest}
        />

        {/* Label & Description Text */}
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span
                className={`text-xs font-semibold transition-colors ${
                  checked ? 'text-primary-950' : 'text-slate-700 group-hover:text-slate-900'
                }`}
              >
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-slate-400 mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </label>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
