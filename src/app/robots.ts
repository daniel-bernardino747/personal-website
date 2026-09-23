import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    // The chat endpoint answers POSTs from the site itself and nothing else;
    // /guestbook is a form that cannot succeed (see sitemap.ts).
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/guestbook"] },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
