// "use client";

// import * as React from "react";
// import { useSessionTheme, ThemeMode } from "./SessionThemeProvider";

// const cycle: Record<ThemeMode, ThemeMode> = {
//   system: "light",
//   light: "dark",
//   dark: "system",
// };

// export function ThemeToggle() {
//   const { mode, setMode } = useSessionTheme();
//   const next = cycle[mode];

//   return (
//     <button
//       onClick={() => setMode(next)}
//       className="px-3 py-1 rounded border text-sm bg-white/70 dark:bg-neutral-900/70"
//       title={`Switch to ${next}`}
//     >
//       Theme: {mode}
//     </button>
//   );
// }
