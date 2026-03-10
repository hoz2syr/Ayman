import { FileDown, FileText, Save } from 'lucide-react';

/**
 * ExportButtons - أزرار تصدير الوثيقة
 * @param {React.RefObject} elementRef - مرجع للعنصر المراد تصديره
 * @param {Function} onExportPDF - دالة تصدير PDF
 * @param {Function} onExportWord - دالة تصدير Word
 * @param {Function} onSave - دالة حفظ في النظام
 * @param {boolean} loading - حالة التحميل
 */
const ExportButtons = ({ 
  elementRef, 
  onExportPDF, 
  onExportWord, 
  onSave,
  loading = false 
}) => {
  const handleExportPDF = async () => {
    if (onExportPDF && elementRef?.current) {
      await onExportPDF(elementRef);
    }
  };

  const handleExportWord = async () => {
    if (onExportWord && elementRef?.current) {
      await onExportWord(elementRef);
    }
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
  };

  return (
    <div className="flex gap-3 mb-4">
      {/* زر تحميل PDF */}
      <button
        onClick={handleExportPDF}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="تحميل كـ PDF"
      >
        <FileDown className="w-4 h-4" />
        <span>PDF</span>
      </button>

      {/* زر تحميل Word */}
      <button
        onClick={handleExportWord}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="تحميل كـ Word"
      >
        <FileText className="w-4 h-4" />
        <span>Word</span>
      </button>

      {/* زر حفظ في النظام */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="حفظ في النظام"
      >
        <Save className="w-4 h-4" />
        <span>حفظ</span>
      </button>
    </div>
  );
};

export default ExportButtons;
