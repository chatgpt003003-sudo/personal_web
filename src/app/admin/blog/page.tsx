'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { estimateReadingTime, extractExcerpt } from '@/lib/markdown';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
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

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog');
      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlogPost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlogPosts(blogPosts.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };

  const filteredPosts = blogPosts.filter(post => {
    if (filter === 'published') return post.published;
    if (filter === 'draft') return !post.published;
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading blog posts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-gray-400 mt-2">Manage your blog content</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
        >
          New Blog Post
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
        {['all', 'published', 'draft'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab as 'all' | 'published' | 'draft')}
            className={`px-4 py-2 rounded text-sm capitalize transition-colors ${
              filter === tab
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab} (
            {tab === 'all'
              ? blogPosts.length
              : tab === 'published'
                ? blogPosts.filter(p => p.published).length
                : blogPosts.filter(p => !p.published).length}
            )
          </button>
        ))}
      </div>

      {/* Blog Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            {filter === 'all'
              ? 'No blog posts found.'
              : `No ${filter} blog posts found.`}
          </p>
          <Link
            href="/admin/blog/new"
            className="text-red-400 hover:text-red-300 mt-2 inline-block"
          >
            Create your first blog post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden hover:border-red-500/50 transition-colors"
            >
              {/* Featured Image */}
              <div className="aspect-video bg-gray-800 relative">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 text-gray-600 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                      <p className="text-sm text-gray-500">No Image</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Status and Meta */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      post.published
                        ? 'bg-green-600 text-green-100'
                        : 'bg-yellow-600 text-yellow-100'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  <div className="text-xs text-gray-500">
                    {estimateReadingTime(post.content)} min read
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-xl mb-3 leading-tight">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {post.excerpt || extractExcerpt(post.content, 120)}
                </p>

                {/* Categories and Tags */}
                <div className="mb-4">
                  {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.categories.slice(0, 2).map(({ category }) => (
                        <span
                          key={category.id}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: category.color || '#4B5563',
                            color: 'white',
                          }}
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map(({ tag }) => (
                        <span
                          key={tag.id}
                          className="text-xs text-gray-400 border border-gray-600 px-2 py-1 rounded"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-500 mb-4">
                  <div>
                    Created: {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  {post.published && post.publishedAt && (
                    <div>
                      Published: {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-center py-2 px-3 rounded text-sm transition-colors"
                  >
                    Edit
                  </Link>
                  {post.published && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm transition-colors"
                    >
                      View
                    </Link>
                  )}
                  <button
                    onClick={() => deleteBlogPost(post.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}