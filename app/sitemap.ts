import type { MetadataRoute } from "next"
import { locales } from "../i18n"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://creative.agency";
  const now = new Date();

  const publicRoutes = [
    "",
    "about",
    "services",
    "contact",
    "blog",
    "portfolio",
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const path of publicRoutes) {
      const url = path ? `${base}/${locale}/${path}` : `${base}/${locale}`;
      entries.push({
        url,
        lastModified: now,
        changeFrequency: path === "blog" ? "weekly" : "monthly",
        priority: path ? 0.7 : 1,
      });
    }
  }

  return entries
}
