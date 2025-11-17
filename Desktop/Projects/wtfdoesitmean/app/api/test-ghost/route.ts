import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/ghost';

// Test endpoint to check Ghost API connection
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.GHOST_URL || 'NOT SET';
    const key = process.env.GHOST_CONTENT_API_KEY ? 'SET (hidden)' : 'NOT SET';
    
    const result = await getPosts(1, 5);
    
    return NextResponse.json({
      success: true,
      ghostUrl: url,
      ghostKey: key,
      postsCount: result.posts.length,
      totalPosts: result.meta.pagination.total,
      posts: result.posts.map(p => ({ id: p.id, title: p.title, slug: p.slug })),
      meta: result.meta,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      ghostUrl: process.env.GHOST_URL || 'NOT SET',
      ghostKey: process.env.GHOST_CONTENT_API_KEY ? 'SET (hidden)' : 'NOT SET',
    }, { status: 500 });
  }
}

