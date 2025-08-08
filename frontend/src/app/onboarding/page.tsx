// src/app/onboarding/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import userService, { UserProfile } from "@/services/userService";
import onboardingService from "@/services/onboardingService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AxiosResponse } from "axios";

// 1) Zod schema for onboarding form
const onboardingSchema = z.object({
  bio: z.string().max(160, "Bio must be 160 characters or less"),
  avatarUrl: z.string().url().optional(),
});
type OnboardingInput = z.infer<typeof onboardingSchema>;

// 2) Helper to pick a random avatar if none provided
function getRandomAvatar(): string {
  const n = Math.floor(Math.random() * 100) + 1;
  return `https://avatar.iran.liara.run/public/${n}.png`;
}

export default function OnboardingPage() {
  const qc = useQueryClient();

  // 3) Fetch current user
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useQuery<UserProfile, Error>({
    queryKey: ["user", "me"],
    queryFn: () => userService.getProfile(),
  });

  // 4) Set initial preview to existing picture or a random one
  const [preview, setPreview] = useState<string>(
    user?.profilePicture ?? getRandomAvatar()
  );

  // 5) Form setup
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      bio: "",
      avatarUrl: user?.profilePicture ?? "",
    },
  });

  // When user data arrives, overwrite preview + form value if they already have one
  useEffect(() => {
    if (user?.profilePicture) {
      setPreview(user.profilePicture);
      setValue("avatarUrl", user.profilePicture);
    }
  }, [user, setValue]);

  // 6) Mutation to complete onboarding
  const mutation = useMutation<AxiosResponse<any>, Error, OnboardingInput>({
  mutationFn: onboardingService.completeOnboarding,
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["user","me"] });
    window.location.href = "/";
  },
});

  // 7) Handle file input → preview → upload → set form value
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // show local preview immediately
    setPreview(URL.createObjectURL(file));
    // upload to your R2 via the service
    const { url } = await onboardingService.uploadAvatar(file);
    // set the form’s hidden avatarUrl to the new public URL
    setValue("avatarUrl", url);
  };

  // 8) onSubmit: if they've never set an avatar, give them a random one
  const onSubmit = (data: OnboardingInput) => {
    if (!data.avatarUrl) {
      data.avatarUrl = getRandomAvatar();
    }
    mutation.mutate(data);
  };

  if (userLoading) {
    return <p className="p-8 text-center">Loading your profile…</p>;
  }
  if (userError || !user) {
    return <p className="p-8 text-red-500 text-center">Failed to load user.</p>;
  }

  const loading = mutation.status === "pending";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
          Complete Your Profile
        </h1>

        {/* Avatar uploader */}
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

        {/* Onboarding form */}
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
              {...register("bio")}
              rows={4}
              className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.bio && (
              <p className="text-red-500 text-sm">{errors.bio.message}</p>
            )}
          </div>

          {/* hidden field for avatarUrl */}
          <input type="hidden" {...register("avatarUrl")} />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
