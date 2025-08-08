// src/app/register/page.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterInput } from "@/schemas/auth";
import authService from "@/services/authService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation<unknown, Error, RegisterInput>({
    mutationFn: authService.register,
    onSuccess: () => {
      router.push("/onboarding");
    },
  });

  const onSubmit = (data: RegisterInput) => {
    mutation.mutate(data);
  };

  // React Query v5 statuses: "idle" | "pending" | "success" | "error"
  const loading = mutation.status === "pending";
  const serverError = mutation.error?.message;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Create your account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...registerForm("username")} />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...registerForm("email")} />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...registerForm("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-red-500 text-sm">{serverError}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing up…" : "Sign up"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
