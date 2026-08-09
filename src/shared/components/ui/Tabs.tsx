import React from 'react';

export interface TabOption<T extends string = string> {
  value: T;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'segmented' | 'pills' | 'underline' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function Tabs<T extends string = string>({
  options,
  value,
  onChange,
  variant = 'segmented',
  size = 'md',
  fullWidth = false,
  className = '',
}: TabsProps<T>) {
  const sizeStyles = {
    sm: 'text-xs py-1.5 px-3 rounded-lg gap-1.5',
    md: 'text-xs sm:text-sm py-2 px-4 rounded-xl gap-2',
    lg: 'text-sm py-2.5 px-5 rounded-xl gap-2.5',
  }[size];

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200/80 ${
          fullWidth ? 'w-full grid' : ''
        } ${className}`}
        style={fullWidth ? { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` } : undefined}
      >
        {options.map((opt) => {
          const isActive = opt.value === value;

          return (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => !opt.disabled && onChange(opt.value)}
              className={`relative inline-flex items-center justify-center font-bold transition-all duration-150 cursor-pointer ${sizeStyles} ${
                isActive
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <div className="flex items-center gap-1.5">
                <span>{opt.label}</span>
                {opt.subLabel && (
                  <span
                    className={`text-[11px] font-normal ${
                      isActive ? 'text-primary-100' : 'text-gray-400'
                    }`}
                  >
                    {opt.subLabel}
                  </span>
                )}
              </div>
              {opt.badge !== undefined && (
                <span
                  className={`ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {opt.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`inline-flex flex-wrap gap-2 ${fullWidth ? 'w-full' : ''} ${className}`}>
        {options.map((opt) => {
          const isActive = opt.value === value;

          return (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => !opt.disabled && onChange(opt.value)}
              className={`inline-flex items-center justify-center font-bold transition-all duration-150 rounded-full cursor-pointer ${sizeStyles} ${
                isActive
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <span>{opt.label}</span>
              {opt.badge !== undefined && (
                <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20">
                  {opt.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'underline') {
    return (
      <div className={`flex border-b border-gray-200 gap-6 ${className}`}>
        {options.map((opt) => {
          const isActive = opt.value === value;

          return (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => !opt.disabled && onChange(opt.value)}
              className={`pb-2.5 inline-flex items-center gap-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <span>{opt.label}</span>
              {opt.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {opt.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Cards Variant
  return (
    <div
      className={`grid gap-3 ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;

        return (
          <button
            key={opt.value}
            type="button"
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.value)}
            className={`p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
              isActive
                ? 'border-primary-500 bg-primary-50/40 ring-1 ring-primary-500/20 shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
            } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between">
              {opt.icon && (
                <div
                  className={`p-2 rounded-xl ${
                    isActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {opt.icon}
                </div>
              )}
              {opt.badge !== undefined && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gray-100 text-gray-700">
                  {opt.badge}
                </span>
              )}
            </div>
            <div className="mt-3">
              <span className="block text-sm font-bold text-gray-900">{opt.label}</span>
              {opt.subLabel && (
                <span className="block text-xs text-gray-500 mt-0.5">{opt.subLabel}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
