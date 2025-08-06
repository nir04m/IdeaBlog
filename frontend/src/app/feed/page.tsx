// src/app/feed/page.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { IconUserPlus, IconLogin, IconSun } from "@tabler/icons-react";

import postService, { Post } from "@/services/postService";
import { ContentCard } from "@/components/cards-demo-2";
import ExpandableCardDemo from "@/components/expandable-card-demo-standard";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LogoutButton } from "@/app/components/LogoutButton";

export default function FeedPage() {
  const isAuthenticated = false;

  const { data, isLoading, isError } = useQuery<Post[]>({
    queryKey: ["posts", "all"],
    queryFn: postService.getAllPosts,
    staleTime: 1000 * 60 * 5,
  });

  const posts = Array.isArray(data) ? data : [];

  // shuffle once per render and pick 3
  const recommended = useMemo(() => {
    const copy = [...posts];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 3);
  }, [posts]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ─── SIDEBAR ───────────────────────────────────────────── */}
      {isAuthenticated ? (
        <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <Sidebar>
            <SidebarBody className="flex flex-col justify-between h-full p-4">
              <SidebarLink link={{ label: "Dashboard", href: "/dashboard", icon: <IconSun /> }} />
              <SidebarLink link={{ label: "Profile",   href: "/profile",   icon: <IconUserPlus /> }} />
              <SidebarLink link={{ label: "Log out",   href: "#",           icon: <IconLogin /> }} />
            </SidebarBody>
            <LogoutButton />
          </Sidebar>
        </aside>
      ) : (
        <aside className="hidden md:flex flex-col items-center justify-center w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 space-y-6 py-4">
          <Link href="/register">
            <IconUserPlus size={24} className="text-gray-600 dark:text-gray-300 hover:text-blue-500" />
          </Link>
          <Link href="login">
            <IconLogin   size={24} className="text-gray-600 dark:text-gray-300 hover:text-blue-500" />
          </Link>
          <LogoutButton />
        </aside>
      )}

      {/* ─── MAIN CONTENT ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Home</h1>
          <div className="flex-1 mx-8">
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button aria-label="Toggle theme" className="p-2">
            <IconSun size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* ─ Feed Grid ─ */}
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

          {/* ─ Recommended Sidebar ─ */}
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
