import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelRight?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelRight, error, helperText, className = '', ...rest }, ref) => {
    return (
      <div className="w-full">
        {(label || labelRight) && (
          <div className="flex justify-between items-center mb-1">
            {label && (
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {typeof label === 'string' && label.includes('*') ? (
                  <>
                    {label.replace(/\s*\*/, '')} <span className="text-red-500">*</span>
                  </>
                ) : (
                  label
                )}
              </label>
            )}
            {labelRight}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200
            placeholder:text-gray-400 outline-none
            ${error
              ? 'border-red-500 ring-2 ring-red-100 focus:ring-red-200'
              : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
            }
            ${className}
          `}
          {...rest}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
