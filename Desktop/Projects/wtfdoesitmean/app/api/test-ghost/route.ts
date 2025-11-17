import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/ghost';
import GhostContentAPI from '@tryghost/content-api';

// Test endpoint to check Ghost API connection
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.GHOST_URL || 'NOT SET';
    const key = process.env.GHOST_CONTENT_API_KEY ? 'SET (hidden)' : 'NOT SET';
    
    // Direct Ghost API test
    let directResult: any = null;
    let directError: string | null = null;
    
    if (url !== 'NOT SET' && key !== 'NOT SET' && key !== 'SET (hidden)') {
      try {
        const api = new GhostContentAPI({
          url,
          key: process.env.GHOST_CONTENT_API_KEY!,
          version: 'v5.0',
        });
        
        const rawResult = await api.posts.browse({
          limit: 5,
          page: 1,
          include: ['tags'],
          fields: ['id', 'title', 'slug', 'html', 'excerpt', 'published_at', 'updated_at'],
        });
        
        directResult = {
          type: typeof rawResult,
          isArray: Array.isArray(rawResult),
          keys: Object.keys(rawResult || {}),
          hasPosts: !!(rawResult as any)?.posts,
          postsType: typeof (rawResult as any)?.posts,
          postsIsArray: Array.isArray((rawResult as any)?.posts),
          postsLength: Array.isArray((rawResult as any)?.posts) ? (rawResult as any).posts.length : null,
          hasMeta: !!(rawResult as any)?.meta,
          sample: JSON.stringify(rawResult).substring(0, 500),
        };
      } catch (e) {
        directError = e instanceof Error ? e.message : 'Unknown error';
      }
    }
    
    // Test via getPosts
    let result;
    let errorMessage = null;
    
    try {
      result = await getPosts(1, 5);
    } catch (fetchError) {
      errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
      result = { posts: [], meta: { pagination: { page: 1, limit: 5, pages: 0, total: 0, next: null, prev: null } } };
    }
    
    return NextResponse.json({
      success: !errorMessage,
      error: errorMessage,
      ghostUrl: url,
      ghostKey: key,
      directGhostTest: directResult,
      directGhostError: directError,
      postsCount: result?.posts?.length || 0,
      totalPosts: result?.meta?.pagination?.total || 0,
      posts: result?.posts?.map(p => ({ id: p.id, title: p.title, slug: p.slug })) || [],
      meta: result?.meta || null,
    });
  } catch (error) {
    console.error('[Test Ghost API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      ghostUrl: process.env.GHOST_URL || 'NOT SET',
      ghostKey: process.env.GHOST_CONTENT_API_KEY ? 'SET (hidden)' : 'NOT SET',
    }, { status: 500 });
  }
}

