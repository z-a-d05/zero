import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
  '3xl': 'max-w-5xl',
  '4xl': 'max-w-6xl',
  '5xl': 'max-w-7xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = '2xl',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className={clsx(
          'bg-white rounded-3xl shadow-2xl w-full max-h-[92vh] flex flex-col relative animate-slide-up border border-apple-gray-2 overflow-hidden my-auto',
          sizeClasses[size],
          className
        )}
      >
        {/* Header - shown if title or close button needed */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-apple-gray-2 bg-white sticky top-0 z-20 flex-shrink-0">
          <h2 className="text-lg font-bold tracking-tight text-apple-text truncate">
            {title || 'تفاصيل الذكاء الصحي'}
          </h2>
          <button
            onClick={onClose}
            className="text-apple-text-secondary hover:text-apple-text p-2 rounded-full hover:bg-apple-gray transition flex-shrink-0 ml-4"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Container with clean breathing room */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
