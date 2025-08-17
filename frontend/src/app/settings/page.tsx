// "use client";

// import * as React from "react";
// import { useSessionTheme, ThemeMode } from "@/app/components/theme/SessionThemeProvider";
// import RequireAuth from "@/components/auth/RequireAuth";
// import SidebarLayout from "@/app/components/layout/SidebarLayout";
// import { useQuery } from "@tanstack/react-query";
// import userService, { UserProfile } from "@/services/userService";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// export default function SettingsPage() {
//   const { mode, setMode } = useSessionTheme();
//   // (Optional) fetch user for sidebar/avatar, etc.
//   const { data: user } = useQuery<UserProfile | null>({
//     queryKey: ["user", "me", "optional"],
//     queryFn: async () => {
//       try { return await userService.getProfile(); }
//       catch (e: any) { if (e?.response?.status === 401) return null; throw e; }
//     },
//     retry: false,
//   });

//   return (
    
//       <SidebarLayout user={user ?? null}>
//         <div className="max-w-2xl mx-auto p-6">
//           <h1 className="text-2xl font-semibold mb-6">Settings</h1>
//           <section className="rounded-lg border p-4 bg-white dark:bg-neutral-900">
//             <h2 className="text-lg font-medium mb-4">Theme (session only)</h2>
//             <RadioGroup
//               className="grid grid-cols-1 sm:grid-cols-3 gap-3"
//               value={mode}
//               onValueChange={(v) => setMode((v as ThemeMode) || "system")}
//             >
//               <div className="flex items-center space-x-2 rounded border p-3">
//                 <RadioGroupItem id="t-system" value="system" />
//                 <Label htmlFor="t-system">System</Label>
//               </div>
//               <div className="flex items-center space-x-2 rounded border p-3">
//                 <RadioGroupItem id="t-light" value="light" />
//                 <Label htmlFor="t-light">Light</Label>
//               </div>
//               <div className="flex items-center space-x-2 rounded border p-3">
//                 <RadioGroupItem id="t-dark" value="dark" />
//                 <Label htmlFor="t-dark">Dark</Label>
//               </div>
//             </RadioGroup>
//             <p className="mt-3 text-sm text-neutral-500">
//               This preference is stored only for this browser session and resets when you close the browser.
//             </p>
//           </section>
//         </div>
//       </SidebarLayout>
    
//   );
// }
import React from 'react';

export default function Settings() {
  return (
    <div>
      <h1>Settings</h1>
      {/* Your settings content */}
    </div>
  );
}