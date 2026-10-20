import type { MetadataRoute } from "next";

// Disallow everything until launch (H10) decides which pages are public.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
