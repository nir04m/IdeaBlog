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
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const { mutateAsync, isLoading, error } = useMutation<
    unknown,              // response type (if your API returns user or tokens, put that here)
    Error,                // error type
    RegisterInput         // the variables you pass to mutateAsync
  >(authService.register, {
    onSuccess: () => {
      router.push("/onboarding");
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    await mutateAsync(data);
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Create your account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" {...register("username")} />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm">
            {error.message || "Registration failed"}
          </p>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Signing up…" : "Sign up"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
