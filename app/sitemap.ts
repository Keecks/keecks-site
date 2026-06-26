import type { MetadataRoute } from 'next'

const BASE = 'https://keecks.ai'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const homeAlternates = { languages: { en: `${BASE}/`, it: `${BASE}/it` } }

  return [
    { url: `${BASE}/`,            lastModified: now, changeFrequency: 'monthly', priority: 1.0, alternates: homeAlternates },
    { url: `${BASE}/it`,         lastModified: now, changeFrequency: 'monthly', priority: 1.0, alternates: homeAlternates },
    { url: `${BASE}/book`,       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/it/book`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/it/landing`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`,    lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/it/privacy`, lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/cookies`,    lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/it/cookies`, lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]
}
