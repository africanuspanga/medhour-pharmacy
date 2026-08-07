import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

// robots.txt never changes — prerender it once.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/checkout", "/cart", "/api"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
