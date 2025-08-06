// src/components/QueryProvider.tsx
"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* optional: <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
