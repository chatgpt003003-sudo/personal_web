import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import matter from 'gray-matter';

// Markdown processing utilities for blog posts
export interface ProcessedMarkdown {
  content: string;
  data: {
    title?: string;
    excerpt?: string;
    tags?: string[];
    featuredImage?: string;
    publishedAt?: string;
    [key: string]: unknown;
  };
}

export async function processMarkdown(
  markdown: string
): Promise<ProcessedMarkdown> {
  // Parse frontmatter
  const matterResult = matter(markdown);

  // Process markdown to HTML
  const processedContent = await remark()
    .use(remarkGfm) // GitHub Flavored Markdown
    .use(remarkHtml, { sanitize: false }) // Allow HTML (be careful with user input)
    .process(matterResult.content);

  return {
    content: processedContent.toString(),
    data: matterResult.data,
  };
}

export function extractExcerpt(content: string, length: number = 200): string {
  // Remove HTML tags and markdown syntax for excerpt
  const cleanText = content
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/>\s/g, '') // Remove blockquotes
    .replace(/[-*+]\s/g, '') // Remove list markers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  if (cleanText.length <= length) {
    return cleanText;
  }

  // Find the last complete sentence within the length limit
  const truncated = cleanText.substring(0, length);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );

  if (lastSentenceEnd > length * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1).trim();
  }

  // If no sentence end found, find the last word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > length * 0.6
    ? truncated.substring(0, lastSpace).trim() + '...'
    : truncated.trim() + '...';
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .trim();
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  return Math.ceil(words / wordsPerMinute);
}

export function generateTableOfContents(content: string): Array<{
  id: string;
  title: string;
  level: number;
}> {
  const headings: Array<{ id: string; title: string; level: number }> = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = generateSlug(title);

    headings.push({ id, title, level });
  }

  return headings;
}

export function addHeadingIds(content: string): string {
  return content.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
    const id = generateSlug(title.trim());
    return `${hashes} ${title.trim()} {#${id}}`;
  });
}

export function validateMarkdown(content: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for common markdown issues

  // Unmatched code blocks
  const codeBlockMatches = content.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    errors.push('Unmatched code block delimiters (```)');
  }

  // Unmatched bold/italic
  const boldMatches = content.match(/\*\*/g);
  if (boldMatches && boldMatches.length % 2 !== 0) {
    warnings.push('Unmatched bold markers (**)');
  }

  const italicMatches = content.match(/(?<!\*)\*(?!\*)/g);
  if (italicMatches && italicMatches.length % 2 !== 0) {
    warnings.push('Unmatched italic markers (*)');
  }

  // Check for malformed links
  const linkPattern = /\[([^\]]*)\]\(([^)]*)\)/g;
  let linkMatch;
  while ((linkMatch = linkPattern.exec(content)) !== null) {
    if (!linkMatch[2] || linkMatch[2].trim().length === 0) {
      warnings.push(`Empty link URL for text: "${linkMatch[1]}"`);
    }
  }

  // Check for malformed images
  const imagePattern = /!\[([^\]]*)\]\(([^)]*)\)/g;
  let imageMatch;
  while ((imageMatch = imagePattern.exec(content)) !== null) {
    if (!imageMatch[2] || imageMatch[2].trim().length === 0) {
      warnings.push(`Empty image URL for alt text: "${imageMatch[1]}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// SEO-related markdown utilities
export function extractMetaDescription(
  content: string,
  fallbackExcerpt?: string
): string {
  // Try to extract the first paragraph as meta description
  const firstParagraph = content
    .split('\n\n')[0]
    .replace(/[#*`>\-+]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (firstParagraph && firstParagraph.length > 50) {
    return extractExcerpt(firstParagraph, 160);
  }

  return fallbackExcerpt
    ? extractExcerpt(fallbackExcerpt, 160)
    : 'Read this blog post to learn more.';
}

export function extractImages(
  content: string
): Array<{ url: string; alt: string }> {
  const images: Array<{ url: string; alt: string }> = [];
  const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = imagePattern.exec(content)) !== null) {
    images.push({
      alt: match[1] || '',
      url: match[2],
    });
  }

  return images;
}
