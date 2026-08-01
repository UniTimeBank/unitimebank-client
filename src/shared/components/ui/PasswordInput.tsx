import type { InputHTMLAttributes } from 'react';
import { forwardRef, useState } from 'react';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  labelRight?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, labelRight, error, helperText, className = '', ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full">
        {(label || labelRight) && (
          <div className="flex justify-between items-center mb-1">
            {label && (
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {label}
              </label>
            )}
            {labelRight}
          </div>
        )}
        <div className="relative w-full">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`
              w-full px-3.5 py-2.5 pr-10 rounded-xl border text-sm transition-all duration-200
              placeholder:text-gray-400 outline-none
              ${error
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
              }
              ${className}
            `}
            {...rest}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 p-1 cursor-pointer transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? (
              // Eye Off Icon
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
              </svg>
            ) : (
              // Eye Icon
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

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

PasswordInput.displayName = 'PasswordInput';
