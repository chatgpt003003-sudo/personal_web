import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { estimateReadingTime, generateTableOfContents } from '@/lib/markdown';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string;
  author: {
    id: string;
    email: string;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
      color: string | null;
      description: string | null;
    };
  }>;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface BlogResponse {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

async function getBlogPost(slug: string): Promise<BlogResponse | null> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blog/${slug}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blogData = await getBlogPost(slug);

  if (!blogData) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  const { post } = blogData;
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} - Blog`,
    description:
      post.excerpt ||
      `Read ${post.title} on my blog covering web development, technology insights, and programming tutorials.`,
    openGraph: {
      type: 'article',
      url: postUrl,
      title: `${post.title} - Blog`,
      description:
        post.excerpt ||
        `Read ${post.title} on my blog covering web development, technology insights, and programming tutorials.`,
      publishedTime: post.publishedAt,
      authors: ['Your Name'],
      tags: post.tags.map(t => t.tag.name),
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} - Blog`,
      description: post.excerpt || `Read ${post.title} on my blog.`,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    keywords: post.tags.map(t => t.tag.name).join(', '),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blogData = await getBlogPost(slug);

  if (!blogData) {
    notFound();
  }

  const { post, relatedPosts } = blogData;
  const readingTime = estimateReadingTime(post.content);
  const tableOfContents = generateTableOfContents(post.content);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li className="text-gray-600">/</li>
              <li>
                <Link href="/blog" className="hover:text-white">
                  Blog
                </Link>
              </li>
              <li className="text-gray-600">/</li>
              <li className="text-white">{post.title}</li>
            </ol>
          </nav>

          {/* Categories */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map(({ category }) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.slug}`}
                  className="text-sm px-3 py-1 rounded-full hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: category.color || '#DC2626',
                    color: 'white',
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{readingTime} min read</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>By {post.author.email}</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-800">
              <Image
                src={post.featuredImage}
                alt={post.title}
                width={1200}
                height={630}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Table of Contents (Desktop) */}
          {tableOfContents.length > 0 && (
            <aside className="lg:col-span-3 hidden lg:block">
              <div className="sticky top-8">
                <h3 className="text-lg font-semibold mb-4 text-white">
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {tableOfContents.map(heading => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className="block text-sm text-gray-400 hover:text-white transition-colors"
                      style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                    >
                      {heading.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main
            className={
              tableOfContents.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12'
            }
          >
            {/* Excerpt */}
            {post.excerpt && (
              <div className="text-xl text-gray-300 mb-8 p-6 bg-gray-900/50 rounded-lg border-l-4 border-red-500">
                {post.excerpt}
              </div>
            )}

            {/* Content */}
            <article className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children, ...props }) => (
                    <h1
                      className="text-3xl font-bold mb-6 text-white"
                      {...props}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2
                      className="text-2xl font-bold mb-4 mt-8 text-white"
                      {...props}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3
                      className="text-xl font-bold mb-3 mt-6 text-white"
                      {...props}
                    >
                      {children}
                    </h3>
                  ),
                  p: ({ children, ...props }) => (
                    <p
                      className="mb-4 text-gray-300 leading-relaxed"
                      {...props}
                    >
                      {children}
                    </p>
                  ),
                  a: ({ children, href, ...props }) => (
                    <a
                      href={href}
                      className="text-red-400 hover:text-red-300 underline"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={
                        href?.startsWith('http')
                          ? 'noopener noreferrer'
                          : undefined
                      }
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  code: ({ children, className, ...props }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code
                        className="bg-gray-800 px-1 py-0.5 rounded text-sm text-red-300"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children, ...props }) => (
                    <pre
                      className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6"
                      {...props}
                    >
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote
                      className="border-l-4 border-red-500 pl-4 italic text-gray-300 mb-6"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul
                      className="list-disc list-inside mb-4 space-y-1"
                      {...props}
                    >
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol
                      className="list-decimal list-inside mb-4 space-y-1"
                      {...props}
                    >
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li className="text-gray-300" {...props}>
                      {children}
                    </li>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </article>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(({ tag }) => (
                    <Link
                      key={tag.id}
                      href={`/blog?tag=${tag.slug}`}
                      className="text-sm px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 hover:border-red-500 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-16 pt-8 border-t border-gray-800">
                <h3 className="text-2xl font-bold mb-8">Related Posts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map(relatedPost => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="block bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500/50 transition-all"
                    >
                      {relatedPost.featuredImage && (
                        <div className="aspect-video bg-gray-800">
                          <Image
                            src={relatedPost.featuredImage}
                            alt={relatedPost.title}
                            width={400}
                            height={225}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {new Date(
                            relatedPost.publishedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
