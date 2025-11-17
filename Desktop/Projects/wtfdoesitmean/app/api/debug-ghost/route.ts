import { NextResponse } from 'next/server';
import GhostContentAPI from '@tryghost/content-api';

// Debug endpoint to see raw Ghost API response
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.GHOST_URL || '';
    const key = process.env.GHOST_CONTENT_API_KEY || '';
    
    if (!url || !key) {
      return NextResponse.json({
        error: 'Ghost API not configured',
        url: url || 'NOT SET',
        key: key ? 'SET' : 'NOT SET',
      });
    }

    const api = new GhostContentAPI({
      url,
      key,
      version: 'v5.0',
    });

    console.log('[Debug Ghost] Calling Ghost API directly...');
    const result = await api.posts.browse({
      limit: 5,
      page: 1,
      include: ['tags'],
      fields: ['id', 'title', 'slug', 'html', 'excerpt', 'published_at', 'updated_at'],
    });

    console.log('[Debug Ghost] Raw result type:', typeof result);
    console.log('[Debug Ghost] Is array:', Array.isArray(result));
    console.log('[Debug Ghost] Keys:', Object.keys(result || {}));
    console.log('[Debug Ghost] Has posts:', !!(result as any)?.posts);
    console.log('[Debug Ghost] Posts type:', typeof (result as any)?.posts);
    console.log('[Debug Ghost] Posts is array:', Array.isArray((result as any)?.posts));
    console.log('[Debug Ghost] Posts length:', Array.isArray((result as any)?.posts) ? (result as any).posts.length : 'N/A');
    console.log('[Debug Ghost] Has meta:', !!(result as any)?.meta);

    // Try to serialize the result
    let serialized: any;
    try {
      serialized = JSON.parse(JSON.stringify(result));
    } catch (e) {
      serialized = { error: 'Could not serialize result', message: e instanceof Error ? e.message : 'Unknown' };
    }

    return NextResponse.json({
      success: true,
      resultType: typeof result,
      isArray: Array.isArray(result),
      keys: Object.keys(result || {}),
      hasPosts: !!(result as any)?.posts,
      postsType: typeof (result as any)?.posts,
      postsIsArray: Array.isArray((result as any)?.posts),
      postsLength: Array.isArray((result as any)?.posts) ? (result as any).posts.length : null,
      hasMeta: !!(result as any)?.meta,
      serializedResult: serialized,
      rawResultSample: JSON.stringify(result).substring(0, 1000),
    });
  } catch (error) {
    console.error('[Debug Ghost] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

