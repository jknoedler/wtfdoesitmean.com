import { NextRequest, NextResponse } from 'next/server';
import { getPosts, Post } from '@/lib/ghost';

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
    
    // Ensure the response always has the correct structure - be very explicit
    let postsArray: Post[] = [];
    
    if (Array.isArray(result.posts)) {
      postsArray = result.posts;
    } else if (result.posts) {
      postsArray = [result.posts];
    } else {
      postsArray = [];
    }
    
    // Force posts to always be an array, never undefined/null
    if (!postsArray || !Array.isArray(postsArray)) {
      console.error('[API Route] CRITICAL: postsArray is invalid!', { postsArray, type: typeof postsArray });
      postsArray = [];
    }
    
    const responseData: any = {};
    responseData.posts = postsArray; // Set explicitly
    responseData.meta = result.meta || {
      pagination: {
        page,
        limit,
        pages: 1,
        total: 0,
        next: null,
        prev: null,
      },
    };
    
    // Triple-check posts is in the response
    if (!('posts' in responseData)) {
      console.error('[API Route] CRITICAL: posts missing from responseData!', responseData);
      responseData.posts = [];
    }
    
    // Verify posts is actually an array
    if (!Array.isArray(responseData.posts)) {
      console.error('[API Route] CRITICAL: responseData.posts is not an array!', { 
        type: typeof responseData.posts, 
        value: responseData.posts 
      });
      responseData.posts = [];
    }
    
    // Add debug info if posts are missing (only in development/debugging)
    if (responseData.posts.length === 0 && result.meta?.pagination?.total > 0) {
      responseData._debug = {
        message: 'Posts array is empty but total > 0',
        resultStructure: {
          hasPosts: !!result.posts,
          postsType: typeof result.posts,
          postsIsArray: Array.isArray(result.posts),
          resultKeys: Object.keys(result),
        },
      };
    }
    
    console.log('[API Route] Final response data:', {
      postsCount: responseData.posts.length,
      total: responseData.meta.pagination.total,
      hasPostsKey: 'posts' in responseData,
      responseDataKeys: Object.keys(responseData),
    });
    
    // Serialize to verify structure before sending
    const serialized = JSON.stringify(responseData);
    console.log('[API Route] Serialized response (first 500 chars):', serialized.substring(0, 500));
    
    // Final safety check - ensure posts exists in serialized JSON
    if (!serialized.includes('"posts"')) {
      console.error('[API Route] CRITICAL: posts missing from serialized JSON!', serialized);
      // Force add posts to the object
      responseData.posts = responseData.posts || [];
    }
    
    // Create response with explicit structure
    const finalResponse = {
      posts: responseData.posts || [],
      meta: responseData.meta,
      ...(responseData._debug ? { _debug: responseData._debug } : {}),
    };
    
    console.log('[API Route] Final response object keys:', Object.keys(finalResponse));
    console.log('[API Route] Final response has posts:', 'posts' in finalResponse);
    console.log('[API Route] Final response posts length:', finalResponse.posts.length);
    
    const response = NextResponse.json(finalResponse);
    
    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('[API Route] Returning response with', responseData.posts.length, 'posts');
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

