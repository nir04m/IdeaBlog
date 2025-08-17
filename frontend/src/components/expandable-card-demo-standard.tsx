// src/components/ui/RecommendedCard.tsx
"use client";

import React, { useId, useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import Link from "next/link";
import { Post } from "@/services/postService";

interface ExpandableCardDemoProps {
  post: Post;
}

export default function ExpandableCardDemo({ post }: ExpandableCardDemoProps) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  const id = useId();

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(false);
    }
    document.body.style.overflow = active ? "hidden" : "auto";
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [active]);

  useOutsideClick(ref, () => setActive(false));

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20"
          />
        )}
      </AnimatePresence>

      {/* Expanded */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="expanded"
            className="fixed inset-0 z-30 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              ref={ref}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden max-w-2xl w-full"
            >
              {/* Header */}
              <div className="flex items-center p-4 space-x-3">
                {post.authorPicture ? (
                  <img
                    src={post.authorPicture}
                    alt={post.authorName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-300" />
                )}
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {post.authorName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setActive(false)}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Image */}
              <motion.img
                layoutId={`image-${post.id}-${id}`}
                src={post.imageUrl || "/placeholder.jpg"}
                alt={post.title}
                className="w-full h-64 object-cover"
              />

              {/* Body */}
              <div className="p-6">
                <h3 className="font-bold text-2xl mb-2">{post.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {post.content.slice(0, 120)}...
                </p>

                {/* 🎯 FIXED Link: no inner <a> */}
                <Link
                  href={`/posts/${post.id}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Read full post
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed */}
      <motion.div
        layoutId={`card-${post.id}-${id}`}
        className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl cursor-pointer hover:shadow"
        onClick={() => setActive(true)}
      >
        <div className="flex items-center space-x-3">
          {post.authorPicture ? (
            <img
              src={post.authorPicture}
              alt={post.authorName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-300" />
          )}
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {post.title}
            </p>
            <p className="text-sm text-gray-500">
              {post.content.slice(0, 60)}…
            </p>
          </div>
        </div>

        {/* 🎯 FIXED Link here too */}
        <Link
          href={`/posts/${post.id}`}
          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200"
        >
          Read
        </Link>
      </motion.div>
    </>
  );
}


