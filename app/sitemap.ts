import type { MetadataRoute } from 'next';
import { establishmentService } from '@/modules/establishments/service';
import { getSitemapCuratedUrls } from '@/lib/curated-routes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const now = new Date();
  const places = await establishmentService.search({});

  // Static institutional pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/planos`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/parceiro`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/privacidade`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/termos`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Individual places with real verified data
  const placeRoutes: MetadataRoute.Sitemap = places.map((place) => ({
    url: `${base}/lugar/${place.id}`,
    lastModified: place.lastUpdated ? new Date(place.lastUpdated) : now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Curated regional & thematic hubs with sufficient indexable content
  const curatedPaths = getSitemapCuratedUrls();
  const curatedRoutes: MetadataRoute.Sitemap = curatedPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...curatedRoutes, ...placeRoutes];
}
