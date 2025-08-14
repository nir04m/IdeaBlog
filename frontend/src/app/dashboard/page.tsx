"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import SidebarLayout from "@/app/components/layout/SidebarLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContentCard } from "@/components/cards-demo-2";

import postService, { Post } from "@/services/postService";
import userService, { UserProfile } from "@/services/userService";
import RequireAuth from "@/components/auth/RequireAuth";
import { Navbar } from "@/app/components/layout/Navbar";

function PostsGrid({
  posts,
  mode, // "view" | "edit"
}: {
  posts: Post[];
  mode: "view" | "edit";
}) {
  return (
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map((post) => {
        const href = mode === "view" ? `/posts/${post.id}` : `/posts/${post.id}/edit`;
        return (
          <Link key={post.id} href={href} className="group/card block">
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
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const qc = useQueryClient();
  const router = useRouter();

  // Optional user fetch (401 -> null), but Dashboard is protected UI:
  const { data: user, isLoading: userLoading } = useQuery<UserProfile | null>({
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

  // Redirect guests to login
  useEffect(() => {
    if (!userLoading && user === null) router.replace("/login");
  }, [user, userLoading, router]);

  // Logout handler for the sidebar
  const logoutMutation = useMutation({
    mutationFn: userService.logout,
    onSuccess: () => {
      qc.clear();
      localStorage.clear();
      router.push("/login");
    },
  });

  // My posts
  const {
        data: myPosts = [],
        isLoading,
        isError,
    } = useQuery<Post[]>({
        queryKey: ["posts", "byUser", user?.id],
        queryFn: () => postService.getByUser(user!.id),
        enabled: !!user?.id,          // wait until we know the user id
        staleTime: 1000 * 60 * 5,
    });

  return (
    <>
      <Navbar />
      <RequireAuth>
        <SidebarLayout
          user={user ?? null}
          onLogout={() => logoutMutation.mutate()}
          initialOpen={true}
        >
          <main className="w-full">
            <div className="px-4 py-8 md:px-8">
              <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                My Dashboard
              </h1>

              {isLoading || userLoading ? (
                <p className="text-gray-600 dark:text-gray-300">Loading…</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load your posts.</p>
              ) : myPosts.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">
                  You haven’t published any posts yet.
                </p>
              ) : (
                <Tabs defaultValue="view" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="view">View My Posts</TabsTrigger>
                    <TabsTrigger value="edit">Edit My Posts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="view">
                    <PostsGrid posts={myPosts} mode="view" />
                  </TabsContent>

                  <TabsContent value="edit">
                    <PostsGrid posts={myPosts} mode="edit" />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </main>
        </SidebarLayout>
      </RequireAuth>
    </>
  );
}
