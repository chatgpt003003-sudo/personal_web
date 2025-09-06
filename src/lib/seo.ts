import { NextSeoProps } from 'next-seo';

// Default SEO configuration
export const defaultSEO: NextSeoProps = {
  title: 'Portfolio - Full Stack Developer',
  description:
    'Professional portfolio showcasing full-stack development projects with modern technologies like Next.js, React, TypeScript, and AWS.',
  canonical: process.env.NEXTAUTH_URL || 'https://localhost:3000',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXTAUTH_URL || 'https://localhost:3000',
    siteName: 'Portfolio',
    title: 'Portfolio - Full Stack Developer',
    description:
      'Professional portfolio showcasing full-stack development projects with modern technologies like Next.js, React, TypeScript, and AWS.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Portfolio Preview',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    handle: '@yourhandle',
    site: '@yourhandle',
    cardType: 'summary_large_image',
  },
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
  ],
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'theme-color',
      content: '#000000',
    },
    {
      httpEquiv: 'x-ua-compatible',
      content: 'IE=edge',
    },
  ],
};

// Generate SEO config for project pages
export const generateProjectSEO = (project: {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  id: string;
}): NextSeoProps => {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://localhost:3000';
  const projectUrl = `${baseUrl}/projects/${project.id}`;
  
  return {
    title: `${project.title} - Portfolio Project`,
    description: 
      project.description || 
      `Explore ${project.title}, a project showcasing modern web development techniques and best practices.`,
    canonical: projectUrl,
    openGraph: {
      type: 'article',
      url: projectUrl,
      title: `${project.title} - Portfolio Project`,
      description: 
        project.description || 
        `Explore ${project.title}, a project showcasing modern web development techniques and best practices.`,
      images: project.imageUrl
        ? [
            {
              url: project.imageUrl,
              width: 1200,
              height: 630,
              alt: project.title,
              type: 'image/jpeg',
            },
          ]
        : defaultSEO.openGraph?.images || [],
      article: {
        publishedTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        tags: ['portfolio', 'web development', 'project'],
      },
    },
    additionalMetaTags: [
      {
        property: 'project:title',
        content: project.title,
      },
      {
        name: 'keywords',
        content: `${project.title}, portfolio, web development, full stack, react, nextjs`,
      },
    ],
  };
};

// Generate SEO config for blog pages (for future use)
export const generateBlogSEO = (post: {
  title: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  slug: string;
  publishedAt?: Date;
  tags?: string[];
}): NextSeoProps => {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://localhost:3000';
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  
  return {
    title: `${post.title} - Blog`,
    description: 
      post.excerpt || 
      `Read ${post.title} on my blog covering web development, technology insights, and programming tutorials.`,
    canonical: postUrl,
    openGraph: {
      type: 'article',
      url: postUrl,
      title: `${post.title} - Blog`,
      description: 
        post.excerpt || 
        `Read ${post.title} on my blog covering web development, technology insights, and programming tutorials.`,
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              width: 1200,
              height: 630,
              alt: post.title,
              type: 'image/jpeg',
            },
          ]
        : defaultSEO.openGraph?.images || [],
      article: {
        publishedTime: post.publishedAt?.toISOString() || new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        tags: post.tags || ['blog', 'web development'],
      },
    },
    additionalMetaTags: [
      {
        name: 'keywords',
        content: post.tags?.join(', ') || 'blog, web development, programming',
      },
      {
        property: 'article:author',
        content: 'Your Name',
      },
    ],
  };
};

// Generate structured data for projects
export const generateProjectStructuredData = (project: {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  id: string;
  createdAt?: Date;
  metadata?: string | null;
}) => {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://localhost:3000';
  let parsedMetadata;
  
  try {
    parsedMetadata = project.metadata ? JSON.parse(project.metadata) : null;
  } catch {
    parsedMetadata = null;
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description || `Portfolio project: ${project.title}`,
    url: `${baseUrl}/projects/${project.id}`,
    image: project.imageUrl || `${baseUrl}/images/og-image.jpg`,
    dateCreated: project.createdAt?.toISOString() || new Date().toISOString(),
    creator: {
      '@type': 'Person',
      name: 'Your Name',
      url: baseUrl,
    },
    keywords: parsedMetadata?.tags?.join(', ') || 'web development, portfolio',
    genre: 'Web Development',
    ...(parsedMetadata?.demoUrl && {
      url: parsedMetadata.demoUrl,
    }),
    ...(parsedMetadata?.repositoryUrl && {
      codeRepository: parsedMetadata.repositoryUrl,
    }),
  };
};

// Generate structured data for the main site
export const generateSiteStructuredData = () => {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://localhost:3000';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Your Name',
    jobTitle: 'Full Stack Developer',
    url: baseUrl,
    image: `${baseUrl}/images/profile.jpg`,
    sameAs: [
      'https://linkedin.com/in/yourprofile',
      'https://github.com/yourusername',
      'https://twitter.com/yourhandle',
    ],
    knowsAbout: [
      'JavaScript',
      'TypeScript',
      'React',
      'Next.js',
      'Node.js',
      'AWS',
      'Full Stack Development',
    ],
    description: 'Full stack developer specializing in modern web technologies',
  };
};

// Meta tag helpers
export const generateMetaTags = (seo: NextSeoProps) => {
  const tags = [];
  
  // Basic meta tags
  if (seo.title) {
    tags.push({ name: 'title', content: seo.title });
  }
  
  if (seo.description) {
    tags.push({ name: 'description', content: seo.description });
  }
  
  // Open Graph tags
  if (seo.openGraph) {
    const og = seo.openGraph;
    if (og.title) tags.push({ property: 'og:title', content: og.title });
    if (og.description) tags.push({ property: 'og:description', content: og.description });
    if (og.url) tags.push({ property: 'og:url', content: og.url });
    if (og.type) tags.push({ property: 'og:type', content: og.type });
    if (og.siteName) tags.push({ property: 'og:site_name', content: og.siteName });
    if (og.locale) tags.push({ property: 'og:locale', content: og.locale });
    
    if (og.images && og.images.length > 0) {
      const image = og.images[0];
      tags.push({ property: 'og:image', content: image.url });
      if (image.width) tags.push({ property: 'og:image:width', content: image.width.toString() });
      if (image.height) tags.push({ property: 'og:image:height', content: image.height.toString() });
      if (image.alt) tags.push({ property: 'og:image:alt', content: image.alt });
    }
  }
  
  // Twitter tags
  if (seo.twitter) {
    const twitter = seo.twitter;
    if (twitter.cardType) tags.push({ name: 'twitter:card', content: twitter.cardType });
    if (twitter.site) tags.push({ name: 'twitter:site', content: twitter.site });
    if (twitter.handle) tags.push({ name: 'twitter:creator', content: twitter.handle });
  }
  
  return tags;
};

// Canonical URL helper
export const getCanonicalUrl = (path: string = '') => {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://localhost:3000';
  return `${baseUrl}${path}`;
};