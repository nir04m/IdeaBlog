"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";

import postService from "@/services/postService";
import userService, { UserProfile } from "@/services/userService";
import SidebarLayout from "@/app/components/layout/SidebarLayout";
import { calsans } from "@/fonts/calsans";

/* Helpers */
function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "";
  }
}
function contentToNodes(content: string) {
  // turn blank lines into paragraph breaks
  return content
    .split(/\n{2,}/g)
    .map((para, i) => (
      <p key={i} className="mb-4">
        {para}
      </p>
    ));
}

export default function ReadPostPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  /* Fetch current user (optional, for sidebar) */
  const userQ = useQuery<UserProfile | null>({
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

  const logoutMutation = useMutation({
    mutationFn: userService.logout,
    onSuccess: () => {
      qc.clear();
      localStorage.clear();
      router.push("/feed");
    },
  });

  /* Load the post */
  const postQ = useQuery({
    queryKey: ["posts", postId],
    queryFn: () => postService.getPostById(postId),
    enabled: Number.isFinite(postId) && postId > 0,
  });

  if (postQ.isLoading) {
    return (
      <SidebarLayout
        user={userQ.data ?? null}
        onLogout={() => logoutMutation.mutate()}
        initialOpen={false}
      >
        <div className="p-8 text-center">Loading post…</div>
      </SidebarLayout>
    );
  }

  if (postQ.isError || !postQ.data) {
    return (
      <SidebarLayout
        user={userQ.data ?? null}
        onLogout={() => logoutMutation.mutate()}
        initialOpen={false}
      >
        <div className="p-8 text-center text-red-500">
          Sorry, we couldn’t load this post.
        </div>
      </SidebarLayout>
    );
  }

  const post = postQ.data;
  const badge = postQ.data.categoryName ?? "—"; // swap with category name if you fetch it

  return (
    <SidebarLayout
      user={userQ.data ?? null}
      onLogout={() => logoutMutation.mutate()}
      initialOpen={false}
    >
      <div className="px-6">
        <article className="relative mx-auto max-w-3xl antialiased pt-8">
          {/* Badge / meta */}
          <div className="mb-4 flex items-center gap-3">
            <span className="bg-black text-white rounded-full text-xs px-3 py-1">
              {badge}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(post.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h1 className={twMerge(calsans.className, "text-3xl md:text-4xl font-semibold mb-5")}>
            {post.title}
          </h1>

          {/* Cover image */}
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              width={1600}
              height={900}
              className="rounded-lg mb-8 object-cover w-full"
            />
          )}

          {/* Body */}
          <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-7">
            {contentToNodes(post.content || "")}
          </div>

          {/* Author footer (optional) */}
          <div className="mt-10 flex items-center gap-3">
            <img
              src={post.authorPicture || "/user.png"}
              className="h-8 w-8 rounded-full object-cover"
              alt={post.authorName || "Author"}
            />
            <div className="text-sm text-muted-foreground">
              By <span className="text-foreground">{post.authorName || "Anonymous"}</span>
            </div>
          </div>
        </article>
      </div>
    </SidebarLayout>
  );
}
