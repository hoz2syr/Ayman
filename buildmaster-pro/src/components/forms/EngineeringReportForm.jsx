import { useState } from 'react';
import { Save, FileDown, FileText, Upload, X, Image } from 'lucide-react';
import { saveReport, generateReportNumber, getSettings } from '../../utils/storage';
import { generateReportPDF } from '../../utils/pdfGenerator';
import { exportToWord } from '../../utils/exportWord';
import Modal from '../shared/Modal';
import DatePicker from '../shared/DatePicker';

/**
 * EngineeringReportForm - نموذج التقرير الهندسي
 * @param {string} projectId - معرف المشروع
 * @param {object} report - التقرير المراد تعديله (اختياري)
 * @param {function} onClose - دالة الإغلاق
 * @param {function} onSave - دالة الحفظ
 */
const EngineeringReportForm = ({ projectId, report = null, projectName = '', onClose, onSave }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    reportNumber: report?.reportNumber || generateReportNumber(),
    date: report?.date || new Date().toISOString().split('T')[0],
    subject: report?.subject || '',
    engineer: report?.engineer || '',
    description: report?.description || '',
    notes: report?.notes || '',
    recommendations: report?.recommendations || '',
    attachments: report?.attachments || []
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setLoading(true);
    
    const reportData = {
      ...formData,
      projectId,
      id: report?.id || null
    };
    
    saveReport(reportData);
    setLoading(false);
    
    if (onSave) onSave();
    if (onClose) onClose();
  };

  // Prepare report data for PDF
  const prepareReportData = () => {
    const companyInfo = getSettings();
    return {
      reportNumber: formData.reportNumber,
      date: formData.date,
      type: formData.subject,
      engineerName: formData.engineer,
      status: report?.status || 'جديد',
      followUpDate: formData.date,
      description: formData.description,
      recommendations: formData.recommendations,
      notes: formData.notes,
      attachments: formData.attachments,
      projectName,
      company: companyInfo,
    };
  };

  const companyInfo = getSettings();

  const handleExportWord = async () => {
    setLoading(true);
    try {
      await exportToWord({
        title: 'تقرير هندسي',
        docNumber: formData.reportNumber,
        date: formData.date,
        docType: 'report',
        projectName,
        sections: [
          {
            title: 'معلومات التقرير',
            content: [
              { label: 'رقم التقرير', value: formData.reportNumber },
              { label: 'التاريخ', value: formData.date },
              { label: 'الموضوع', value: formData.subject },
              { label: 'المهندس المسؤول', value: formData.engineer },
            ],
          },
          {
            title: 'الوصف',
            text: formData.description,
          },
          {
            title: 'التوصيات',
            text: formData.recommendations,
          },
          {
            title: 'الملاحظات',
            text: formData.notes,
          },
        ]
      }, `report_${formData.reportNumber}`);
    } catch (error) {
      console.error('Error exporting Word:', error);
    }
    setLoading(false);
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      await generateReportPDF(formData, companyInfo);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
    setLoading(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (showPreview) {
    return (
      <Modal isOpen={true} onClose={() => setShowPreview(false)} title="معاينة التقرير" size="xl">
        <div className="space-y-4">
          {/* Preview Actions */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-700">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              تعديل
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportPDF}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                {loading ? '...' : 'تصدير PDF'}
              </button>
              <button
                onClick={handleExportWord}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                تصدير Word
              </button>
            </div>
          </div>

          {/* Document Preview - Simple HTML */}
          <div className="overflow-auto max-h-[70vh] border border-slate-600 rounded-lg p-6 bg-white">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#1e3a5f]">تقرير هندسي</h2>
              <p className="text-sm text-gray-500">رقم: {formData.reportNumber}</p>
              <p className="text-sm text-gray-500">التاريخ: {formData.date}</p>
            </div>
            
            <div className="space-y-4 text-right" style={{ direction: 'rtl' }}>
              {projectName && (
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">المشروع:</span> <span className="font-medium">{projectName}</span>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">المهندس المسؤول:</p>
                <p className="font-medium">{formData.engineer || '-'}</p>
              </div>

              <div>
                <h4 className="font-bold border-b pb-1 mb-2">الوصف</h4>
                <p className="whitespace-pre-wrap">{formData.description || '-'}</p>
              </div>

              {formData.recommendations && (
                <div>
                  <h4 className="font-bold border-b pb-1 mb-2">التوصيات</h4>
                  <p className="whitespace-pre-wrap">{formData.recommendations}</p>
                </div>
              )}

              {formData.notes && (
                <div>
                  <h4 className="font-bold border-b pb-1 mb-2">الملاحظات</h4>
                  <p className="whitespace-pre-wrap">{formData.notes}</p>
                </div>
              )}

              {formData.attachments?.length > 0 && (
                <div>
                  <h4 className="font-bold border-b pb-1 mb-2">المرفقات</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.attachments.map((att, idx) => (
                      <div key={idx} className="p-2 border rounded text-center">
                        <Image className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-xs truncate">{att.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={report ? 'تعديل تقرير هندسي' : 'تقرير هندسي جديد'}
      size="lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">رقم التقرير</label>
            <input
              type="text"
              value={formData.reportNumber}
              onChange={(e) => handleChange('reportNumber', e.target.value)}
              className="form-input bg-slate-700"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">التاريخ</label>
            <DatePicker
              value={formData.date}
              onChange={(date) => handleChange('date', date)}
              placeholder="اختر التاريخ"
            />
          </div>
        </div>

        {/* Subject & Engineer */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">الموضوع *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className="form-input"
              placeholder="أدخل موضوع التقرير"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">المهندس المسؤول</label>
            <input
              type="text"
              value={formData.engineer}
              onChange={(e) => handleChange('engineer', e.target.value)}
              className="form-input"
              placeholder="اسم المهندس"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">الوصف التفصيلي *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="form-input min-h-[120px]"
            placeholder="أدخل وصفاً تفصيلياً للتقرير..."
          />
        </div>

        {/* Recommendations */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">التوصيات</label>
          <textarea
            value={formData.recommendations}
            onChange={(e) => handleChange('recommendations', e.target.value)}
            className="form-input min-h-[80px]"
            placeholder="أدخل التوصيات والملاحظات الفنية..."
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">الملاحظات</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="form-input min-h-[60px]"
            placeholder="أي ملاحظات إضافية..."
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">المرفقات (صور)</label>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-4">
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="report-attachments"
            />
            <label
              htmlFor="report-attachments"
              className="flex items-center justify-center gap-2 cursor-pointer text-slate-400 hover:text-white"
            >
              <Upload className="w-5 h-5" />
              <span>رفع ملفات</span>
            </label>
            
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-white truncate max-w-[200px]">{att.name}</span>
                      <span className="text-xs text-slate-400">({formatFileSize(att.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="p-1 text-red-500 hover:bg-slate-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            معاينة
          </button>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              حفظ
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EngineeringReportForm;
