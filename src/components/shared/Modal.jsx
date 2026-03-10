import { X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Modal - مكون النافذة المنبثقة
 * @param {boolean} isOpen - حالة الفتح
 * @param {function} onClose - دالة الإغلاق
 * @param {string} title - عنوان النافذة
 * @param {ReactNode} children - محتوى النافذة
 * @param {ReactNode} footer - ذيل النافذة (أزرار)
 * @param {string} size - حجم النافذة (sm, md, lg, xl)
 */
const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
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

  // منع تمرير الأحداث عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative bg-[#1e293b] rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] md:max-h-[90vh] lg:max-h-[85vh] flex flex-col animate-scaleIn overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Modal;
