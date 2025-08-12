// sitemap-generator.js

const sitemap = require('sitemap');
const fs = require('fs');

// Define the base URL of your website
const hostname = 'https://instahands.in';

// Define the public-facing, indexable routes for your website
const urls = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/app', changefreq: 'weekly', priority: 0.9 },
  { url: '/app/orders', changefreq: 'weekly', priority: 0.7 },
  { url: '/app/account', changefreq: 'monthly', priority: 0.6 },
  // Add more public routes here if you have any
];

// Create the sitemap instance
const sm = sitemap.createSitemap({
  hostname: hostname,
  urls: urls
});

// Write the sitemap to the 'public' directory
fs.writeFileSync('public/sitemap.xml', sm.toString());

console.log('Sitemap created successfully!');