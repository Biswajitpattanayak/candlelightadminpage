import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    // ✅ CHANGED: w-full max-w-full overflow-x-hidden add kiya
    <div className="min-h-screen bg-gray-50 w-full max-w-full overflow-x-hidden">
      <Sidebar />
      <Header />
      <main
        className={`
          ${isMobile ? 'ml-0' : 'ml-64'}
          pt-16 p-4 md:p-6
          w-full max-w-full overflow-x-hidden
          ${!isMobile ? 'transition-[margin-left] duration-300' : ''}
        `}
      >
        {/* ✅ CHANGED: min-w-0 add kiya */}
        <div className="w-full mx-auto px-2 min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}