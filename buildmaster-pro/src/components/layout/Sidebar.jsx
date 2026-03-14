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
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  User
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCompanyInfo, clearAllData } from '../../utils/storage';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog from '../shared/ConfirmDialog';

const Sidebar = ({ onNavigate, collapsed = false, onToggleCollapse, isMobile = false }) => {
  const navigate = useNavigate();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const loadCompany = async () => {
      const info = await getCompanyInfo();
      setCompanyInfo(info);
    };
    loadCompany();
  }, []);

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

  const handleLinkClick = () => {
    onNavigate?.();
  };

  return (
    <aside className={`bg-slate-900/50 backdrop-blur-sm flex flex-col border-l border-slate-700/50 h-full ${collapsed ? 'items-center' : ''}`}>
      {/* Logo & Company Info */}
      <div className={`p-3 sm:p-4 border-b border-slate-700/50 ${collapsed ? 'py-4' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          {isMobile && (
            <button
              onClick={onNavigate}
              className="absolute top-4 start-4 p-2 rounded-lg hover:bg-slate-700 text-slate-400 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          {companyInfo?.logo ? (
            <img
              src={companyInfo.logo}
              alt={companyInfo.name}
              className={`object-contain rounded-lg bg-white p-1 flex-shrink-0 ${collapsed ? 'w-10 h-10' : 'w-12 h-12'}`}
            />
          ) : (
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <Building2 className={`${collapsed ? 'w-5 h-5' : 'w-7 h-7'} text-white`} />
            </div>
          )}
          
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-white truncate">
                {companyInfo?.name || 'BuildMaster Pro'}
              </h1>
              <p className="text-xs text-slate-400">نظام إدارة المشاريع</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 p-2 sm:p-3 space-y-1 overflow-y-auto overflow-x-hidden ${collapsed ? 'px-1' : ''}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 sm:py-3 rounded-lg transition-all cursor-pointer group
              ${collapsed ? 'justify-center' : ''}
              ${isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`
            }
            onClick={handleLinkClick}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={`flex-shrink-0 ${collapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
            {!collapsed && (
              <span className="font-medium text-sm truncate">{item.label}</span>
            )}
            {collapsed && (
              <span className="absolute right-full mr-2 px-2 py-1 bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle (Desktop only) */}
      {!isMobile && onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center p-2 mx-2 mb-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      )}

      {/* User Info */}
      {currentUser && !collapsed && (
        <div className="p-3 border-t border-slate-700 mx-2 mt-2">
          <div className="flex items-center gap-3 p-2 bg-slate-700/50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-slate-400 text-xs truncate">{currentUser.role === 'admin' ? 'مدير نظام' : currentUser.role === 'manager' ? 'مدير' : 'مستخدم'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className={`p-2 sm:p-3 border-t border-slate-700 ${collapsed ? 'px-1' : ''}`}>
        <button 
          onClick={() => setLogoutConfirm(true)}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-all ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'تسجيل الخروج' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <span className="font-medium text-sm">تسجيل الخروج</span>
          )}
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          clearAllData();
          navigate('/login');
        }}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد من تسجيل الخروج؟"
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        type="warning"
      />
    </aside>
  );
};

export default Sidebar;
