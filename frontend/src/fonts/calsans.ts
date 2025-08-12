import localFont from "next/font/local";

// If you only have one weight:
export const calsans = localFont({
  src: [
    {
      path: "./calsans/CalSans-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-calsans",
  display: "swap",
});
