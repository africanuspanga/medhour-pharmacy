import type { NextConfig } from "next";

// BUILD_STATIC=1 produces a fully static export (npm run build:static) for
// demo hosting (e.g. Render static sites). Normal builds are unaffected.
const isStaticExport = process.env.BUILD_STATIC === "1";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (product images bucket)
      { protocol: "https", hostname: "**.supabase.co" },
    ],
    // next/image optimization requires a server; disable it for static export.
    ...(isStaticExport ? { unoptimized: true } : {}),
  },
  ...(isStaticExport
    ? {
        output: "export",
        // Static hosts serve /shop/ -> /shop/index.html.
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
