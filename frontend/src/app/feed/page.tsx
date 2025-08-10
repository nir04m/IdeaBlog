"use client";

import React, { useMemo, useState } from "react";
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

import postService, { Post } from "@/services/postService";
import userService, { UserProfile } from "@/services/userService";
import { ContentCard } from "@/components/cards-demo-2";
import ExpandableCardDemo from "@/components/expandable-card-demo-standard";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

/* ---------- Brand ----------- */

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

/* ---------- Page ----------- */

export default function FeedPage() {
  const qc = useQueryClient();
  const router = useRouter();
  
  //logout 
  const logoutMutation = useMutation({
    // use the fixed service
    mutationFn: userService.logout,
    onSuccess: () => {
      qc.clear();
      localStorage.clear();
      router.push('/feed');
    },
    onError: (err: any) => {
      console.error(err?.response?.data || err);
      alert('Logout failed');
    },
  });

  // Posts
  const { data: postsData, isLoading, isError } = useQuery<Post[]>({
    queryKey: ["posts", "all"],
    queryFn: postService.getAllPosts,
    staleTime: 1000 * 60 * 5,
  });
  const posts = Array.isArray(postsData) ? postsData : [];

  // User (optional – do not hard fail on 401)
  const { data: user } = useQuery<UserProfile | null>({
    queryKey: ["user", "me", "optional"],
    queryFn: async () => {
      try {
        return await userService.getProfile();
      } catch (err: any) {
        if (err?.response?.status === 401) return null;
        throw err;
      }
    },
    retry: false,
  });
  const isAuthenticated = !!user;

  // Recs
  const recommended = useMemo(() => {
    const copy = [...posts];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 3);
  }, [posts]);

  // Sidebar open state
  const [open, setOpen] = useState(false);

  // add this type locally so we can attach an action
  type NavLink = {
    label: string;
    href: string;
    icon: React.ReactNode;
    action?: "logout";
  };

  // ── Sidebar links
  const authedLinks: NavLink[] = [
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
      href: "/posts/new",              // ← change to your route if different (e.g. "/create-post")
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

  const guestLinks = [
    {
      label: "Register",
      href: "/register",
      icon: (
        <IconUserPlus className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Login",
      href: "/login",
      icon: (
        <IconLogin className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const avatar = user?.profilePicture || "/user.png"; // fallback to public/user.png

  const SB_COLLAPSED = 56;  // ~ w-14 (icons only)
  const SB_EXPANDED  = 256; // ~ w-64 (text + icons)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ─── SIDEBAR ───────────────────────────────────────────── */}
      <aside
        data-open={open}
        // this element has the white background + border AND the width animation,
        // so the “white strip” always matches the sidebar’s size
        className={[
          "hidden md:block sticky top-0 h-screen shrink-0 overflow-hidden group",
          "bg-white dark:bg-gray-800",
          "border-r border-gray-200 dark:border-gray-700",
          "transition-[width] duration-300 ease-in-out",
        ].join(" ")}
        // bind width to `open`
        style={{ width: open ? SB_EXPANDED : SB_COLLAPSED }}
      >
        {/* Make the inner sidebar fill the shell */}
        <div className="h-full w-full">
          <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10">
              <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                {open ? <Brand showText /> : <Brand showText={false} />}

                <div className="mt-8 flex flex-col gap-2">
                  {(isAuthenticated ? authedLinks : guestLinks).map((link, idx) => {
                    const isLogout = (link as any).action === "logout";
                    const content = <SidebarLink key={idx} link={link} />;
                    return isLogout ? (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          logoutMutation.mutate();
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

      {/* ─── MAIN CONTENT (no Home/Search header) ──────────────── */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Feed Grid */}
          <section className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading posts…</p>
            ) : isError ? (
              <p className="text-red-500">Failed to load posts.</p>
            ) : (
              posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="group/card block"
                >
                  <ContentCard
                    title={post.title}
                    excerpt={
                      post.content.length > 120
                        ? post.content.slice(0, 120) + "…"
                        : post.content
                    }
                    imageUrl={post.imageUrl}
                    authorName={post.authorName}
                    authorAvatarUrl={post.authorPicture ?? undefined}
                    date={new Date(post.createdAt).toLocaleDateString()}
                  />
                </Link>
              ))
            )}
          </section>

          {/* Recommended Sidebar */}
          <aside className="w-full md:w-80 p-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Recommended Blogs
            </h2>
            {isLoading ? (
              <p>Loading…</p>
            ) : isError ? (
              <p className="text-red-500">Failed to load recommendations.</p>
            ) : (
              recommended.map((post) => (
                <ExpandableCardDemo key={post.id} post={post} />
              ))
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
