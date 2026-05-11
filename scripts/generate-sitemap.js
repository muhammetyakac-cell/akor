/* global process */
import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://tiniakor.com').replace(/\/$/, '');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const staticRoutes = ['/', '/artists'];

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const urlEntry = (path, priority = '0.7') => `  <url>\n    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

const fetchRoutes = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { songRoutes: [], artistRoutes: [] };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const [{ data: songs, error: songsError }, { data: artists, error: artistsError }] = await Promise.all([
    supabase.from('songs').select('slug').not('slug', 'is', null),
    supabase.from('artists').select('slug').not('slug', 'is', null),
  ]);

  if (songsError || artistsError) {
    throw songsError || artistsError;
  }

  return {
    songRoutes: (songs || []).map((song) => `/song/${song.slug}`),
    artistRoutes: (artists || []).map((artist) => `/artist/${artist.slug}`),
  };
};

const { songRoutes, artistRoutes } = await fetchRoutes();
const routes = [
  ...staticRoutes.map((path) => ({ path, priority: path === '/' ? '1.0' : '0.8' })),
  ...artistRoutes.map((path) => ({ path, priority: '0.7' })),
  ...songRoutes.map((path) => ({ path, priority: '0.9' })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(({ path, priority }) => urlEntry(path, priority)).join('\n')}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

await mkdir('public', { recursive: true });
await writeFile('public/sitemap.xml', sitemap);
await writeFile('public/robots.txt', robots);

console.log(`Generated sitemap with ${routes.length} URLs for ${siteUrl}`);
