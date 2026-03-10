import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home,
  FolderOpen,
  Users,
  DollarSign,
  FileText,
  Settings,
  Building2,
  LogOut,
  FileStack,
  TrendingUp
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { getCompanyInfo, clearAllData } from '../../utils/storage';
import ConfirmDialog from '../shared/ConfirmDialog';

const Sidebar = () => {
  const navigate = useNavigate();
  const companyInfo = useMemo(() => getCompanyInfo(), []);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const navItems = [
    { path: '/home', icon: Home, label: 'الرئيسية' },
    { path: '/projects', icon: FolderOpen, label: 'المشاريع' },
    { path: '/engineering', icon: FileStack, label: 'الوثائق الهندسية' },
    { path: '/contractors', icon: Users, label: 'المقاولون' },
    { path: '/expenses', icon: DollarSign, label: 'المصاريف' },
    { path: '/invoices', icon: FileText, label: 'الفواتير' },
    { path: '/sales', icon: TrendingUp, label: 'إدارة المبيعات' },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <aside className="w-[260px] bg-[#1e293b] flex flex-col border-l border-slate-700 flex-shrink-0">
      {/* Logo & Company Info */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          {companyInfo?.logo ? (
            <img
              src={companyInfo.logo}
              alt={companyInfo.name}
              className="w-12 h-12 object-contain rounded-lg bg-white p-1"
            />
          ) : (
            <div className="w-12 h-12 bg-[#3b82f6] rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate">
              {companyInfo?.name || 'BuildMaster Pro'}
            </h1>
            <p className="text-xs text-slate-400">نظام إدارة المشاريع</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={() => setLogoutConfirm(true)}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        onConfirm={() => {
          clearAllData();
          navigate('/');
        }}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد من تسجيل الخروج؟ سيتم مسح جميع البيانات المحلية."
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        type="warning"
      />
    </aside>
  );
};

export default Sidebar;
