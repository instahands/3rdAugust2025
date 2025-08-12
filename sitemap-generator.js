// sitemap-generator.js

import { SitemapStream } from 'sitemap';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// Define the base URL of your website
const hostname = 'https://instahands.in';

// Define the public-facing, indexable routes for your website
const urls = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/app', changefreq: 'weekly', priority: 0.9 },
  { url: '/app/orders', changefreq: 'weekly', priority: 0.7 },
  { url: '/app/account', changefreq: 'monthly', priority: 0.6 },
  // Add more public routes here as needed
];

// --- FIX ---
// Check if the output directory exists, and create it if it doesn't.
const outputDir = 'dist';
if (!existsSync(outputDir)) {
  mkdirSync(outputDir);
}
// --- END FIX ---

// Create the sitemap instance
const sitemap = new SitemapStream({ hostname });

const writeStream = createWriteStream(resolve(outputDir, 'sitemap.xml'));
sitemap.pipe(writeStream);

// Write the sitemap to the output directory
urls.forEach(url => {
  sitemap.write(url);
});
sitemap.end();

writeStream.on('finish', () => {
  console.log('Sitemap created successfully!');
});