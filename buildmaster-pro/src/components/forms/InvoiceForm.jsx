import { useState, useMemo } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { saveInvoice, getSettings } from '../../utils/storage';
import Modal from '../../components/shared/Modal';
import DatePicker from '../../components/shared/DatePicker';

/**
 * InvoiceForm - نموذج الفاتورة
 * @param {object} invoice - الفاتورة المراد تعديلها (اختياري)
 * @param {array} projects - قائمة المشاريع
 * @param {array} contractors - قائمة المقاولين
 * @param {function} onClose - دالة الإغلاق
 * @param {function} onSave - دالة الحفظ
 */
const InvoiceForm = ({ invoice = null, projects = [], contractors = [], onClose, onSave }) => {
  const defaultExchangeRate = getSettings()?.exchangeRateUSD || 13000;
  
  const [formData, setFormData] = useState({
    invoiceNumber: invoice?.invoiceNumber || '',
    projectId: invoice?.projectId || '',
    contractorId: invoice?.contractorId || '',
    clientName: invoice?.clientName || '',
    clientEmail: invoice?.clientEmail || '',
    clientPhone: invoice?.clientPhone || '',
    clientAddress: invoice?.clientAddress || '',
    issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || '',
    status: invoice?.status || 'مفتوح',
    taxRate: invoice?.taxRate || 15,
    exchangeRate: invoice?.exchangeRate || defaultExchangeRate,
    paymentTerms: invoice?.paymentTerms || 'دفع فوري',
    notes: invoice?.notes || '',
    items: invoice?.items || [
      { id: 1, name: '', unit: 'قطعة', quantity: 1, unitPriceUSD: 0, unitPriceSYP: 0 }
    ],
  });

  // Calculate totals using useMemo
  const calculatedTotals = useMemo(() => {
    let subtotalUSD = 0;
    let subtotalSYP = 0;

    formData.items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const priceUSD = parseFloat(item.unitPriceUSD) || 0;
      const priceSYP = parseFloat(item.unitPriceSYP) || 0;
      
      subtotalUSD += qty * priceUSD;
      subtotalSYP += qty * priceSYP;
    });

    const taxRate = parseFloat(formData.taxRate) || 0;
    const taxAmountUSD = subtotalUSD * (taxRate / 100);
    const taxAmountSYP = subtotalSYP * (taxRate / 100);

    return {
      subtotalUSD,
      subtotalSYP,
      taxAmountUSD,
      taxAmountSYP,
      totalUSD: subtotalUSD + taxAmountUSD,
      totalSYP: subtotalSYP + taxAmountSYP,
    };
  }, [formData.items, formData.taxRate]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      unit: 'قطعة',
      quantity: 1,
      unitPriceUSD: 0,
      unitPriceSYP: 0,
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const invoiceData = {
      id: invoice?.id || null,
      invoiceNumber: formData.invoiceNumber,
      projectId: formData.projectId,
      contractorId: formData.contractorId,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      clientAddress: formData.clientAddress,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      status: formData.status,
      taxRate: parseFloat(formData.taxRate),
      exchangeRate: parseFloat(formData.exchangeRate) || 13000,
      paymentTerms: formData.paymentTerms,
      notes: formData.notes,
      items: formData.items.map(item => ({
        ...item,
        quantity: parseFloat(item.quantity) || 0,
        unitPriceUSD: parseFloat(item.unitPriceUSD) || 0,
        unitPriceSYP: parseFloat(item.unitPriceSYP) || 0,
        totalUSD: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPriceUSD) || 0),
        totalSYP: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPriceSYP) || 0),
      })),
      subtotalUSD: calculatedTotals.subtotalUSD,
      subtotalSYP: calculatedTotals.subtotalSYP,
      taxAmountUSD: calculatedTotals.taxAmountUSD,
      taxAmountSYP: calculatedTotals.taxAmountSYP,
      totalUSD: calculatedTotals.totalUSD,
      totalSYP: calculatedTotals.totalSYP,
    };
    
    saveInvoice(invoiceData);
    
    if (onSave) onSave();
    if (onClose) onClose();
  };

  const units = ['قطعة', 'كيلو', 'طن', 'متر', 'متر مربع', 'متر مكعب', 'صندوق', 'كيس', 'وحدة', 'ساعة', 'يوم'];

  const statusOptions = [
    { value: 'مسودة', label: 'مسودة' },
    { value: 'مفتوح', label: 'مفتوح' },
    { value: 'مدفوع', label: 'مدفوع' },
    { value: 'متأخر', label: 'متأخر' },
  ];

  const paymentTermsOptions = [
    { value: 'دفع فوري', label: 'دفع فوري' },
    { value: 'دفع خلال 15 يوم', label: 'دفع خلال 15 يوم' },
    { value: 'دفع خلال 30 يوم', label: 'دفع خلال 30 يوم' },
    { value: 'دفع خلال 60 يوم', label: 'دفع خلال 60 يوم' },
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={invoice ? 'تعديل الفاتورة' : 'فاتورة جديدة'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">رقم الفاتورة</label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => handleChange('invoiceNumber', e.target.value)}
              className="form-input"
              placeholder="سيتم_generation تلقائي"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">الحالة</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="form-input"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm text-slate-400 mb-1">المورد/المقاول</label>
            <select
              value={formData.contractorId}
              onChange={(e) => handleChange('contractorId', e.target.value)}
              className="form-input"
            >
              <option value="">اختر المورد</option>
              {contractors.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">اسم العميل *</label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
              className="form-input"
              placeholder="اسم العميل"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => handleChange('clientEmail', e.target.value)}
              className="form-input"
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">رقم الهاتف</label>
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => handleChange('clientPhone', e.target.value)}
              className="form-input"
              placeholder="رقم الهاتف"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">العنوان</label>
            <input
              type="text"
              value={formData.clientAddress}
              onChange={(e) => handleChange('clientAddress', e.target.value)}
              className="form-input"
              placeholder="العنوان"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">تاريخ الإصدار *</label>
            <DatePicker
              value={formData.issueDate}
              onChange={(date) => handleChange('issueDate', date)}
              placeholder="اختر التاريخ"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">تاريخ الاستحقاق</label>
            <DatePicker
              value={formData.dueDate}
              onChange={(date) => handleChange('dueDate', date)}
              placeholder="اختر التاريخ"
            />
          </div>
        </div>

        {/* Items Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-400">البنود</label>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm text-[#3b82f6] hover:text-[#60a5fa]"
            >
              <Plus className="w-4 h-4" />
              إضافة صنف
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-right py-2 px-2 text-slate-400">الصنف</th>
                  <th className="text-right py-2 px-2 text-slate-400">الوحدة</th>
                  <th className="text-right py-2 px-2 text-slate-400">الكمية</th>
                  <th className="text-right py-2 px-2 text-slate-400">سعر ($)</th>
                  <th className="text-right py-2 px-2 text-slate-400">سعر (ل.س)</th>
                  <th className="text-right py-2 px-2 text-slate-400">الإجمالي</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-700/50">
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className="form-input text-sm"
                        placeholder="اسم الصنف"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="form-input text-sm"
                      >
                        {units.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="form-input text-sm w-20"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPriceUSD}
                        onChange={(e) => handleItemChange(index, 'unitPriceUSD', e.target.value)}
                        className="form-input text-sm w-24"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPriceSYP}
                        onChange={(e) => handleItemChange(index, 'unitPriceSYP', e.target.value)}
                        className="form-input text-sm w-24"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-2 px-2 text-slate-300">
                      ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPriceUSD) || 0)).toFixed(2)}
                    </td>
                    <td className="py-2 px-2">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1 text-slate-400 hover:text-[#ef4444]"
                        disabled={formData.items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tax & Exchange Rate */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">نسبة الضريبة (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.taxRate}
              onChange={(e) => handleChange('taxRate', e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">سعر الصرف (د.أ → ل.س)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.exchangeRate}
              onChange={(e) => handleChange('exchangeRate', e.target.value)}
              className="form-input"
              placeholder="مثال: 13000"
            />
          </div>
        </div>

        {/* Payment Terms */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">شروط الدفع</label>
          <select
            value={formData.paymentTerms}
            onChange={(e) => handleChange('paymentTerms', e.target.value)}
            className="form-input"
          >
            {paymentTermsOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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

        {/* Totals */}
        <div className="p-4 bg-slate-700/50 rounded-lg space-y-2">
          <div className="flex justify-between text-slate-300">
            <span>المجموع:</span>
            <span>${calculatedTotals.subtotalUSD.toFixed(2)} | {calculatedTotals.subtotalSYP.toLocaleString()} ل.س</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>الضريبة ({formData.taxRate}%):</span>
            <span>${calculatedTotals.taxAmountUSD.toFixed(2)} | {calculatedTotals.taxAmountSYP.toLocaleString()} ل.س</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-green-400 pt-2 border-t border-slate-600">
            <span>الإجمالي:</span>
            <span>${calculatedTotals.totalUSD.toFixed(2)} | {calculatedTotals.totalSYP.toLocaleString()} ل.س</span>
          </div>
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
            حفظ الفاتورة
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceForm;
