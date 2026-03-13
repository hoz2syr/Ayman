import { useLocation } from 'react-router-dom';
import { Menu, ChevronRight, Calendar, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

const Header = ({ onMenuClick, onCollapseClick, isCollapsed, isMobile }) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { path: '/home', label: 'الرئيسية' },
    { path: '/projects', label: 'المشاريع' },
    { path: '/contractors', label: 'المقاولون والموردون' },
    { path: '/expenses', label: 'المصاريف' },
    { path: '/invoices', label: 'الفواتير' },
    { path: '/settings', label: 'الإعدادات' },
  ];

  const currentPageTitle = navItems.find(item => item.path === location.pathname)?.label || 'الرئيسية';

  const currentDate = currentTime.toLocaleDateString('ar-SY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="h-14 sm:h-16 bg-[#0f172a] border-b border-slate-700 flex items-center justify-between px-3 sm:px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile/Tablet Menu Button */}
        {isMobile && (
          <button 
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-slate-700 text-white touch-target"
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Desktop Collapse Toggle */}
        {onCollapseClick && (
          <button
            onClick={onCollapseClick}
            className="hidden lg:flex p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors touch-target"
            title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
            aria-label={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Page Title */}
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white truncate max-w-[150px] sm:max-w-none">
          {currentPageTitle}
        </h2>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Date - Hidden on small mobile */}
        <span className="hidden xs:inline text-xs sm:text-sm text-slate-400 whitespace-nowrap">
          {currentDate}
        </span>
        
        {/* Quick Actions - Only on larger screens */}
        <div className="hidden md:flex items-center gap-2">
          <button 
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors touch-target"
            aria-label="الإشعارات"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
