"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  AnimatePresence,
  type Variants,
  // (optional) type Easing if you want to annotate the tuple
} from "motion/react";
import React, { useEffect, useState } from "react";

export const ImagesSlider = ({
  images,
  children,
  overlay = true,
  overlayClassName,
  className,
  autoplay = true,
  direction = "up",
}: {
  images: string[];
  children: React.ReactNode;
  overlay?: boolean;              // ← was ReactNode; this prop is used as boolean
  overlayClassName?: string;
  className?: string;
  autoplay?: boolean;
  direction?: "up" | "down";
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  const handleNext = () =>
    setCurrentIndex((i) => (i + 1 === images.length ? 0 : i + 1));
  const handlePrevious = () =>
    setCurrentIndex((i) => (i - 1 < 0 ? images.length - 1 : i - 1));

  useEffect(() => {
    const load = async () => {
      const promises = images.map(
        (src) =>
          new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(src);
            img.onerror = reject;
          })
      );
      const loaded = await Promise.all(promises);
      setLoadedImages(loaded);
    };
    load();
  }, [images]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrevious();
    };
    window.addEventListener("keydown", onKey);

    let id: ReturnType<typeof setInterval> | undefined;
    if (autoplay) id = setInterval(handleNext, 5000);

    return () => {
      window.removeEventListener("keydown", onKey);
      if (id) clearInterval(id);
    };
  }, [autoplay, handleNext, handlePrevious]); // fine to omit if you prefer

  // Make ease a tuple (not number[])
  const easeOutQuart = [0.645, 0.045, 0.355, 1.0] as const;

  const slideVariants: Variants = {
    initial: { scale: 0, opacity: 0, rotateX: 45 },
    visible: {
      scale: 1,
      rotateX: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: easeOutQuart },
    },
    upExit: { opacity: 1, y: "-150%", transition: { duration: 1 } },
    downExit: { opacity: 1, y: "150%", transition: { duration: 1 } },
  };

  const ready = loadedImages.length > 0;

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className
      )}
      style={{ perspective: "1000px" }}
    >
      {ready && children}
      {ready && overlay && (
        <div className={cn("absolute inset-0 z-40 bg-black/60", overlayClassName)} />
      )}

      {ready && (
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={loadedImages[currentIndex]}
            initial="initial"
            animate="visible"
            exit={direction === "up" ? "upExit" : "downExit"}
            variants={slideVariants}
            className="image absolute inset-0 h-full w-full object-cover object-center"
          />
        </AnimatePresence>
      )}
    </div>
  );
};
