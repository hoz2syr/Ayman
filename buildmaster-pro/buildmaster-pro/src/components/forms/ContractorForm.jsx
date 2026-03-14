import { useState } from 'react';
import { Save } from 'lucide-react';
import { saveContractor } from '../../utils/storage';
import Modal from '../../components/shared/Modal';
import DatePicker from '../../components/shared/DatePicker';

/**
 * ContractorForm - نموذج المقاول/المورد
 * @param {object} contractor - المقاول المراد تعديله (اختياري)
 * @param {function} onClose - دالة الإغلاق
 * @param {function} onSave - دالة الحفظ
 */
const ContractorForm = ({ contractor = null, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: contractor?.name || '',
    type: contractor?.type || 'مقاول',
    specialty: contractor?.specialty || '',
    phone: contractor?.phone || '',
    email: contractor?.email || '',
    address: contractor?.address || '',
    contractStartDate: contractor?.contractStartDate || '',
    contractEndDate: contractor?.contractEndDate || '',
    agreedAmountUSD: contractor?.agreedAmountUSD || 0,
    agreedAmountSYP: contractor?.agreedAmountSYP || 0,
    notes: contractor?.notes || '',
    rating: contractor?.rating || 3,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const contractorData = {
      id: contractor?.id || null,
      name: formData.name,
      type: formData.type,
      specialty: formData.specialty,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      contractStartDate: formData.contractStartDate,
      contractEndDate: formData.contractEndDate,
      agreedAmountUSD: parseFloat(formData.agreedAmountUSD) || 0,
      agreedAmountSYP: parseFloat(formData.agreedAmountSYP) || 0,
      notes: formData.notes,
      rating: parseInt(formData.rating) || 3,
      payments: contractor?.payments || [],
    };
    
    saveContractor(contractorData);
    
    if (onSave) onSave();
    if (onClose) onClose();
  };

  const typeOptions = [
    { value: 'مقاول', label: 'مقاول' },
    { value: 'مورد', label: 'مورد' },
  ];

  const specialtyOptions = contractor?.type === 'مورد' 
    ? [
        { value: 'مواد بناء', label: 'مواد بناء' },
        { value: 'معدات', label: 'معدات' },
        { value: 'أدوات', label: 'أدوات' },
        { value: 'دهانات', label: 'دهانات' },
        { value: 'أخرى', label: 'أخرى' },
      ]
    : [
        { value: 'بناء', label: 'بناء' },
        { value: 'تشطيب', label: 'تشطيب' },
        { value: 'كهرباء', label: 'كهرباء' },
        { value: 'صرف', label: 'صرف' },
        { value: 'تكييف', label: 'تكييف' },
        { value: 'نقل', label: 'نقل' },
        { value: 'أخرى', label: 'أخرى' },
      ];

  const ratingOptions = [1, 2, 3, 4, 5];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={contractor ? 'تعديل' : 'مقاول/مورد جديد'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type & Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">النوع *</label>
            <select
              value={formData.type}
              onChange={(e) => {
                handleChange('type', e.target.value);
                handleChange('specialty', '');
              }}
              className="form-input"
              required
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">الاسم *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="form-input"
              placeholder="اسم المقاول أو المورد"
            />
          </div>
        </div>

        {/* Specialty & Rating */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">التخصص</label>
            <select
              value={formData.specialty}
              onChange={(e) => handleChange('specialty', e.target.value)}
              className="form-input"
            >
              <option value="">اختر التخصص</option>
              {specialtyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">التقييم</label>
            <div className="flex gap-1">
              {ratingOptions.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleChange('rating', r)}
                  className={`text-xl transition-colors ${
                    r <= formData.rating ? 'text-yellow-500' : 'text-slate-600'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">رقم الهاتف</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="form-input"
              placeholder="رقم الهاتف"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="form-input"
              placeholder="email@example.com"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">العنوان</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="form-input"
            placeholder="العنوان الكامل"
          />
        </div>

        {/* Contract Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">بداية العقد</label>
            <DatePicker
              value={formData.contractStartDate}
              onChange={(date) => handleChange('contractStartDate', date)}
              placeholder="اختر التاريخ"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">نهاية العقد</label>
            <DatePicker
              value={formData.contractEndDate}
              onChange={(date) => handleChange('contractEndDate', date)}
              placeholder="اختر التاريخ"
            />
          </div>
        </div>

        {/* Agreed Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">المبلغ المتفق عليه ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.agreedAmountUSD}
              onChange={(e) => handleChange('agreedAmountUSD', e.target.value)}
              className="form-input"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">المبلغ المتفق عليه (ل.س)</label>
            <input
              type="number"
              min="0"
              value={formData.agreedAmountSYP}
              onChange={(e) => handleChange('agreedAmountSYP', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">ملاحظات</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="form-input min-h-[60px]"
            placeholder="أي ملاحظات..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            حفظ
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ContractorForm;
