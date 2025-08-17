"use client";

import React from "react";
import type { UserProfile } from "@/services/userService";
import { AppSidebar, type NavLink } from "./AppSidebar";

type SidebarLayoutProps = {
  user: UserProfile | null;
  onLogout?: () => void;
  initialOpen?: boolean;
  children: React.ReactNode;
  // optional overrides if you want per-page custom nav
  authedLinksOverride?: NavLink[];
  guestLinksOverride?: NavLink[];
};

export default function SidebarLayout({
  user,
  onLogout,
  initialOpen,
  children,
  authedLinksOverride,
  guestLinksOverride,
}: SidebarLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar
        user={user}
        onLogout={onLogout}
        initialOpen={initialOpen}
        authedLinksOverride={authedLinksOverride}
        guestLinksOverride={guestLinksOverride}
      />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
