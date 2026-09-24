import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  variant?: 'default' | 'glass' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  align?: 'left' | 'right';
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Chọn một tùy chọn...',
  error,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  variant = 'default',
  size = 'md',
  icon,
  align = 'left',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const isGlass = variant === 'glass' || variant === 'dark';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isGlass ? 'text-emerald-200' : 'text-gray-700'}`}>
          {typeof label === 'string' && label.includes('*') ? (
            <>
              {label.replace(/\s*\*/, '')} <span className="text-red-500">*</span>
            </>
          ) : (
            label
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={
          isGlass
            ? `flex items-center justify-between gap-2 px-2.5 py-1 rounded-xl text-xs font-semibold text-white transition-all outline-none cursor-pointer select-none ${
                isOpen ? 'bg-white/15' : 'hover:bg-white/10'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${triggerClassName}`
            : `w-full px-3.5 ${
                size === 'sm' ? 'py-1.5 text-xs' : size === 'lg' ? 'py-3 text-base' : 'py-2.5 text-sm'
              } rounded-xl border flex items-center justify-between bg-white transition-all duration-200 outline-none cursor-pointer text-left ${
                isOpen
                  ? 'border-primary-500 ring-2 ring-primary-100'
                  : 'border-gray-200 hover:border-gray-300'
              } ${error ? 'border-red-500 ring-2 ring-red-100' : ''} ${
                disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
              } ${triggerClassName}`
        }
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="shrink-0">{icon}</span>}
          <span
            className={
              isGlass
                ? 'text-white font-semibold truncate'
                : selectedOption
                ? 'text-gray-900 font-normal truncate'
                : 'text-gray-400 font-normal truncate'
            }
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ml-1.5 ${
            isGlass
              ? isOpen
                ? 'rotate-180 text-amber-300'
                : 'text-emerald-300'
              : isOpen
              ? 'rotate-180 text-primary-500'
              : 'text-gray-400'
          }`}
        />
      </button>

      {/* Custom Floating Dropdown Menu */}
      {isOpen && (
        <div
          className={
            isGlass
              ? `absolute z-[100] top-full ${
                  align === 'right' ? 'right-0' : 'left-0'
                } min-w-[220px] mt-1.5 bg-[#0B2E22]/95 backdrop-blur-xl rounded-2xl border border-emerald-700/70 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-white ${menuClassName}`
              : `absolute z-[100] top-full ${
                  align === 'right' ? 'right-0' : 'left-0'
                } min-w-full mt-1.5 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 ${menuClassName}`
          }
        >
          <div className="p-1.5 max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={
                    isGlass
                      ? `px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer select-none ${
                          isSelected
                            ? 'bg-emerald-700/80 text-white font-bold'
                            : 'text-emerald-100/90 hover:bg-white/10 hover:text-white font-medium'
                        }`
                      : `px-3.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer select-none ${
                          isSelected
                            ? 'bg-primary-50 text-primary-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-normal'
                        }`
                  }
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 shrink-0 ml-2 ${
                        isGlass ? 'text-amber-300' : 'text-primary-500'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

