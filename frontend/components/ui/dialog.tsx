'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, title, children, className }: DialogProps) {
  React.useEffect(() => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/90 p-6 sm:p-8 shadow-2xl shadow-rose-950/20 backdrop-blur-2xl transition-all animate-fade-in-up',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <h3 className="text-xl font-bold font-display text-white mb-4 pr-8">{title}</h3>
        )}

        {children}
      </div>
    </div>
  );
}
