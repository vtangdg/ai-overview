'use client';

import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  footer,
  showCloseButton = true,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm min-w-[320px]',
    md: 'max-w-md min-w-[400px]',
    lg: 'max-w-lg min-w-[480px]',
    xl: 'max-w-xl min-w-[560px]',
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      onKeyDown={handleEscapeKey}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className={`relative bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-3xl shadow-2xl overflow-hidden ${sizeClasses[size]} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <h2 id="modal-title" className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-muted/80 transition-all hover:scale-110 active:scale-95"
                aria-label="关闭"
                type="button"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        <div className="p-6">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 p-6 border-t border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title = '提示',
  message,
  buttonText = '确定',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
    >
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1 pt-1">
          <p className="text-foreground leading-relaxed text-base">{message}</p>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/80 transition-all hover:scale-105 active:scale-95 font-medium shadow-lg shadow-primary/25"
          type="button"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
};
