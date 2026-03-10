import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'الرئيسية' },
    { path: '/projects', label: 'المشاريع' },
    { path: '/contractors', label: 'المقاولون والموردون' },
    { path: '/expenses', label: 'المصاريف' },
    { path: '/invoices', label: 'الفواتير' },
    { path: '/settings', label: 'الإعدادات' },
  ];

  const currentPageTitle = navItems.find(item => item.path === location.pathname)?.label || 'الرئيسية';

  // Get current date in Arabic
  const currentDate = new Date().toLocaleDateString('ar-SY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="h-16 bg-[#0f172a] border-b border-slate-700 flex items-center justify-between px-6 flex-shrink-0">
      <h2 className="text-xl font-semibold text-white">{currentPageTitle}</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">{currentDate}</span>
      </div>
    </header>
  );
};

export default Header;
