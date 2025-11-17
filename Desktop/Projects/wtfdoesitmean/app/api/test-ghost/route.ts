import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/ghost';

// Test endpoint to check Ghost API connection
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.GHOST_URL || 'NOT SET';
    const key = process.env.GHOST_CONTENT_API_KEY ? 'SET (hidden)' : 'NOT SET';
    
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

