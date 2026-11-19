import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useLocation } from 'react-router-dom';

interface PageWrapperProps {
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const location = useLocation();

  const isFullScreen = [
    '/suspects/chase-map',
    '/monitoring',
    '/detection-map',
  ].includes(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-[#070a11] text-slate-100 select-none">
      {/* Sidebar */}
      <Sidebar />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#070a11]">
        <Navbar />
        <main
          className={`flex-1 w-full relative ${
            isFullScreen
              ? 'p-0 overflow-hidden'
              : 'p-6 overflow-y-auto'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageWrapper;
