import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'xl'
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

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case '2xl': return 'max-w-2xl';
      case '4xl': return 'max-w-4xl';
      case 'xl': default: return 'max-w-[640px]';
    }
  };

  const modalElement = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop overlay dismiss: darkened without heavy blur */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Modal Dialog Panel: adapts to effective CSS viewport at all zoom levels */}
      <div 
        data-testid="modal-panel"
        className={`w-full ${getMaxWidthClass()} max-h-[calc(100vh-2rem)] glass-panel bg-cyber-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-left relative z-10 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header: fixed at top of modal */}
        <header className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-800/80 shrink-0 bg-cyber-950">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2 id="modal-title" className="text-base sm:text-lg font-bold text-white tracking-wide min-w-0 break-words">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors shrink-0 -mr-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Modal Content Container (main body + pinned footer) */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
};

