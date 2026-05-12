import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lawcaseai.com';

  const routes = [
    '',
    '/features',
    '/pricing',
    '/about',
    '/knowledge-base',
    '/privacy',
    '/terms',
    '/refund',
    '/login',
    '/register',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'weekly' : 'monthly') as "weekly" | "monthly",
    priority: route === '' ? 1 : route.includes('pricing') || route.includes('features') ? 0.8 : 0.5,
  }));

  return sitemapEntries;
}
