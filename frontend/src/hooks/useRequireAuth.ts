"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import userService, { UserProfile } from "@/services/userService";

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();

  const q = useQuery<UserProfile | null>({
    queryKey: ["user", "me", "guard"],
    queryFn: async () => {
      try {
        return await userService.getProfile();
      } catch (err: any) {
        if (err?.response?.status === 401) return null; // not logged in
        throw err;
      }
    },
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!q.isLoading && q.data === null) {
      // Not authenticated → send to login with return path
      const next = encodeURIComponent(pathname || "/feed");
      router.replace(`/login?next=${next}`);
    }
  }, [q.isLoading, q.data, router, pathname]);

  return q; // { data: UserProfile | null, isLoading, isError, ... }
}
