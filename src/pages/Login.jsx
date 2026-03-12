import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, LogIn, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'user'
  });

  const from = location.state?.from?.pathname || '/home';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!formData.username || !formData.password || !formData.name) {
          setError('يرجى ملء جميع الحقول المطلوبة');
          setLoading(false);
          return;
        }
        
        const result = register(formData);
        if (result.success) {
          const loginResult = login(formData.username, formData.password);
          if (loginResult.success) {
            navigate(from, { replace: true });
          }
        } else {
          setError(result.error);
        }
      } else {
        const result = login(formData.username, formData.password);
        if (result.success) {
          navigate(from, { replace: true });
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('حدث خطأ يرجى المحاولة مرة أخرى');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative">
        <div className="card glass-effect animate-scaleIn">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">BuildMaster Pro</h1>
            <p className="text-slate-400 mt-1">نظام إدارة مشاريع البناء</p>
          </div>

          <div className="flex bg-slate-700/50 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegisterMode(false); setError(''); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isRegisterMode 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setIsRegisterMode(true); setError(''); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isRegisterMode 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              إنشاء حساب
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-sm text-slate-400 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-1">اسم المستخدم</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input pr-12"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label className="block text-sm text-slate-400 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="example@email.com"
                />
              </div>
            )}

            {isRegisterMode && (
              <div>
                <label className="block text-sm text-slate-400 mb-1">الدور</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="user">مستخدم</option>
                  <option value="manager">مدير</option>
                  <option value="admin">مدير نظام</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 hover-lift"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegisterMode ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isRegisterMode ? 'إنشاء حساب' : 'تسجيل الدخول'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-400 text-sm">
              {!isRegisterMode ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
              <button
                type="button"
                onClick={() => { setIsRegisterMode(!isRegisterMode); setError(''); }}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                {isRegisterMode ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </button>
            </p>
          </div>

          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
            <p className="text-slate-400 text-xs text-center">
              حساب افتراضي: <span className="text-blue-400">admin</span> / <span className="text-blue-400">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
