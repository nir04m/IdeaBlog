"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import postService, { UpdatePostInput } from "@/services/postService";
import categoriesService, { Category } from "@/services/categoriesService";
import mediaService from "@/services/mediaService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import SidebarLayout from "@/app/components/layout/SidebarLayout";
import userService, { UserProfile } from "@/services/userService";

/* ---------- Validation ---------- */
const schema = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(10, "Content is required"),
  categoryId: z.number().int().min(1, "Pick a category"),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
});
type FormInput = z.infer<typeof schema>;

export default function EditPostPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

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

  // Load post
  const postQ = useQuery({
    queryKey: ["posts", postId],
    queryFn: () => postService.getPostById(postId),
    enabled: Number.isFinite(postId) && postId > 0,
  });

  // Load categories
  const catsQ = useQuery({
    queryKey: ["categories", "all"],
    queryFn: categoriesService.list,
    staleTime: 1000 * 60 * 5,
  });

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: 0,
      imageUrl: "",
    },
  });

  // When post loads, hydrate form + preview
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!postQ.data) return;
    const p = postQ.data;

    reset({
      title: p.title ?? "",
      content: p.content ?? "",
      categoryId: p.categoryId ?? 0,
      imageUrl: p.imageUrl ?? "",
    });

    setCoverPreview(p.imageUrl ?? null);
    setOriginalImageUrl(p.imageUrl ?? null);   // <-- keep what’s stored in DB right now

    if (catsQ.data) {
      const match = catsQ.data.find((c) => c.id === p.categoryId) || null;
      setSelectedCategory(match);
    }
  }, [postQ.data, catsQ.data, reset]);

  // preview-only uploader stays the same
  const previewOnlyUploader = async (file: File) => {
    setPendingFile(file);
    const local = URL.createObjectURL(file);
    setCoverPreview(local);
    return local;
  };

  const onSubmit: SubmitHandler<FormInput> = async (values) => {
    setSubmitting(true);
    setErrMsg(null);
    try {
      let nextImageUrl: string | null = originalImageUrl ?? null;

      if (pendingFile) {
        // 1) delete old media for this post (match exact URL first, else latest)
        await mediaService.deleteCurrentCover(postId, originalImageUrl);

        // 2) upload the new file once
        const uploaded = await mediaService.uploadForPost(postId, pendingFile);
        nextImageUrl = uploaded.url;
      }

      // 3) update the post
      const payload: UpdatePostInput = {
        title: values.title,
        content: values.content,
        categoryId: values.categoryId,
        imageUrl: nextImageUrl ?? "", // or null if your API prefers
      };

      await postService.update(postId, payload);
      // go to the post
      router.push(`/posts/${postId}`);
    } catch (err: any) {
      console.error(err);
      setErrMsg(err?.response?.data?.error || "Failed to update post");
      setSubmitting(false);
    }
  };

  const catButtonLabel = useMemo(
    () => selectedCategory?.name ?? "Select category",
    [selectedCategory]
  );

  const loading = postQ.isLoading || catsQ.isLoading;
  const loadError = postQ.isError;

  return (
    <SidebarLayout
          user={user ?? null}
          onLogout={() => logoutMutation.mutate()}
          initialOpen={false}
        >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
        <div className="mx-auto w-full max-w-3xl rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
          <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Edit post
          </h1>

          {loading && <p>Loading…</p>}
          {loadError && (
            <p className="text-red-500">
              Couldn’t load the post. (Are you logged in / allowed to edit?)
            </p>
          )}

          {!loading && !loadError && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errMsg && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded p-2">
                  {errMsg}
                </p>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Post title…" {...register("title")} />
                {errors.title && <p className="text-sm text-blue-500">{errors.title.message}</p>}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  rows={8}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                  placeholder="Update your story…"
                  {...register("content")}
                />
                {errors.content && <p className="text-sm text-blue-500">{errors.content.message}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                      disabled={catsQ.isLoading}
                    >
                      {catButtonLabel}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[--radix-dropdown-menu-trigger-width] max-h-64 overflow-auto"
                  >
                    {(catsQ.data ?? []).map((cat) => (
                      <DropdownMenuItem
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setValue("categoryId", cat.id, { shouldValidate: true, shouldDirty: true });
                        }}
                      >
                        {cat.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <input type="hidden" {...register("categoryId", { valueAsNumber: true })} />
                {errors.categoryId && (
                  <p className="text-sm text-blue-500">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Cover image (preview now, upload on save) */}
              <div className="space-y-2">
                <Label>Cover image</Label>
                <FileUpload
                  uploader={previewOnlyUploader}
                  onUploadComplete={(url) => setCoverPreview(url ?? null)}
                />
                {coverPreview && (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="mt-3 h-40 w-full rounded object-cover border border-gray-200 dark:border-gray-700"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/posts/${postId}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
