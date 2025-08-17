"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type IdeaBlogMarkProps = React.SVGProps<SVGSVGElement> & {
  /** size in px; overrides width/height props if provided */
  size?: number;
};

export function IdeaBlogMark({ className, size = 28, ...props }: IdeaBlogMarkProps) {
  const w = props.width ?? size;
  const h = props.height ?? size;

  return (
    <svg
      viewBox="0 0 48 48"
      width={w}
      height={h}
      aria-hidden="true"
      className={cn("block text-neutral-900 dark:text-neutral-100", className)}
      {...props}
    >
      <defs>
        <linearGradient id="ibGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />   {/* violet-500 */}
          <stop offset="100%" stopColor="#0ea5e9" /> {/* sky-500 */}
        </linearGradient>
      </defs>

      {/* Speech bubble (outline) */}
      <rect
        x="5"
        y="6"
        rx="9"
        ry="9"
        width="36"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {/* Tail of the bubble */}
      <path
        d="M18 30 L18 39 L24 30"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />

      {/* Lightbulb inside */}
      {/* Bulb glass */}
      <path
        d="M30 16c0 4.418-4 5.5-4 8h-4c0-2.5-4-3.582-4-8a6 6 0 1 1 12 0Z"
        fill="none"
        stroke="url(#ibGradient)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Filament */}
      <path
        d="M20 16c1.2-1 2.4-1.5 4-1.5S26.8 15 28 16"
        fill="none"
        stroke="url(#ibGradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Bulb base */}
      <rect
        x="20"
        y="24"
        width="8"
        height="4"
        rx="1"
        fill="url(#ibGradient)"
      />
    </svg>
  );
}
