import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://www.noitedf.com.br';
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/parceiro/'] }, sitemap: `${base}/sitemap.xml` };
}
