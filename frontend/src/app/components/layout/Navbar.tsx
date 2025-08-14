"use client";

import Link from "next/link";
import { IdeaBlogMark } from "@/app/components/branding/IdeaBlogMark";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/70 bg-white/70 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Left: Logo + Name */}
        <Link href="/feed" className="group inline-flex items-center gap-2">
          <IdeaBlogMark className="transition-transform group-hover:scale-105" />
          <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            IdeaBlog
          </span>
        </Link>

        {/* Right: slot for actions (optional) */}
        <nav className="flex items-center gap-3 text-sm">
          {/* add your links or buttons here if you like */}
          {/* <Link href="/create" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">Create</Link> */}
        </nav>
      </div>
    </header>
  );
}
