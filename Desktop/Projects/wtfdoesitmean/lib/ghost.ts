import GhostContentAPI from '@tryghost/content-api';

// Create API instance lazily to avoid validation errors during build
let api: GhostContentAPI | null = null;

function getApi(): GhostContentAPI | null {
  const url = process.env.GHOST_URL || '';
  const key = process.env.GHOST_CONTENT_API_KEY || '';
  
  // Only create API if we have valid credentials
  if (!url || !key || url === 'https://your-ghost-instance.com' || key === 'paste-your-api-key-here') {
    console.log('[Ghost API] Not configured - missing URL or key');
    return null;
  }
  
  if (!api) {
    try {
      console.log('[Ghost API] Initializing with URL:', url);
      api = new GhostContentAPI({
        url,
        key,
        version: 'v5.0',
      });
    } catch (error) {
      console.error('[Ghost API] Failed to initialize:', error);
      return null;
    }
  }
  
  return api;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  html: string;
  excerpt?: string;
  published_at: string;
  updated_at: string;
  tags?: Array<{ name: string; slug: string }>;
  meta_title?: string;
  meta_description?: string;
}

// Mock data for development when Ghost is not configured
function getMockPosts(): Post[] {
  return [
    {
      id: '1',
      title: 'What Does SEO Mean?',
      slug: 'what-does-seo-mean',
      html: '<p>SEO stands for Search Engine Optimization. It\'s the practice of optimizing your website to rank higher in search engine results pages (SERPs).</p><p>Key factors include keyword research, quality content, backlinks, and technical optimization.</p>',
      excerpt: 'SEO stands for Search Engine Optimization. Learn how it works and why it matters for your website.',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [{ name: 'SEO', slug: 'seo' }, { name: 'Marketing', slug: 'marketing' }],
      meta_title: 'What Does SEO Mean?',
      meta_description: 'Learn what SEO means and how it can help your website rank higher in search results.',
    },
    {
      id: '2',
      title: 'What Is a Digital Ocean Droplet?',
      slug: 'what-is-digital-ocean-droplet',
      html: '<p>A Digital Ocean Droplet is a virtual private server (VPS) that runs on Digital Ocean\'s cloud infrastructure.</p><p>Droplets are scalable, easy to deploy, and perfect for hosting websites, applications, and databases.</p>',
      excerpt: 'A Digital Ocean Droplet is a virtual private server perfect for hosting your applications and websites.',
      published_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      tags: [{ name: 'Hosting', slug: 'hosting' }, { name: 'Cloud', slug: 'cloud' }],
      meta_title: 'What Is a Digital Ocean Droplet?',
      meta_description: 'Learn about Digital Ocean Droplets and how to use them for hosting your projects.',
    },
    {
      id: '3',
      title: 'How Does Infinite Scroll Work?',
      slug: 'how-does-infinite-scroll-work',
      html: '<p>Infinite scroll is a web design pattern that automatically loads more content as the user scrolls down the page.</p><p>It uses JavaScript to detect when the user reaches the bottom of the page, then fetches and displays more content seamlessly.</p>',
      excerpt: 'Infinite scroll automatically loads more content as you scroll, creating a seamless browsing experience.',
      published_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
      tags: [{ name: 'Web Development', slug: 'web-development' }, { name: 'UX', slug: 'ux' }],
      meta_title: 'How Does Infinite Scroll Work?',
      meta_description: 'Understand how infinite scroll works and how to implement it on your website.',
    },
  ];
}

export async function getPosts(page: number = 1, limit: number = 15): Promise<{ posts: Post[]; meta: { pagination: { page: number; limit: number; pages: number; total: number; next: number | null; prev: number | null } } }> {
  const ghostApi = getApi();
  
  // Use mock data if Ghost is not configured
  if (!ghostApi) {
    const mockPosts = getMockPosts();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = mockPosts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(mockPosts.length / limit);
    
    return {
      posts: paginatedPosts,
      meta: {
        pagination: {
          page,
          limit,
          pages: totalPages,
          total: mockPosts.length,
          next: page < totalPages ? page + 1 : null,
          prev: page > 1 ? page - 1 : null,
        },
      },
    };
  }

  try {
    if (!ghostApi) {
      throw new Error('Ghost API not configured');
    }
    console.log('[Ghost API] Fetching posts - page:', page, 'limit:', limit);
    const result = await ghostApi.posts.browse({
      limit,
      page,
      include: ['tags'],
      fields: ['id', 'title', 'slug', 'html', 'excerpt', 'published_at', 'updated_at', 'meta_title', 'meta_description'],
    });

    console.log('[Ghost API] Successfully fetched', result.posts.length, 'posts. Total:', result.meta.pagination.total);
    return {
      posts: result.posts as Post[],
      meta: {
        pagination: {
          page: result.meta.pagination.page,
          limit: result.meta.pagination.limit,
          pages: result.meta.pagination.pages,
          total: result.meta.pagination.total,
          next: result.meta.pagination.next || null,
          prev: result.meta.pagination.prev || null,
        },
      },
    };
  } catch (error) {
    console.error('[Ghost API] Error fetching posts:', error);
    if (error instanceof Error) {
      console.error('[Ghost API] Error message:', error.message);
      console.error('[Ghost API] Error stack:', error.stack);
    }
    // Fallback to mock data on error
    console.log('[Ghost API] Falling back to mock data');
    const mockPosts = getMockPosts();
    return {
      posts: mockPosts,
      meta: {
        pagination: {
          page: 1,
          limit: 15,
          pages: 1,
          total: mockPosts.length,
          next: null,
          prev: null,
        },
      },
    };
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const ghostApi = getApi();
  
  // Use mock data if Ghost is not configured
  if (!ghostApi) {
    return getMockPosts();
  }

  try {
    const allPosts: Post[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await ghostApi.posts.browse({
        limit: 15,
        page,
        include: ['tags'],
        fields: ['id', 'title', 'slug', 'html', 'excerpt', 'published_at', 'updated_at', 'meta_title', 'meta_description'],
      });

      allPosts.push(...(result.posts as Post[]));

      if (result.meta.pagination.next) {
        page = result.meta.pagination.next;
      } else {
        hasMore = false;
      }
    }

    return allPosts;
  } catch (error) {
    console.error('Error fetching all posts from Ghost:', error);
    return getMockPosts();
  }
}

export async function searchPosts(query: string): Promise<Post[]> {
  const ghostApi = getApi();
  
  // Use mock data if Ghost is not configured
  if (!ghostApi) {
    const mockPosts = getMockPosts();
    return mockPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(query.toLowerCase())
    );
  }

  try {
    const result = await ghostApi.posts.browse({
      limit: 'all',
      filter: `title:~'${query}'+tags.name:~'${query}'`,
      include: ['tags'],
      fields: ['id', 'title', 'slug', 'html', 'excerpt', 'published_at', 'updated_at', 'meta_title', 'meta_description'],
    });

    return result.posts as Post[];
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}

export default api;

