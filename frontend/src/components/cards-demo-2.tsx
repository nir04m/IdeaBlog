// src/components/ui/ContentCard.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ContentCardProps {
  title: string;
  excerpt: string;
  imageUrl?: string | null;
  authorName: string;
  authorAvatarUrl?: string;
  date: string;
}

export function ContentCard({
  title,
  excerpt,
  imageUrl,
  authorName,
  authorAvatarUrl,
  date,
}: ContentCardProps) {
  return (
    <div className="max-w-sm w-full group/card">
      <div
        className={cn(
          "cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl flex flex-col justify-between p-4 bg-cover bg-center transition-transform group-hover/card:scale-105",
        )}
        style={{ backgroundImage: `url(${imageUrl || "/placeholder.jpg"})` }}
      >
        {/* dark overlay on hover */}
        <div className="absolute inset-0 bg-black opacity-20 group-hover/card:opacity-40 transition" />

        {/* Author row */}
        <div className="relative z-10 flex items-center space-x-3">
          {authorAvatarUrl ? (
            <img
              src={authorAvatarUrl}
              alt={authorName}
              className="h-10 w-10 rounded-full border-2 object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-400" />
          )}
          <div className="flex flex-col">
            <p className="text-gray-50 font-normal">{authorName}</p>
            <p className="text-sm text-gray-300">{date}</p>
          </div>
        </div>

        {/* Title & excerpt */}
        <div className="relative z-10 mt-4">
          <h3 className="font-bold text-xl md:text-2xl text-gray-50">{title}</h3>
          <p className="font-normal text-sm text-gray-50 mt-2 line-clamp-3">{excerpt}</p>
        </div>
      </div>
    </div>
  );
}


