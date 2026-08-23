import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/request", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/store", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/reviews", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/auth/worker/register", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/auth/customer/register", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/inspection", priority: 0.8, changeFrequency: "weekly" as const },
  ];

  return routes.map((r) => ({
    url: new URL(r.path, base).toString(),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}

