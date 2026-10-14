// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The live WordPress site serves https://eazyfitwindowsanddoors.co.uk (no www). Live page slugs are kept
// as they are (/our-services, /leka-roofs, …) so rankings carry over; only retired URLs redirect.
const SITE = 'https://eazyfitwindowsanddoors.co.uk';

// Retired WordPress URLs (Wayback CDX index) → new routes. Static builds emit an instant-redirect
// page for each; real 301s live in vercel.json and public/_redirects (see REDIRECTS.md).
export const oldUrls = {
  '/conservatories': '/our-services',
  '/conservatories-2': '/our-services',
  '/windows-and-doors': '/our-services',
  '/windows-doors': '/our-services',
  '/leka-windows': '/leka-roofs',
  '/leka-system': '/leka-roofs',
  '/recent-projects': '/our-gallery',
  '/commercial-work': '/commercial',
  '/elementor-319': '/',
};

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  build: { format: 'file' },
  server: { port: 4342 },
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  scopedStyleStrategy: 'class',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  redirects: oldUrls,
});
