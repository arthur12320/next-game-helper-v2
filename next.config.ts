import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    remotePatterns: [{ hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
