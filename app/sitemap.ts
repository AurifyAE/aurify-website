import type { MetadataRoute } from "next";
import { site } from "@/lib/content/site";
import { productOrder } from "@/lib/content/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = [
    "",
    "/about",
    "/products",
    ...productOrder.map((slug) => `/products/${slug}`),
    "/services",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.7,
  }));
}
