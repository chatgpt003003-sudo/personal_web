/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXTAUTH_URL || 'https://localhost:3000',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.8,
  
  // Additional pages to include
  additionalPaths: async (config) => {
    const result = [];
    
    // Add static pages with custom priorities
    result.push(
      await config.transform(config, '/', {
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      })
    );
    
    result.push(
      await config.transform(config, '/about', {
        changefreq: 'monthly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      })
    );
    
    result.push(
      await config.transform(config, '/contact', {
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      })
    );
    
    return result;
  },
  
  // Transform function for dynamic routes
  transform: async (config, path) => {
    // Custom transform for specific paths
    if (path === '/admin' || path.startsWith('/admin/')) {
      // Exclude admin pages from sitemap
      return null;
    }
    
    if (path.startsWith('/api/')) {
      // Exclude API routes from sitemap
      return null;
    }
    
    // Default transform
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  
  // Exclude paths
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/server-sitemap.xml',
    '/_next/*',
    '/static/*',
  ],
  
  // Robots.txt options
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
    additionalSitemaps: [
      // Add additional sitemaps here if needed
      // `${siteUrl}/server-sitemap.xml`,
    ],
  },
  
  // Generate separate sitemap for blog posts and projects (for future use)
  // This would be used with getServerSideProps in a custom sitemap route
  autoLastmod: true,
};