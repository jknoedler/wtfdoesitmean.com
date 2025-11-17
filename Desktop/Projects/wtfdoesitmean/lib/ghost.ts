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
    console.log('[Ghost API] No API instance, using mock data');
    const mockPosts = getMockPosts();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = mockPosts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(mockPosts.length / limit);
    
    const result = {
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
    console.log('[Ghost API] Returning mock data:', { postsCount: result.posts.length, total: result.meta.pagination.total });
    return result;
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

    // Log the full result structure (but limit size to avoid huge logs)
    console.log('[Ghost API] Raw result structure:', {
      resultKeys: Object.keys(result || {}),
      resultType: typeof result,
      isArray: Array.isArray(result),
      hasPosts: !!(result as any)?.posts,
      postsType: typeof (result as any)?.posts,
      postsIsArray: Array.isArray((result as any)?.posts),
      postsLength: Array.isArray((result as any)?.posts) ? (result as any).posts.length : 'N/A',
      hasMeta: !!(result as any)?.meta,
      sampleKeys: Object.keys(result || {}).slice(0, 10),
    });

    // Try to stringify a sample to see structure (limit size)
    try {
      const sample = JSON.stringify(result).substring(0, 500);
      console.log('[Ghost API] Result sample (first 500 chars):', sample);
    } catch (e) {
      console.log('[Ghost API] Could not stringify result sample');
    }

    // Type assertion to bypass TypeScript warnings - we know the structure is correct
    const typedResult = result as any;

    let posts: Post[] = [];
    let meta: any = {};

    // Check if we have a proper posts response
    if (typedResult.posts && Array.isArray(typedResult.posts)) {
      console.log('[Ghost API] Standard response structure found with', typedResult.posts.length, 'posts');
      posts = typedResult.posts;
      meta = typedResult.meta;
    }
    // Handle the array-like response we saw in logs (numbered properties)
    else if (typedResult['0']) {
      console.log('[Ghost API] Numbered response structure found, collecting posts...');
      // Collect all numbered properties as posts
      const keys = Object.keys(typedResult).filter(key => /^\d+$/.test(key)).sort((a, b) => parseInt(a) - parseInt(b));
      posts = keys.map(key => typedResult[key] as Post);
      meta = typedResult.meta || {};
      console.log('[Ghost API] Found', posts.length, 'posts from numbered properties');
    }
    // Check if result itself is an array
    else if (Array.isArray(typedResult)) {
      console.log('[Ghost API] Result is an array with', typedResult.length, 'items');
      posts = typedResult as Post[];
      meta = { pagination: { page, limit, pages: 1, total: typedResult.length, next: null, prev: null } };
    }
    // Check if result has a different structure
    else {
      console.error('[Ghost API] Unexpected response structure. Full keys:', Object.keys(typedResult));
      console.error('[Ghost API] Result value:', JSON.stringify(typedResult).substring(0, 1000));
    }

    // Always return posts array, even if empty
    const returnValue = {
      posts: (posts.length > 0 ? posts : []) as Post[],
      meta: {
        pagination: {
          page: meta?.pagination?.page || page,
          limit: meta?.pagination?.limit || limit,
          pages: meta?.pagination?.pages || 1,
          total: meta?.pagination?.total || posts.length,
          next: meta?.pagination?.next || null,
          prev: meta?.pagination?.prev || null,
        },
      },
    };

    if (posts.length > 0) {
      console.log('[Ghost API] Successfully fetched', posts.length, 'posts. Total:', returnValue.meta.pagination.total);
    } else {
      console.warn('[Ghost API] WARNING: No posts extracted from response!');
      console.warn('[Ghost API] Result keys:', Object.keys(typedResult || {}));
      console.warn('[Ghost API] Result type:', typeof typedResult);
      console.warn('[Ghost API] Result is array:', Array.isArray(typedResult));
      console.warn('[Ghost API] Returning empty posts array with meta:', returnValue.meta);
    }

    console.log('[Ghost API] Returning:', { postsCount: returnValue.posts.length, total: returnValue.meta.pagination.total });
    return returnValue;
  } catch (error) {
    console.error('[Ghost API] Error fetching posts:', error);
    if (error instanceof Error) {
      console.error('[Ghost API] Error message:', error.message);
      console.error('[Ghost API] Error stack:', error.stack);
    }
    // Fallback to mock data on error
    console.log('[Ghost API] Falling back to mock data due to error');
    const mockPosts = getMockPosts();
    const fallbackResult = {
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
    console.log('[Ghost API] Returning fallback mock data:', { postsCount: fallbackResult.posts.length });
    return fallbackResult;
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

      // Handle different response structures (same as getPosts)
      const typedResult = result as any;
      let posts: Post[] = [];

      if (typedResult.posts && Array.isArray(typedResult.posts)) {
        posts = typedResult.posts;
      } else if (typedResult['0']) {
        // Handle numbered properties
        const keys = Object.keys(typedResult).filter(key => /^\d+$/.test(key)).sort((a, b) => parseInt(a) - parseInt(b));
        posts = keys.map(key => typedResult[key] as Post);
      } else if (Array.isArray(typedResult)) {
        posts = typedResult as Post[];
      }

      if (posts.length > 0) {
        allPosts.push(...posts);
      }

      if (typedResult.meta?.pagination?.next) {
        page = typedResult.meta.pagination.next;
      } else {
        hasMore = false;
      }
    }

    return allPosts.length > 0 ? allPosts : getMockPosts();
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
