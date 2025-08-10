"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";

import postService from "@/services/postService";
import categoriesService, { Category } from "@/services/categoriesService";

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

/* ---------- Validation ---------- */
const schema = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(10, "Content is required"),
  // keep it a number in form state; no coerce needed
  categoryId: z.number().int().min(1, "Pick a category"),
  // allow empty string OR a valid URL (optional)
  imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

type FormInput = z.infer<typeof schema>;

export default function NewPostPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: 0, // 
      imageUrl: "",
    },
  });

  // Create
  const createMutation = useMutation({
    mutationFn: postService.create,
    onSuccess: () => {
      window.location.href = "/feed";
    },
  });

  const onSubmit: SubmitHandler<FormInput> = (data) => {
    createMutation.mutate(data);
  };

  const catButtonLabel = selectedCategory?.name ?? "Select category";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="mx-auto w-full max-w-3xl rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Create a new post
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            {/* Hidden field stored as number */}
            <input type="hidden" {...register("categoryId", { valueAsNumber: true })} />
            {errors.categoryId && <p className="text-sm text-blue-500">{errors.categoryId.message}</p>}
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label>Cover image</Label>
            {/* Use the prop your FileUpload exposes */}
            <FileUpload
              onUploadComplete={(url: string | undefined) => {
                setValue("imageUrl", url ?? "", { shouldValidate: true, shouldDirty: true });
              }}
            />
            {errors.imageUrl && <p className="text-sm text-blue-500">{errors.imageUrl.message}</p>}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isSubmitting || createMutation.isPending}>
              {createMutation.isPending ? "Publishing…" : "Publish Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
