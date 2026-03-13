import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

/**
 * ConfirmDialog - نافذة تأكيد
 * @param {boolean} isOpen - حالة الفتح
 * @param {function} onClose - دالة الإغلاق
 * @param {function} onConfirm - دالة التأكيد
 * @param {string} title - عنوان التأكيد
 * @param {string} message - رسالة التأكيد
 * @param {string} confirmText - نص زر التأكيد
 * @param {string} cancelText - نص زر الإلغاء
 * @param {string} type - نوع التأكيد (danger, warning, info)
 */
const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'تأكيد', 
  message = 'هل أنت متأكد؟',
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const typeStyles = {
    danger: {
      icon: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700',
      iconBg: 'bg-red-500/10'
    },
    warning: {
      icon: 'text-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      iconBg: 'bg-yellow-500/10'
    },
    info: {
      icon: 'text-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-500/10'
    }
  };

  const styles = typeStyles[type] || typeStyles.danger;

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
      >
        {cancelText}
      </button>
      <button
        onClick={handleConfirm}
        className={`px-4 py-2 ${styles.button} text-white rounded-lg transition-colors`}
      >
        {confirmText}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mb-4`}>
          <AlertTriangle className={`w-8 h-8 ${styles.icon}`} />
        </div>
        <p className="text-slate-300">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
