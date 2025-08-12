"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import SidebarLayout from "@/app/components/layout/SidebarLayout";

import postService, { CreatePostInput } from "@/services/postService";
import mediaService from "@/services/mediaService";
import categoriesService, { Category } from "@/services/categoriesService";
import userService, { UserProfile } from "@/services/userService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import RequireAuth from "@/components/auth/RequireAuth";

/* ---------- Validation ---------- */
const schema = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(10, "Content is required"),
  categoryId: z.number().int().min(1, "Pick a category"),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
});
type FormInput = z.infer<typeof schema>;

export default function NewPostPage() {
  const router = useRouter();
  const qc = useQueryClient();

  // optional user for sidebar (don’t hard-fail on 401)
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

  // logout for sidebar
  const logoutMutation = useMutation({
    mutationFn: userService.logout,
    onSuccess: () => {
      qc.clear();
      localStorage.clear();
      router.push("/feed");
    },
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Categories
  const { data: categories, isLoading: loadingCats } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: categoriesService.list,
    staleTime: 1000 * 60 * 5,
  });

  // Form
  const {
    register,
    handleSubmit,
    setValue,
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

  // FileUpload: preview now, upload later on submit
  const previewOnlyUploader = async (file: File) => {
    setPendingFile(file);
    const local = URL.createObjectURL(file);
    setCoverPreview(local);
    return local; // for the dropzone preview
  };

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    setSubmitting(true);
    setErrMsg(null);

    try {
      // 1) create post (without image)
      const created = await postService.create({
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
      } as CreatePostInput);

      const postId =
        created.post?.id ??
        created.postId ??
        (() => {
          throw new Error("Create post response missing post id");
        })();

      // 2) upload image if selected
      if (pendingFile) {
        await mediaService.uploadForPost(postId, pendingFile);
        // if your backend does NOT copy url to posts.image_url automatically,
        // uncomment next line and implement postService.updateImage on the API:
        // await postService.updateImage(postId, media.url);
      }

      router.push("/feed");
    } catch (err: any) {
      console.error(err);
      setErrMsg(err?.response?.data?.error || "Failed to publish post");
      setSubmitting(false);
    }
  };

  const catButtonLabel = selectedCategory?.name ?? "Select category";

  return (
    <RequireAuth>
    <SidebarLayout
      user={user ?? null}
      onLogout={() => logoutMutation.mutate()}
      initialOpen={false}
    >
      {/* page content */}
      <main className="w-full">
        <div className="bg-gray-50 dark:bg-gray-900 py-10 px-4">
          <div className="mx-auto w-full max-w-3xl rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Create a new post
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errMsg && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded p-2">
                  {errMsg}
                </p>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="My awesome post…" {...register("title")} />
                {errors.title && <p className="text-sm text-blue-500">{errors.title.message}</p>}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  rows={8}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                  placeholder="Write your story…"
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
                      disabled={loadingCats}
                    >
                      {catButtonLabel}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[--radix-dropdown-menu-trigger-width] max-h-64 overflow-auto"
                  >
                    {(categories ?? []).map((cat) => (
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

              {/* Cover image */}
              <div className="space-y-2">
                <Label>Cover image</Label>
                <FileUpload
                  uploader={previewOnlyUploader}
                  onUploadComplete={(url) => setCoverPreview(url)}
                />
                {coverPreview && (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="mt-3 h-40 w-full rounded object-cover border border-gray-200 dark:border-gray-700"
                  />
                )}
              </div>

              {/* Submit */}
              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Publishing…" : "Publish Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </SidebarLayout>
    </RequireAuth>
  );
}
