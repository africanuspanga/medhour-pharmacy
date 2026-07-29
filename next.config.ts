import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (product images bucket)
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
