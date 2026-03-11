import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

/**
 * Modal - مكون النافذة المنبثقة المتجاوبة
 * @param {boolean} isOpen - حالة الفتح
 * @param {function} onClose - دالة الإغلاق
 * @param {string} title - عنوان النافذة
 * @param {ReactNode} children - محتوى النافذة
 * @param {ReactNode} footer - ذيل النافذة (أزرار)
 * @param {string} size - حجم النافذة (sm, md, lg, xl, full)
 */
const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // إغلاق النافذة عند الضغط على Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  //.prevent body scroll and handle focus when modal opens
  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      previousActiveElement.current = document.activeElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
      
      // Lock scroll position
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Handle click outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-[95vw] sm:max-w-lg md:max-w-xl',
    lg: 'max-w-[95vw] sm:max-w-2xl lg:max-w-3xl',
    xl: 'max-w-[95vw] sm:max-w-4xl lg:max-w-5xl',
    '2xl': 'max-w-[95vw] sm:max-w-6xl lg:max-w-7xl',
    full: 'max-w-[98vw] h-[98vh] sm:max-w-[95vw] sm:h-[95vh]',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleOverlayClick}
      />

      {/* Modal Content */}
      <div 
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative bg-[#1e293b] rounded-xl shadow-2xl w-full 
          ${sizeClasses[size]} 
          max-h-[90vh] sm:max-h-[85vh] lg:max-h-[80vh] 
          flex flex-col 
          animate-scaleIn 
          overflow-hidden
          mx-1
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700 flex-shrink-0">
          <h3 id="modal-title" className="text-base sm:text-lg font-semibold text-white truncate pr-8">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="absolute left-3 top-3 sm:left-4 sm:top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors touch-target"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div 
          className="flex-1 overflow-y-auto p-3 sm:p-4" 
          style={{ 
            overflowY: 'auto', 
            WebkitOverflowScrolling: 'touch',
            maxHeight: 'calc(90vh - 130px)',
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-3 sm:p-4 border-t border-slate-700 flex flex-col sm:flex-row-reverse justify-end gap-2 sm:gap-3">
            {footer}
          </div>
        )}

        <style>{`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .animate-scaleIn {
            animation: scaleIn 0.2s ease-out;
          }
          
          /* Safe area for notched devices */
          @supports (padding-bottom: env(safe-area-inset-bottom)) {
            .safe-area-bottom {
              padding-bottom: env(safe-area-inset-bottom);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Modal;
