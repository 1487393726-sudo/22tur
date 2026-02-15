'use client';

import React, { useState } from 'react';
import { TopNavigation } from './TopNavigation';
import { BottomNavigation } from './BottomNavigation';
import { SidebarNavigation } from './SidebarNavigation';

interface UserPortalLayoutProps {
  children: React.ReactNode;
  unreadMessages?: number;
}

export const UserPortalLayout: React.FC<UserPortalLayoutProps> = ({
  children,
  unreadMessages = 0,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <div
      className="flex flex-col h-screen purple-gradient-page purple-gradient-content"
      data-route-type="user-portal"
    >
      {/* Top Navigation */}
      <TopNavigation
        unreadMessages={unreadMessages}
        onMenuToggle={(isOpen) => {
          // Handle mobile menu toggle if needed
        }}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <SidebarNavigation isOpen={isSidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNavigation unreadMessages={unreadMessages} />
    </div>
  );
};
