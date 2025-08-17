"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconUserPlus,
  IconLogin,
  IconSquareRoundedPlus,
} from "@tabler/icons-react";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/services/userService";

/* ---------- Brand ---------- */
const Brand = ({ showText }: { showText: boolean }) => (
  <a
    href="/feed"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal"
  >
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    {showText && (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre font-medium text-black dark:text-white"
      >
        IdeaBlog
      </motion.span>
    )}
  </a>
);

export type NavLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
  action?: "logout";
};

type AppSidebarProps = {
  user: UserProfile | null;          // pass null for guests
  onLogout?: () => void;             // called when Logout is clicked
  initialOpen?: boolean;
  className?: string;
  authedLinksOverride?: NavLink[];   // optional: override default authed links
  guestLinksOverride?: NavLink[];    // optional: override guest links
};

export function AppSidebar({
  user,
  onLogout,
  initialOpen = false,
  className,
  authedLinksOverride,
  guestLinksOverride,
}: AppSidebarProps) {
  const [open, setOpen] = useState(initialOpen);
  const isAuthenticated = !!user;
  const avatar = user?.profilePicture || "/user.png";

  const SB_COLLAPSED = 56;  // ~ w-14
  const SB_EXPANDED  = 256; // ~ w-64

  // default links
  const authedLinks: NavLink[] =
    authedLinksOverride ?? [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      },
      {
        label: "Edit Profile",
        href: "/profile",
        icon: <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      },
      {
        label: "Create Post",
        href: "/posts/new",
        icon: <IconSquareRoundedPlus className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      },
      {
        label: "Logout",
        href: "#",
        icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        action: "logout",
      },
    ];

  const guestLinks: NavLink[] =
    guestLinksOverride ?? [
      {
        label: "Register",
        href: "/register",
        icon: <IconUserPlus className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      },
      {
        label: "Login",
        href: "/login",
        icon: <IconLogin className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      },
    ];

  return (
    <aside
      data-open={open}
      className={cn(
        "hidden md:block sticky top-0 h-screen shrink-0 overflow-hidden group",
        "bg-white dark:bg-gray-800",
        "border-r border-gray-200 dark:border-gray-700",
        "transition-[width] duration-300 ease-in-out",
        className
      )}
      style={{ width: open ? SB_EXPANDED : SB_COLLAPSED }}
    >
      <div className="h-full w-full">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Brand showText /> : <Brand showText={false} />}

              <div className="mt-8 flex flex-col gap-2">
                {(isAuthenticated ? authedLinks : guestLinks).map((link, idx) => {
                  const isLogout = link.action === "logout";
                  const content = <SidebarLink key={idx} link={link} />;
                  return isLogout ? (
                    <div
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        onLogout?.();
                      }}
                    >
                      {content}
                    </div>
                  ) : (
                    content
                  );
                })}
              </div>
            </div>

            {isAuthenticated ? (
              <SidebarLink
                link={{
                  label: user!.username,
                  href: "/profile",
                  icon: (
                    <img
                      src={avatar}
                      className="h-7 w-7 shrink-0 rounded-full object-cover"
                      width={28}
                      height={28}
                      alt="Avatar"
                    />
                  ),
                }}
              />
            ) : (
              <SidebarLink
                link={{
                  label: "IdeaBlog",
                  href: "/",
                  icon: <div className="h-7 w-7 rounded-md bg-black dark:bg-white" />,
                }}
              />
            )}
          </SidebarBody>
        </Sidebar>
      </div>
    </aside>
  );
}
