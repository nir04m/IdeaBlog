"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import userService, { UserProfile } from "@/services/userService";
import onboardingService from "@/services/onboardingService";
import SidebarLayout from "@/app/components/layout/SidebarLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import RequireAuth from "@/components/auth/RequireAuth";
import { Navbar } from "@/app/components/layout/Navbar";

/* schema */
const onboardingSchema = z.object({
  bio: z.string().max(160, "Max 160 characters"),
  profilePicture: z
    .union([z.string().url(), z.literal(""), z.undefined()])
    .transform((v) => (v && v !== "" ? v : undefined)),
});
type OnboardingInput = z.infer<typeof onboardingSchema>;

function getDefaultAvatar() {
  return "/user.png";
}
function toAbsoluteIfRelative(u?: string) {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return new URL(u, window.location.origin).toString();
}

export default function ProfilePage() {
  const qc = useQueryClient();
  const router = useRouter();

  /* --- HOOKS: always at the top, no conditionals --- */
  const userQ = useQuery<UserProfile, Error>({
    queryKey: ["user", "me"],
    queryFn: () => userService.getProfile(),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: OnboardingInput) =>
      onboardingService.completeOnboarding(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["user", "me"] });
      window.location.href = "/feed";
    },
  });

  const logoutMutation = useMutation({
    mutationFn: userService.logout,
    onSuccess: () => {
      qc.clear();
      localStorage.clear();
      router.push("/feed");
    },
  });

  const [preview, setPreview] = useState<string>(getDefaultAvatar());
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { bio: "", profilePicture: undefined },
  });

  /* hydrate when user arrives */
  useEffect(() => {
    const u = userQ.data;
    if (!u) return;
    reset({
      bio: u.bio ?? "",
      profilePicture: u.profilePicture ?? undefined,
    });
    setPreview(u.profilePicture || getDefaultAvatar());
  }, [userQ.data, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPendingFile(f);
    setPreview(URL.createObjectURL(f));
    setValue("profilePicture", undefined, { shouldValidate: false, shouldDirty: true });
    clearErrors("profilePicture");
  };

  const onSubmit = async (data: OnboardingInput) => {
    try {
      let url = data.profilePicture ?? userQ.data?.profilePicture ?? "";

      if (pendingFile) {
        const { url: uploadedUrl } = await onboardingService.uploadAvatar(pendingFile);
        url = uploadedUrl;
      }
      if (!url) url = getDefaultAvatar();
      url = toAbsoluteIfRelative(url)!;

      await saveMutation.mutateAsync({ ...data, profilePicture: url });
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.error || e?.message || "Save failed");
    }
  };

  /* early returns are OK now because all hooks are already declared */
  if (userQ.isLoading) return <p className="p-8 text-center">Loading your profile…</p>;
  if (userQ.isError || !userQ.data)
    return <p className="p-8 text-center text-red-500">Failed to load user.</p>;

  const saving = saveMutation.status === "pending";

  return (
    <>
      <Navbar />
      <RequireAuth>
        <SidebarLayout
          user={userQ.data ?? null}
          onLogout={() => logoutMutation.mutate()}
          initialOpen={false}
        >
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
                Edit Your Profile
              </h1>

              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200">
                  {preview ? (
                    <img src={preview} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <label className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                  Upload new avatar
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={userQ.data.username}
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
                  {errors.bio && <p className="text-red-500 text-sm">{errors.bio.message}</p>}
                </div>

                <input type="hidden" {...register("profilePicture")} />
                {errors.profilePicture && (
                  <p className="text-red-500 text-sm">{errors.profilePicture.message}</p>
                )}

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Updating…" : "Update Profile"}
                </Button>
              </form>
            </div>
          </div>
        </SidebarLayout>
      </RequireAuth>
    </>
  );
}
