"use client";

import React from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type Props = { children: React.ReactNode; fallback?: React.ReactNode };

export default function RequireAuth({ children, fallback }: Props) {
  const { data: user, isLoading } = useRequireAuth();

  if (isLoading || user === null) {
    // While verifying or redirecting, show a lightweight placeholder
    return (
      fallback ?? <div className="p-6 text-center">Checking your session…</div>
    );
  }

  return <>{children}</>;
}
