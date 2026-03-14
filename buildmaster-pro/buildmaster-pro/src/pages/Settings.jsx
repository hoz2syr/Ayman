import { useState, useRef } from 'react';
import { Save, Building2, Trash2, Download, Upload, DollarSign, AlertTriangle } from 'lucide-react';
import { getSettings, saveSettings, getCompanyInfo, setCompanyInfo, clearAllData, exportAllData, importData } from '../utils/storage';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { useToast } from '../components/shared/Toast';

const Settings = () => {
  const { showToast } = useToast();
  const [company, setCompany] = useState(getCompanyInfo() || {
    name: '',
    owner: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    commercialRecord: '',
  });
  
  const [settings, setSettings] = useState(getSettings());
  const [clearConfirm1, setClearConfirm1] = useState(false);
  const [clearConfirm2, setClearConfirm2] = useState(false);
  const fileInputRef = useRef(null);

  const handleCompanyChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: name === 'exchangeRateUSD' || name === 'taxRate' ? parseFloat(value) || 0 : value }));
  };

  const handleCompanySubmit = (e) => {
    e.preventDefault();
    setCompanyInfo(company);
    showToast('تم حفظ بيانات الشركة بنجاح', 'success');
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    saveSettings(settings);
    showToast('تم حفظ الإعدادات بنجاح', 'success');
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buildmaster-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تصدير البيانات بنجاح', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        importData(data);
        showToast('تم استيراد البيانات بنجاح', 'success');
        window.location.reload();
      } catch {
        showToast('خطأ في استيراد البيانات. يرجى التأكد من صحة الملف.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleClearData = () => {
    if (clearConfirm1 && clearConfirm2) {
      clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Company Information */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-[#3b82f6]" />
          <h2 className="text-xl font-bold text-white">معلومات الشركة</h2>
        </div>
        
        <form onSubmit={handleCompanySubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">اسم الشركة</label>
              <input
                type="text"
                name="name"
                value={company.name}
                onChange={handleCompanyChange}
                className="form-input"
                placeholder="اسم الشركة"
              />
            </div>
            <div>
              <label className="form-label">مالك الشركة</label>
              <input
                type="text"
                name="owner"
                value={company.owner}
                onChange={handleCompanyChange}
                className="form-input"
                placeholder="اسم المالك"
              />
            </div>
            <div>
              <label className="form-label">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                value={company.phone}
                onChange={handleCompanyChange}
                className="form-input"
                placeholder="رقم الهاتف"
              />
            </div>
            <div>
              <label className="form-label">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                value={company.email}
                onChange={handleCompanyChange}
                className="form-input"
                placeholder="البريد الإلكتروني"
              />
            </div>
            <div>
              <label className="form-label">العنوان</label>
              <input
                type="text"
                name="address"
                value={company.address}
                onChange={handleCompanyChange}
                className="form-input"
                placeholder="العنوان"
              />
            </div>
            <div>
              <label className="form-label">الرقم الضريبي</label>
              <input
                type="text"
                name="taxNumber"
                value={company.taxNumber}
                onChange={handleCompanyChange}
                className="form-input"
                placeholder="الرقم الضريبي"
              />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">السجل التجاري</label>
              <input
                type="text"
                name="commercialRecord"
                value={company.commercialRecord}
                onChange={handleCompanyChange}
                className="form-input"
                placeholder="رقم السجل التجاري"
              />
            </div>
          </div>
          
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            حفظ بيانات الشركة
          </button>
        </form>
      </div>

      {/* Currency Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-6 h-6 text-[#3b82f6]" />
          <h2 className="text-xl font-bold text-white">إعدادات العملة</h2>
        </div>
        
        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">العملة الرئيسية</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleSettingsChange}
                className="form-input"
              >
                <option value="SAR">ريال سعودي</option>
                <option value="USD">دولار أمريكي</option>
                <option value="EUR">يورو</option>
                <option value="AED">درهم إماراتي</option>
                <option value="EGP">جنيه مصري</option>
              </select>
            </div>
            <div>
              <label className="form-label">رمز العملة</label>
              <input
                type="text"
                name="currencySymbol"
                value={settings.currencySymbol}
                onChange={handleSettingsChange}
                className="form-input"
                placeholder="ر.س"
              />
            </div>
            <div>
              <label className="form-label">سعر الصرف (دولار مقابل ل.س)</label>
              <input
                type="number"
                name="exchangeRateUSD"
                value={settings.exchangeRateUSD}
                onChange={handleSettingsChange}
                className="form-input"
                min="0"
                placeholder="13000"
              />
              <p className="text-xs text-slate-500 mt-1">سعر صرف 1 دولار أمريكي مقابل الليرة السورية</p>
            </div>
            <div>
              <label className="form-label">نسبة الضريبة (%)</label>
              <input
                type="number"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleSettingsChange}
                className="form-input"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="form-label">صيغة التاريخ</label>
              <select
                name="dateFormat"
                value={settings.dateFormat}
                onChange={handleSettingsChange}
                className="form-input"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            حفظ الإعدادات
          </button>
        </form>
      </div>

      {/* Backup Section */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">النسخ الاحتياطي</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <h3 className="font-semibold text-white mb-2">تصدير البيانات</h3>
            <p className="text-sm text-slate-400 mb-4">
              تصدير جميع البيانات إلى ملف JSON للاستخدام كنسخة احتياطية
            </p>
            <button 
              onClick={handleExport}
              className="btn-secondary flex items-center gap-2 w-full justify-center"
            >
              <Download className="w-4 h-4" />
              تصدير جميع البيانات
            </button>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <h3 className="font-semibold text-white mb-2">استيراد البيانات</h3>
            <p className="text-sm text-slate-400 mb-4">
              استيراد البيانات من ملف JSON نسخة احتياطية
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label 
              htmlFor="import-file"
              className="btn-secondary flex items-center gap-2 w-full justify-center cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              استيراد بيانات
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border border-[#ef4444]/30">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-[#ef4444]" />
          <h2 className="text-xl font-bold text-[#ef4444]">منطقة خطر</h2>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          هذه المنطقة تحتوي على إجراءات خطيرة. يرجى الحذر قبل المتابعة.
        </p>
        
        {!clearConfirm1 ? (
          <button 
            onClick={() => setClearConfirm1(true)}
            className="btn-danger flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            مسح جميع البيانات
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-yellow-400 text-sm">
              للتأكيد، اضغط مرة أخرى على زر المسح خلال 10 ثوانٍ
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setClearConfirm1(false);
                  setClearConfirm2(false);
                }}
                className="px-4 py-2 text-slate-300 hover:text-white"
              >
                إلغاء
              </button>
              <button 
                onClick={() => setClearConfirm2(true)}
                className="btn-danger flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                تأكيد المسح
              </button>
            </div>
          </div>
        )}

        {/* Second confirmation */}
        {clearConfirm2 && (
          <ConfirmDialog
            isOpen={clearConfirm2}
            title="تأكيد مسح جميع البيانات"
            message={`هل أنت متأكد من مسح جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.`}
            confirmText="نعم، مسح الكل"
            cancelText="إلغاء"
            onConfirm={handleClearData}
            onCancel={() => {
              setClearConfirm1(false);
              setClearConfirm2(false);
            }}
            type="danger"
          />
        )}
      </div>
    </div>
  );
};

export default Settings;
