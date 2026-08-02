import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return ['','/planos','/parceiro'].map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path ? 'weekly' : 'daily', priority: path ? 0.7 : 1 }));
}
