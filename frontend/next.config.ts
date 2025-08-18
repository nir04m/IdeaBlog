import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: { ignoreDuringBuilds: true },

  async redirects() {
    return [
      {
        source: "/",          // when visiting /
        destination: "/landing", // send them here
        permanent: true,      // 308 permanent redirect
      },
    ];
  },
};

export default nextConfig;
