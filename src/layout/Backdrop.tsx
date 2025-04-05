import { useSidebar } from '@/context/SidebarContext';
import React from 'react';

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      role="button"
      tabIndex={0}
      onClick={toggleMobileSidebar}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleMobileSidebar();
        }
      }}
    />
  );
};

export default Backdrop;
