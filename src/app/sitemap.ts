import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";

// /guestbook is left out on purpose: its form cannot succeed (issue 06 of
// agent-answers-from-the-corpus), and a search result should not land there.
const PATHS = ["/", "/achievements", "/chat"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: new URL(path, SITE_URL).toString() }));
}
