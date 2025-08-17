// src/components/LogoutButton.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";
import authService from "@/services/authService";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      aria-label="Log out"
      className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      <IconLogout
        size={20}
        className={loading ? "animate-spin text-gray-400" : "text-gray-600 dark:text-gray-300"}
      />
    </button>
  );
}
