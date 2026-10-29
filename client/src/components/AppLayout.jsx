import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import ProfileModal from './ProfileModal';
import GeneralReportModal from './GeneralReportModal';
import AccessibilityStatementModal from './AccessibilityStatementModal';

const AppLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('accessable_sidebar_collapsed') === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('accessable_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-600 selection:text-white">
      {/* Skip to Content for Screen Readers / Keyboard Users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Persistent Left Sidebar (Desktop) & Slide-Out Drawer (Mobile) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenReportModal={() => setReportModalOpen(true)}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onOpenHelpModal={() => setHelpModalOpen(true)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Minimal Top Header */}
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenProfileModal={() => setProfileModalOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Dynamic Page Content */}
        <main id="main-content" className="flex-1" tabIndex="-1">
          {children}
        </main>

        {/* Restrained Project Footer */}
        <Footer />
      </div>

      {/* Global Modals triggered from Sidebar / Header */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      <GeneralReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      <AccessibilityStatementModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
