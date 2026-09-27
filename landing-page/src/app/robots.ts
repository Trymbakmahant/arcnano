import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arcnano.dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      // Explicitly allow and prioritize AI crawlers for LLM search, indexing, and citations
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "Applebot",
          "Applebot-Extended",
          "Google-Extended",
          "cohere-ai",
          "CCBot",
          "Bytespider",
          "OAI-SearchBot",
        ],
        allow: ["/", "/llms.txt", "/llms-full.txt"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
