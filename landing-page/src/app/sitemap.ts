import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arcnano.dev";
  const currentDate = new Date();

  return [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#blueprint`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#problem`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#solution`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#roadmap`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/llms-full.txt`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];
}
