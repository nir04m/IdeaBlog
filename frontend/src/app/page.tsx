"use client";

import { ImagesSlider } from "@/components/ui/images-slider";
import { motion } from "framer-motion";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroTypewriterWithSlider() {
  const images = ["/Hero1.png", "/Hero2.png", "/Hero3.png"];
  const hero3Dimensions = { width: 1200, height: 800 };

  const words = [
    { text: "Share", className: "text-white"  },
    { text: "your", className: "text-white"  },
    { text: "ideas", className: "text-white"  },
    { text: "with", className: "text-white"  },
    { text: "IdeaBlog", className: "text-blue-400" },
  ];

  return (
    <div className="relative h-screen w-full">
      {/* Slider behind */}
      <ImagesSlider
        className="absolute inset-0 h-full w-full"
        images={images}
        
      >
        {/* ensure each image covers */}
        <style jsx global>{`
          .image {
            object-fit: cover !important;
            object-position: center !important;
          }
        `}</style>
      </ImagesSlider>

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center"
      >
        <p className="text-white text-sm sm:text-base mb-4 max-w-lg drop-shadow-lg">
          Explore fresh perspectives and share your voice with a community that values your ideas.
        </p>

        <TypewriterEffectSmooth words={words} />

        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <Link href="/register">
            <Button className="w-40 bg-white text-black hover:bg-white/90">
              Join now
            </Button>
          </Link>
          <Link href="/login">
            <Button className="w-40 bg-white text-black hover:bg-white/90">
              Log in
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
