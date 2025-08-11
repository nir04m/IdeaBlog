"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import SidebarLayout from "../components/layout/SidebarLayout";
import postService, { Post } from "@/services/postService";
import userService, { UserProfile } from "@/services/userService";
import { ContentCard } from "@/components/cards-demo-2";
import ExpandableCardDemo from "@/components/expandable-card-demo-standard";

export default function FeedPage() {
  const qc = useQueryClient();
  const router = useRouter();

  // posts
  const { data: postsData, isLoading, isError } = useQuery<Post[]>({
    queryKey: ["posts", "all"],
    queryFn: postService.getAllPosts,
    staleTime: 1000 * 60 * 5,
  });
  const posts = Array.isArray(postsData) ? postsData : [];

  // user (optional)
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

  // logout
  const logoutMutation = useMutation({
    mutationFn: userService.logout,
    onSuccess: () => {
      qc.clear();
      localStorage.clear();
      router.push("/feed");
    },
  });

  const recommended = React.useMemo(() => {
    const copy = [...posts];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 3);
  }, [posts]);

  return (
    <SidebarLayout
      user={user ?? null}
      onLogout={() => logoutMutation.mutate()}
      initialOpen={false}
    >
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Feed Grid */}
        <section className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            <p>Loading posts…</p>
          ) : isError ? (
            <p className="text-red-500">Failed to load posts.</p>
          ) : (
            posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="group/card block">
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
    </SidebarLayout>
  );
}
