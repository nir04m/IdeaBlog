// // app/components/theme/SessionThemeProvider.tsx
// "use client";

// import * as React from "react";

// export type ThemeMode = "light" | "dark" | "system";
// const STORAGE_KEY = "theme"; // persists across tabs & browser restarts

// type Ctx = { mode: ThemeMode; setMode: (m: ThemeMode) => void };
// const ThemeCtx = React.createContext<Ctx | null>(null);

// function prefersDark(): boolean {
//   if (typeof window === "undefined") return false;
//   return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
// }

// function applyTheme(mode: ThemeMode) {
//   const root = document.documentElement;
//   const dark = mode === "dark" || (mode === "system" && prefersDark());
//   root.classList.toggle("dark", dark);
//   root.setAttribute("data-theme", dark ? "dark" : "light");
// }

// export function SessionThemeProvider({ children }: { children: React.ReactNode }) {
//   const [mode, setModeState] = React.useState<ThemeMode>("system");

//   // Initial load from localStorage
//   React.useEffect(() => {
//     try {
//       const saved = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
//       setModeState(saved);
//       applyTheme(saved);
//     } catch {
//       applyTheme("system");
//     }
//   }, []);

//   // Sync with OS changes when in "system"
//   React.useEffect(() => {
//     if (mode !== "system") return;
//     const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
//     const handler = () => applyTheme("system");
//     mql?.addEventListener?.("change", handler);
//     return () => mql?.removeEventListener?.("change", handler);
//   }, [mode]);

//   // Cross-tab sync: react to other tabs changing STORAGE_KEY
//   React.useEffect(() => {
//     const onStorage = (e: StorageEvent) => {
//       if (e.key !== STORAGE_KEY) return;
//       const next = (e.newValue as ThemeMode | null) ?? "system";
//       setModeState(next);
//       applyTheme(next);
//     };
//     window.addEventListener("storage", onStorage);
//     return () => window.removeEventListener("storage", onStorage);
//   }, []);

//   const setMode = React.useCallback((m: ThemeMode) => {
//     setModeState(m);
//     try {
//       localStorage.setItem(STORAGE_KEY, m);
//     } catch {}
//     applyTheme(m);
//   }, []);

//   return <ThemeCtx.Provider value={{ mode, setMode }}>{children}</ThemeCtx.Provider>;
// }

// export function useSessionTheme() {
//   const ctx = React.useContext(ThemeCtx);
//   if (!ctx) throw new Error("useSessionTheme must be used within SessionThemeProvider");
//   return ctx;
// }
