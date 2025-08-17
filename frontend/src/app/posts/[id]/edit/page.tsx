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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChevronsUpDown } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import SidebarLayout from "@/app/elements/layout/SidebarLayout";
import userService, { UserProfile } from "@/services/userService";
import RequireAuth from "@/components/auth/RequireAuth";
import { Navbar } from "@/app/elements/layout/Navbar";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

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

  // 1. the previewOnlyUploader function:
  const previewOnlyUploader = async (file: File) => {
    console.log('New file selected:', file.name);
    
    // Store the file for later upload
    setPendingFile(file);
    
    // Create local preview URL
    const localPreviewUrl = URL.createObjectURL(file);
    setCoverPreview(localPreviewUrl);
    
    return localPreviewUrl;
  };

  // 2. Update the onSubmit function:
  const onSubmit: SubmitHandler<FormInput> = async (values) => {
    setSubmitting(true);
    setErrMsg(null);
    try {
      let finalImageUrl: string | null = null;

      if (pendingFile) {
        // User selected a new file - upload it and use the new URL
        console.log('Uploading new file...');
        const uploaded = await mediaService.uploadForPost(postId, pendingFile);
        finalImageUrl = uploaded.url;
        console.log('New file uploaded:', finalImageUrl);
      } else {
        // No new file selected - use whatever is in the form
        // This could be the existing image URL or empty string (to remove image)
        finalImageUrl = values.imageUrl || null;
        console.log('No new file, using form value:', finalImageUrl);
      }

      // Create the payload
      const payload: UpdatePostInput = {
        title: values.title,
        content: values.content,
        categoryId: values.categoryId,
        imageUrl: finalImageUrl, // This is now the correct new URL
        previousImageUrl: originalImageUrl, // This is what was originally in DB
      };

      console.log('Payload being sent:', {
        title: payload.title,
        imageUrl: payload.imageUrl,
        previousImageUrl: payload.previousImageUrl,
        hasNewFile: !!pendingFile,
        imageChanged: originalImageUrl !== finalImageUrl
      });

      await postService.update(postId, payload);
      router.push(`/posts/${postId}`);
    } catch (err: any) {
      console.error('Submit error:', err);
      setErrMsg(err?.response?.data?.error || "Failed to update post");
      setSubmitting(false);
    }
  };

  // 3. Add a remove image function:
  const removeCurrentImage = () => {
    // Clear the pending file and preview
    setPendingFile(null);
    setCoverPreview(null);
    
    // Set the form field to empty string to indicate image removal
    setValue("imageUrl", "", { shouldDirty: true, shouldValidate: false });
    
    console.log('Image removed - will delete on save');
  };

  const deleteMutation = useMutation({
    mutationFn: () => postService.remove(postId),
    onSuccess: async () => {
      // clear any cached lists/details
      await qc.invalidateQueries({ queryKey: ["posts"] });
      await qc.invalidateQueries({ queryKey: ["posts", postId] });
      router.push("/feed");
    },
    onError: (err: any) => {
      console.error(err?.response?.data || err);
      setErrMsg(err?.response?.data?.error || "Failed to delete post");
    },
  });

  const handleDelete = async () => {
    if (!window.confirm("Do you want to delete this post? This action can’t be undone.")) return;
    deleteMutation.mutate();
  };

  const catButtonLabel = useMemo(
    () => selectedCategory?.name ?? "Select category",
    [selectedCategory]
  );

  const loading = postQ.isLoading || catsQ.isLoading;
  const loadError = postQ.isError;

  return (
    <>
      <Navbar />
      <RequireAuth>
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
                <p className="text-blue-500">
                  Couldn’t load the post. (This post is either deleted or you don’t have permission to edit it.)
                </p>
              )}

              {!loading && !loadError && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {infoMsg && (
                    <p className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/30 rounded p-2">
                      {infoMsg}
                    </p>
                  )}
                  {errMsg && (
                    <p className="text-sm text-blue-500 bg-red-50 dark:bg-red-950/30 rounded p-2">
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
                    
                    {/* Show current preview (either new file or existing image) */}
                    {coverPreview && (
                      <div className="mt-3">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="h-40 w-full rounded object-cover border border-gray-200 dark:border-gray-700"
                        />
                        <div className="mt-2 flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeCurrentImage}
                          >
                            Remove image
                          </Button>
                          {pendingFile && (
                            <span className="text-xs text-green-600 self-center">
                              New file selected
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Show message when no preview but there was an original image */}
                    {!coverPreview && originalImageUrl && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Current image will be kept (no changes)
                        </p>
                      </div>
                    )}
                    
                    {/* Show message when image was removed */}
                    {!coverPreview && !originalImageUrl && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          No image selected
                        </p>
                      </div>
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
                    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={deleteMutation.status === "pending"}
                        >
                          {deleteMutation.status === "pending" ? "Deleting…" : "Delete post"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The post and its cover image will be permanently removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              setConfirmOpen(false);
                              deleteMutation.mutate();
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </form>
              )}
            </div>
          </div>
        </SidebarLayout>
      </RequireAuth>
    </>
  );
}
