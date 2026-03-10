import { useState } from 'react';
import { Save } from 'lucide-react';
import { saveExpense } from '../../utils/storage';
import Modal from '../../components/shared/Modal';
import DatePicker from '../../components/shared/DatePicker';

/**
 * ExpenseForm - نموذج المصروف
 * @param {object} expense - المصروف المراد تعديله (اختياري)
 * @param {array} projects - قائمة المشاريع
 * @param {function} onClose - دالة الإغلاق
 * @param {function} onSave - دالة الحفظ
 */
const ExpenseForm = ({ expense = null, projects = [], onClose, onSave }) => {
  const [formData, setFormData] = useState({
    category: expense?.category || 'مواد بناء',
    projectId: expense?.projectId || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    description: expense?.description || '',
    amountUSD: expense?.amountUSD || 0,
    amountSYP: expense?.amountSYP || 0,
    notes: expense?.notes || '',
    // أجور عمال
    workerName: expense?.workerName || '',
    workDays: expense?.workDays || 0,
    dailyRate: expense?.dailyRate || 0,
    // مواد بناء
    materialName: expense?.materialName || '',
    quantity: expense?.quantity || 0,
    unit: expense?.unit || '',
    unitPrice: expense?.unitPrice || 0,
    supplier: expense?.supplier || '',
    // معدات
    equipmentName: expense?.equipmentName || '',
    usageHours: expense?.usageHours || 0,
    equipmentCost: expense?.equipmentCost || 0,
    // تشغيل
    operationType: expense?.operationType || 'كهرباء',
    operationCost: expense?.operationCost || 0,
  });

  const [calculatedTotal, setCalculatedTotal] = useState(
    expense?.amountUSD || expense?.amountSYP || 0
  );

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate for wages
      if (field === 'workDays' || field === 'dailyRate') {
        const days = field === 'workDays' ? parseFloat(value) : parseFloat(newData.workDays || 0);
        const rate = field === 'dailyRate' ? parseFloat(value) : parseFloat(newData.dailyRate || 0);
        const total = days * rate;
        newData.amountUSD = total;
        setCalculatedTotal(total);
      }
      
      // Auto-calculate for materials
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? parseFloat(value) : parseFloat(newData.quantity || 0);
        const price = field === 'unitPrice' ? parseFloat(value) : parseFloat(newData.unitPrice || 0);
        const total = qty * price;
        newData.amountUSD = total;
        setCalculatedTotal(total);
      }
      
      // Auto-calculate for equipment
      if (field === 'equipmentCost') {
        newData.amountUSD = parseFloat(value) || 0;
        setCalculatedTotal(parseFloat(value) || 0);
      }
      
      // Auto-calculate for operations
      if (field === 'operationCost') {
        newData.amountUSD = parseFloat(value) || 0;
        setCalculatedTotal(parseFloat(value) || 0);
      }
      
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const expenseData = {
      id: expense?.id || null,
      category: formData.category,
      projectId: formData.projectId,
      date: formData.date,
      description: formData.description,
      amountUSD: parseFloat(formData.amountUSD) || 0,
      amountSYP: parseFloat(formData.amountSYP) || 0,
      notes: formData.notes,
      amount: (parseFloat(formData.amountUSD) || 0) + ((parseFloat(formData.amountSYP) || 0) / 13000), // Convert to USD for total
    };
    
    // Add type-specific data
    if (formData.category === 'أجور عمال') {
      expenseData.workerName = formData.workerName;
      expenseData.workDays = formData.workDays;
      expenseData.dailyRate = formData.dailyRate;
    } else if (formData.category === 'مواد بناء') {
      expenseData.materialName = formData.materialName;
      expenseData.quantity = formData.quantity;
      expenseData.unit = formData.unit;
      expenseData.unitPrice = formData.unitPrice;
      expenseData.supplier = formData.supplier;
    } else if (formData.category === 'معدات') {
      expenseData.equipmentName = formData.equipmentName;
      expenseData.usageHours = formData.usageHours;
      expenseData.equipmentCost = formData.equipmentCost;
    } else if (formData.category === 'تشغيل') {
      expenseData.operationType = formData.operationType;
      expenseData.operationCost = formData.operationCost;
    }

    saveExpense(expenseData);
    
    if (onSave) onSave();
    if (onClose) onClose();
  };

  const categories = [
    { value: 'أجور عمال', label: 'أجور عمال' },
    { value: 'مواد بناء', label: 'مواد بناء' },
    { value: 'معدات', label: 'معدات' },
    { value: 'تشغيل', label: 'تشغيل' },
  ];

  const operationTypes = [
    { value: 'كهرباء', label: 'كهرباء' },
    { value: 'ماء', label: 'ماء' },
    { value: 'إيجار', label: 'إيجار' },
    { value: 'أخرى', label: 'أخرى' },
  ];

  const units = ['قطعة', 'كيلو', 'طن', 'متر', 'متر مربع', 'متر مكعب', 'صندوق', 'كيس', 'وحدة'];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={expense ? 'تعديل مصروف' : 'مصروف جديد'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category & Project */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">النوع *</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="form-input"
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">المشروع</label>
            <select
              value={formData.projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              className="form-input"
            >
              <option value="">اختر المشروع</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Description */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">التاريخ *</label>
            <DatePicker
              value={formData.date}
              onChange={(date) => handleChange('date', date)}
              placeholder="اختر التاريخ"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">الوصف *</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="form-input"
              placeholder="أدخل وصف المصروف"
            />
          </div>
        </div>

        {/* Type-specific fields */}
        {formData.category === 'أجور عمال' && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-700/50 rounded-lg">
            <div>
              <label className="block text-sm text-slate-400 mb-1">اسم العامل</label>
              <input
                type="text"
                value={formData.workerName}
                onChange={(e) => handleChange('workerName', e.target.value)}
                className="form-input"
                placeholder="اسم العامل"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">أيام العمل</label>
              <input
                type="number"
                min="0"
                value={formData.workDays}
                onChange={(e) => handleChange('workDays', e.target.value)}
                className="form-input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">الأجر اليومي ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.dailyRate}
                onChange={(e) => handleChange('dailyRate', e.target.value)}
                className="form-input"
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        {formData.category === 'مواد بناء' && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700/50 rounded-lg">
            <div>
              <label className="block text-sm text-slate-400 mb-1">اسم المادة</label>
              <input
                type="text"
                value={formData.materialName}
                onChange={(e) => handleChange('materialName', e.target.value)}
                className="form-input"
                placeholder="اسم المادة"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">المورد</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => handleChange('supplier', e.target.value)}
                className="form-input"
                placeholder="اسم المورد"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">الكمية</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="form-input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">الوحدة</label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="form-input"
              >
                <option value="">اختر الوحدة</option>
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">سعر الوحدة ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => handleChange('unitPrice', e.target.value)}
                className="form-input"
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        {formData.category === 'معدات' && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700/50 rounded-lg">
            <div>
              <label className="block text-sm text-slate-400 mb-1">اسم المعدة</label>
              <input
                type="text"
                value={formData.equipmentName}
                onChange={(e) => handleChange('equipmentName', e.target.value)}
                className="form-input"
                placeholder="اسم المعدة"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">مدة الاستخدام (ساعات)</label>
              <input
                type="number"
                min="0"
                value={formData.usageHours}
                onChange={(e) => handleChange('usageHours', e.target.value)}
                className="form-input"
                placeholder="0"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">التكلفة ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.equipmentCost}
                onChange={(e) => handleChange('equipmentCost', e.target.value)}
                className="form-input"
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        {formData.category === 'تشغيل' && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700/50 rounded-lg">
            <div>
              <label className="block text-sm text-slate-400 mb-1">نوع التشغيل</label>
              <select
                value={formData.operationType}
                onChange={(e) => handleChange('operationType', e.target.value)}
                className="form-input"
              >
                {operationTypes.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">التكلفة ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.operationCost}
                onChange={(e) => handleChange('operationCost', e.target.value)}
                className="form-input"
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        {/* Amount Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">المبلغ (دولار)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.amountUSD}
              onChange={(e) => handleChange('amountUSD', e.target.value)}
              className="form-input"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">المبلغ (ليرة سوريا)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.amountSYP}
              onChange={(e) => handleChange('amountSYP', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </div>
        </div>

        {/* Calculated Total Display */}
        <div className="p-3 bg-slate-700/50 rounded-lg text-center">
          <span className="text-slate-400">الإجمالي: </span>
          <span className="text-xl font-bold text-green-400">
            ${calculatedTotal.toFixed(2)} = {formData.amountSYP ? `${parseFloat(formData.amountSYP).toLocaleString()} ل.س` : ''}
          </span>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">ملاحظات</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="form-input min-h-[60px]"
            placeholder="أي ملاحظات إضافية..."
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

export default ExpenseForm;
