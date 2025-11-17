import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/lib/ghost';

// Disable caching for this route so new posts show up immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '15', 10);

  console.log('[API Route] GET /api/posts called with page:', page, 'limit:', limit);

  try {
    const result = await getPosts(page, limit);
    
    console.log('[API Route] getPosts returned:', {
      hasPosts: !!result.posts,
      postsLength: result.posts?.length || 0,
      hasMeta: !!result.meta,
      total: result.meta?.pagination?.total || 0,
      resultKeys: Object.keys(result),
    });
    
    // Ensure posts array always exists
    if (!result.posts || !Array.isArray(result.posts)) {
      console.error('[API Route] ERROR: result.posts is missing or not an array!', {
        hasPosts: !!result.posts,
        postsType: typeof result.posts,
        result: JSON.stringify(result, null, 2),
      });
      // Force posts to be an array
      result.posts = [];
    }
    
    if (result.posts.length === 0) {
      console.warn('[API Route] WARNING: Empty posts array!', JSON.stringify(result, null, 2));
    }
    
    // Ensure the response always has the correct structure
    const responseData = {
      posts: Array.isArray(result.posts) ? result.posts : [],
      meta: result.meta || {
        pagination: {
          page,
          limit,
          pages: 1,
          total: 0,
          next: null,
          prev: null,
        },
      },
    };
    
    console.log('[API Route] Final response data:', {
      postsCount: responseData.posts.length,
      total: responseData.meta.pagination.total,
    });
    
    const response = NextResponse.json(responseData);
    
    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('[API Route] Returning response with', result.posts?.length || 0, 'posts');
    return response;
  } catch (error) {
    console.error('[API Route] Error in posts API route:', error);
    if (error instanceof Error) {
      console.error('[API Route] Error message:', error.message);
      console.error('[API Route] Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

