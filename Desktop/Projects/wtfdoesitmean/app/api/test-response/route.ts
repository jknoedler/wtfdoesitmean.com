import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/ghost';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await getPosts(1, 5);
  
  return NextResponse.json({
    test: 'Response structure test',
    hasPosts: !!result.posts,
    postsType: typeof result.posts,
    postsIsArray: Array.isArray(result.posts),
    postsLength: Array.isArray(result.posts) ? result.posts.length : 'N/A',
    hasMeta: !!result.meta,
    resultKeys: Object.keys(result),
    fullResult: result,
  });
}

