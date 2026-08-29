import type { ReactNode } from 'react';
import { useEffect } from 'react';

let activeModalCount = 0;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  showCloseButton?: boolean;
  zIndex?: number;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  zIndex = 50,
}: ModalProps) => {
  // ESC key handler & body overflow lock with nesting support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      activeModalCount++;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (isOpen) {
        activeModalCount = Math.max(0, activeModalCount - 1);
        if (activeModalCount === 0) {
          document.body.style.overflow = '';
        }
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div
      style={{ zIndex }}
      className="fixed inset-0 overflow-y-auto bg-slate-900/60 transition-opacity animate-in fade-in duration-150"
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        {/* Backdrop Click */}
        <div
          className="fixed inset-0"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div
          className={`
            w-full ${sizeClasses[size]} bg-white border border-slate-200/90 shadow-2xl rounded-3xl p-6 sm:p-7 relative z-10
            animate-in zoom-in-95 duration-150
          `}
        >
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4.5 right-4.5 text-gray-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Đóng modal"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {(title || description) && (
            <div className="mb-4 pr-6">
              {title && (
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};
