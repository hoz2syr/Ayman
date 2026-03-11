import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState, useEffect } from 'react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Auto-close sidebar on mobile/tablet
      if (width < 1024) {
        setSidebarOpen(false);
      }
      
      // Auto-collapse sidebar on large screens if user previously collapsed it
      if (width >= 1280 && sidebarCollapsed) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  const handleSidebarToggle = () => {
    if (isMobile || isTablet) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const sidebarWidth = sidebarCollapsed ? 'w-[72px] min-w-[72px]' : 'w-[260px] min-w-[260px]';

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden" dir="rtl">
      {/* Mobile/Tablet Overlay */}
      {(sidebarOpen && (isMobile || isTablet)) && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={handleCloseSidebar}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-50 h-full transition-all duration-300 ease-in-out flex-shrink-0
        ${isMobile || isTablet 
          ? `w-[280px] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` 
          : `${sidebarWidth} ${sidebarCollapsed ? 'lg:w-[72px] lg:min-w-[72px]' : ''}`
        }
      `}>
        <Sidebar 
          onNavigate={handleCloseSidebar} 
          collapsed={sidebarCollapsed && !isMobile && !isTablet}
          onToggleCollapse={handleSidebarToggle}
          isMobile={isMobile || isTablet}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <Header 
          onMenuClick={handleSidebarToggle}
          onCollapseClick={!isMobile && !isTablet ? handleSidebarToggle : undefined}
          isCollapsed={sidebarCollapsed && !isMobile && !isTablet}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-3 sm:p-4 md:p-5 lg:p-6 min-h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
