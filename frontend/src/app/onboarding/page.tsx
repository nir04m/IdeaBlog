"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import userService, { UserProfile } from "@/services/userService";
import onboardingService from "@/services/onboardingService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/* Schema: accept "", undefined, or a valid URL; turn "" into undefined */
const onboardingSchema = z.object({
  bio: z.string().max(160, "Max 160 characters"),
  profilePicture: z
    .union([z.string().url(), z.literal(""), z.undefined()])
    .transform((v) => (v && v !== "" ? v : undefined)),
});
type OnboardingInput = z.infer<typeof onboardingSchema>;
/* ------------------------------------------------------------------ */

/** Local placeholder (must exist in /public) */
function getDefaultAvatar(): string {
  return "/user.png";
}

/** If string is a relative path (e.g. "/user.png"), make it absolute */
function toAbsoluteIfRelative(u?: string): string | undefined {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u; // already absolute
  return new URL(u, window.location.origin).toString();
}

export default function OnboardingPage() {
  const qc = useQueryClient();

  /* 1) Load current user */
  const { data: user, isLoading, isError } = useQuery<UserProfile, Error>({
    queryKey: ["user", "me"],
    queryFn: () => userService.getProfile(),
  });

  /* 2) Local state: preview and a pending file (deferred upload) */
  const [preview, setPreview] = useState<string>(getDefaultAvatar());
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  /* 3) Form */
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      bio: "",
      profilePicture: undefined, // we’ll set when user data arrives
    },
  });

  /* 4) When user arrives, set preview + form value (if they already have a picture) */
  useEffect(() => {
    if (!user) return;
    const existing = user.profilePicture?.trim();
    if (existing) {
      setPreview(existing);
      setValue("profilePicture", existing, { shouldValidate: false });
      clearErrors("profilePicture");
    } else {
      setPreview(getDefaultAvatar());
      setValue("profilePicture", undefined, { shouldValidate: false });
      clearErrors("profilePicture");
    }
  }, [user, setValue, clearErrors]);

  /* 5) Save mutation */
  const mutation = useMutation({
    mutationFn: (payload: OnboardingInput) =>
      onboardingService.completeOnboarding(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "me"] });
      window.location.href = "/feed";
    },
    onError: (err: any) => {
      console.error(err?.response?.data || err);
      alert(err?.response?.data?.error || err.message || "Save failed");
    },
  });

  /* 6) File chooser: set local preview and defer upload */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFile(file);
    setPreview(URL.createObjectURL(file));

    // make the field "absent" so schema doesn't try to URL-validate ""
    setValue("profilePicture", undefined, { shouldValidate: false, shouldDirty: true });
    clearErrors("profilePicture");
  };

  /* 7) Submit: upload once (if needed) then send a valid URL */
  const onSubmit = async (data: OnboardingInput) => {
    try {
      // Start with whatever the form/user currently has
      let url = data.profilePicture ?? user?.profilePicture ?? "";

      // If a new file was picked this session, upload now (single upload)
      if (pendingFile) {
        const { url: uploadedUrl } = await onboardingService.uploadAvatar(pendingFile);
        url = uploadedUrl; // this should already be absolute
      }

      // If still nothing, use the public placeholder and make it absolute
      if (!url) url = getDefaultAvatar();
      url = toAbsoluteIfRelative(url)!;

      await mutation.mutateAsync({ ...data, profilePicture: url });
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Unexpected error");
    }
  };

  if (isLoading) {
    return <p className="p-8 text-center">Loading your profile…</p>;
  }
  if (isError || !user) {
    return <p className="p-8 text-red-500 text-center">Failed to load user.</p>;
  }

  const saving = mutation.status === "pending";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
          Complete Your Profile
        </h1>

        {/* Avatar + picker */}
        <div className="flex flex-col items-center">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200">
            {preview ? (
              <img
                src={preview}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>
          <label className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
            Upload new avatar
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={user.username}
              readOnly
              className="bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              rows={4}
              {...register("bio")}
              className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.bio && (
              <p className="text-red-500 text-sm">{errors.bio.message}</p>
            )}
          </div>

          {/* Hidden profilePicture keeps existing URL when no new file is chosen */}
          <input type="hidden" {...register("profilePicture")} />
          {errors.profilePicture && (
            <p className="text-red-500 text-sm">{errors.profilePicture.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving…" : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}

