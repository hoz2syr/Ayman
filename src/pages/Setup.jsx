import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { setCompanyInfo } from '../utils/storage';

const Setup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    commercialRecord: '',
    phone: '',
    email: '',
    address: '',
    logo: null,
    signature: null,
    stamp: null,
  });
  const [errors, setErrors] = useState({});
  const signatureRef = useRef(null);
  const signatureCanvasRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStampUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, stamp: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, signature: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    setFormData({ ...formData, signature: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'اسم الشركة مطلوب';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Get signature data from canvas if drawn
    let signatureData = formData.signature;
    if (signatureRef.current && !signatureData) {
      signatureData = signatureRef.current.toDataURL();
    }

    const companyData = {
      ...formData,
      signature: signatureData,
    };

    setCompanyInfo(companyData);
    navigate('/home');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4 md:p-8"
      dir="rtl"
    >
      <div className="bg-[#1e293b] rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#3b82f6] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">BuildMaster Pro</h1>
          <p className="text-slate-400 text-lg">أهلاً، لنبدأ بإعداد شركتك</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                اسم الشركة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-[#0f172a] border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="أدخل اسم الشركة"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Commercial Record */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                رقم الترخيص التجاري
              </label>
              <input
                type="text"
                name="commercialRecord"
                value={formData.commercialRecord}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f172a] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل رقم الترخيص التجاري"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-[#0f172a] border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="أدخل رقم الهاتف"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f172a] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                العنوان
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f172a] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل العنوان"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                شعار الشركة
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] border border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-300">رفع صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {formData.logo && (
                  <div className="relative w-16 h-16">
                    <img
                      src={formData.logo}
                      alt="شعار الشركة"
                      className="w-16 h-16 object-contain rounded-lg bg-[#0f172a] p-1"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: null })}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stamp Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                صورة الختم
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] border border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-300">رفع صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStampUpload}
                    className="hidden"
                  />
                </label>
                {formData.stamp && (
                  <div className="relative w-16 h-16">
                    <img
                      src={formData.stamp}
                      alt="ختم الشركة"
                      className="w-16 h-16 object-contain rounded-lg bg-[#0f172a] p-1"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, stamp: null })}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Area */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                التوقيع
              </label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-4">
                {formData.signature ? (
                  <div className="relative">
                    <img
                      src={formData.signature}
                      alt="التوقيع"
                      className="max-h-32 mx-auto"
                    />
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="absolute top-2 left-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <canvas
                      ref={(el) => {
                        signatureRef.current = el;
                        if (el && !signatureCanvasRef.current) {
                          signatureCanvasRef.current = el;
                          // Set canvas size
                          el.width = 400;
                          el.height = 150;
                          const ctx = el.getContext('2d');
                          ctx.strokeStyle = '#3b82f6';
                          ctx.lineWidth = 2;
                          ctx.lineCap = 'round';
                          ctx.lineJoin = 'round';
                          ctx.fillStyle = '#1e293b';
                          ctx.fillRect(0, 0, el.width, el.height);
                        }
                      }}
                      onMouseDown={(e) => {
                        const el = signatureRef.current;
                        if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const ctx = el.getContext('2d');
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        el.dataset.isDrawing = 'true';
                      }}
                      onMouseMove={(e) => {
                        const el = signatureRef.current;
                        if (!el || el.dataset.isDrawing !== 'true') return;
                        const rect = el.getBoundingClientRect();
                        const ctx = el.getContext('2d');
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        ctx.lineTo(x, y);
                        ctx.stroke();
                      }}
                      onMouseUp={() => {
                        const el = signatureRef.current;
                        if (el) el.dataset.isDrawing = 'false';
                      }}
                      onMouseLeave={() => {
                        const el = signatureRef.current;
                        if (el) el.dataset.isDrawing = 'false';
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        const el = signatureRef.current;
                        if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const ctx = el.getContext('2d');
                        const touch = e.touches[0];
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        el.dataset.isDrawing = 'true';
                      }}
                      onTouchMove={(e) => {
                        e.preventDefault();
                        const el = signatureRef.current;
                        if (!el || el.dataset.isDrawing !== 'true') return;
                        const rect = el.getBoundingClientRect();
                        const ctx = el.getContext('2d');
                        const touch = e.touches[0];
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;
                        ctx.lineTo(x, y);
                        ctx.stroke();
                      }}
                      onTouchEnd={() => {
                        const el = signatureRef.current;
                        if (el) el.dataset.isDrawing = 'false';
                      }}
                      className="w-full h-32 cursor-crosshair touch-none rounded-lg border border-slate-600"
                      style={{ backgroundColor: '#1e293b', minHeight: '128px' }}
                    />
                    <p className="text-xs text-slate-500 mt-1 text-center">ارسم توقيعك هنا</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  مسح التوقيع
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors cursor-pointer">
                  <ImageIcon className="w-4 h-4" />
                  رفع صورة بديل
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#3b82f6] text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors mt-6"
          >
            ابدأ الاستخدام
          </button>
        </form>
      </div>
    </div>
  );
};

export default Setup;
