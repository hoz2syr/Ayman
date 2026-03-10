import { useState } from 'react';
import { Save, FileDown, FileText, Upload, X, Image } from 'lucide-react';
import { saveDecision, generateDecisionNumber, getSettings } from '../utils/storage';
import { DecisionPDFButton } from '../../utils/pdfTemplates';
import { exportToWord } from '../../utils/exportWord';
import Modal from '../shared/Modal';
import DatePicker from '../shared/DatePicker';

/**
 * DecisionForm - نموذج القرار الهندسي
 * @param {string} projectId - معرف المشروع
 * @param {object} decision - القرار المراد تعديله (اختياري)
 * @param {function} onClose - دالة الإغلاق
 * @param {function} onSave - دالة الحفظ
 */
const DecisionForm = ({ projectId, decision = null, projectName = '', onClose, onSave }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    decisionNumber: decision?.decisionNumber || generateDecisionNumber(),
    date: decision?.date || new Date().toISOString().split('T')[0],
    subject: decision?.subject || '',
    problemDescription: decision?.problemDescription || '',
    decision: decision?.decision || '',
    responsibleParty: decision?.responsibleParty || '',
    deadline: decision?.deadline || '',
    notes: decision?.notes || '',
    attachments: decision?.attachments || []
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
    
    const decisionData = {
      ...formData,
      projectId,
      id: decision?.id || null
    };
    
    saveDecision(decisionData);
    setLoading(false);
    
    if (onSave) onSave();
    if (onClose) onClose();
  };

  // Prepare decision data for PDF
  const prepareDecisionData = () => {
    const companyInfo = getSettings();
    return {
      decisionNumber: formData.decisionNumber,
      date: formData.date,
      type: formData.subject,
      status: decision?.status || 'جديد',
      responsibleParty: formData.responsibleParty,
      responseDate: formData.deadline,
      problemDescription: formData.problemDescription,
      decision: formData.decision,
      recommendations: formData.notes,
      projectName,
      company: companyInfo,
    };
  };

  const companyInfo = getSettings();

  const handleExportWord = async () => {
    setLoading(true);
    try {
      await exportToWord({
        title: 'قرار هندسي',
        docNumber: formData.decisionNumber,
        date: formData.date,
        docType: 'decision',
        projectName,
        sections: [
          {
            title: 'معلومات القرار',
            content: [
              { label: 'رقم القرار', value: formData.decisionNumber },
              { label: 'التاريخ', value: formData.date },
              { label: 'الموضوع', value: formData.subject },
              { label: 'الجهة المسؤولة', value: formData.responsibleParty },
              { label: 'الموعد النهائي', value: formData.deadline || '-' },
            ],
          },
          {
            title: 'وصف المشكلة',
            text: formData.problemDescription,
          },
          {
            title: 'القرار المتخذ',
            text: formData.decision,
          },
          {
            title: 'الملاحظات',
            text: formData.notes,
          },
        ]
      }, `decision_${formData.decisionNumber}`);
    } catch (error) {
      console.error('Error exporting Word:', error);
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
      <Modal isOpen={true} onClose={() => setShowPreview(false)} title="معاينة القرار" size="xl">
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
              <DecisionPDFButton
                data={prepareDecisionData()}
                company={companyInfo}
                fileName={`قرار-${formData.decisionNumber}.pdf`}
              >
                {(loadingPDF) => (
                  <button
                    disabled={loadingPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <FileDown className="w-4 h-4" />
                    {loadingPDF ? '...' : 'تصدير PDF'}
                  </button>
                )}
              </DecisionPDFButton>
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
              <h2 className="text-xl font-bold text-[#1e3a5f]">قرار هندسي</h2>
              <p className="text-sm text-gray-500">رقم: {formData.decisionNumber}</p>
              <p className="text-sm text-gray-500">التاريخ: {formData.date}</p>
            </div>
            
            <div className="space-y-4 text-right" style={{ direction: 'rtl' }}>
              {projectName && (
                <div className="bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">المشروع:</span> <span className="font-medium">{projectName}</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">الجهة المسؤولة:</p>
                  <p className="font-medium">{formData.responsibleParty || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الموعد النهائي:</p>
                  <p className="font-medium">{formData.deadline || '-'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold border-b pb-1 mb-2">وصف المشكلة</h4>
                <p className="whitespace-pre-wrap">{formData.problemDescription || '-'}</p>
              </div>

              {formData.decision && (
                <div>
                  <h4 className="font-bold border-b pb-1 mb-2">القرار المتخذ</h4>
                  <p className="whitespace-pre-wrap">{formData.decision}</p>
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
      title={decision ? 'تعديل قرار هندسي' : 'قرار هندسي جديد'}
      size="lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">رقم القرار</label>
            <input
              type="text"
              value={formData.decisionNumber}
              onChange={(e) => handleChange('decisionNumber', e.target.value)}
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

        {/* Subject & Responsible */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">الموضوع *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className="form-input"
              placeholder="أدخل موضوع القرار"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">الجهة المسؤولة</label>
            <input
              type="text"
              value={formData.responsibleParty}
              onChange={(e) => handleChange('responsibleParty', e.target.value)}
              className="form-input"
              placeholder="الجهة المسؤولة عن التنفيذ"
            />
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">الموعد النهائي للتنفيذ</label>
          <DatePicker
            value={formData.deadline}
            onChange={(date) => handleChange('deadline', date)}
            placeholder="اختر التاريخ"
          />
        </div>

        {/* Problem Description */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">وصف المشكلة *</label>
          <textarea
            required
            value={formData.problemDescription}
            onChange={(e) => handleChange('problemDescription', e.target.value)}
            className="form-input min-h-[100px]"
            placeholder="أ وصفاً تفصيلياً للمشكلة أو الموضوع..."
          />
        </div>

        {/* Decision */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">القرار المتخذ *</label>
          <textarea
            required
            value={formData.decision}
            onChange={(e) => handleChange('decision', e.target.value)}
            className="form-input min-h-[100px]"
            placeholder="أدخل القرار المتخذ..."
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
          <label className="block text-sm text-slate-400 mb-1">المرفقات (صور/وثائق)</label>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-4">
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="decision-attachments"
            />
            <label
              htmlFor="decision-attachments"
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

export default DecisionForm;
