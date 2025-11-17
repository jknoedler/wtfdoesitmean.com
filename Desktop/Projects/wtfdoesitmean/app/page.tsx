'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import ScrollToTop from '@/components/ScrollToTop';
import { Post } from '@/lib/ghost';

function addStructuredData(posts: Post[]) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'WTF Does It Mean?',
    description: 'Answers to your questions. SEO-optimized articles covering everything you need to know.',
    url: 'https://wtfdoesitmean.com',
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || post.meta_description || '',
      datePublished: post.published_at,
      dateModified: post.updated_at,
      author: {
        '@type': 'Organization',
        name: 'WTF Does It Mean?',
      },
      publisher: {
        '@type': 'Organization',
        name: 'WTF Does It Mean?',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://wtfdoesitmean.com/${post.slug}`,
      },
    })),
  };

  return structuredData;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (pageNum: number) => {
    try {
      setIsLoadingMore(true);
      const response = await fetch(`/api/posts?page=${pageNum}&limit=15`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      
      console.log('[Frontend] Fetched posts:', {
        postsCount: data.posts?.length || 0,
        total: data.meta?.pagination?.total || 0,
        posts: data.posts,
      });
      
      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts]);
        setFilteredPosts((prev) => [...prev, ...data.posts]);
        setHasMore(data.meta.pagination.next !== null);
        setPage(pageNum);
      } else {
        console.log('[Frontend] No posts in response or empty array');
        setHasMore(false);
      }
    } catch (error) {
      console.error('[Frontend] Error fetching posts:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          fetchPosts(page + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, page, fetchPosts]);

  useEffect(() => {
    if (typeof window !== 'undefined' && posts.length > 0) {
      const structuredData = addStructuredData(posts);
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      script.id = 'structured-data';
      
      // Remove existing structured data script if present
      const existing = document.getElementById('structured-data');
      if (existing) {
        existing.remove();
      }
      
      document.head.appendChild(script);
      
      return () => {
        const scriptToRemove = document.getElementById('structured-data');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [posts]);

  const handleSearch = (filtered: Post[]) => {
    setFilteredPosts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-[#E5E5E5] flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      <Header posts={posts} onSearch={handleSearch} />
      <main className="pt-8 pb-24 relative z-10">
        {filteredPosts.length === 0 ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <p className="text-[#E5E5E5]/60 text-lg">No posts found.</p>
          </div>
        ) : (
          <>
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {hasMore && (
              <div ref={observerTarget} className="h-20 flex items-center justify-center">
                {isLoadingMore && (
                  <div className="text-[#E5E5E5]/60">Loading more posts...</div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <ScrollToTop />
    </div>
  );
}
