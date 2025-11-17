import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/lib/ghost';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '15', 10);

  try {
    const result = await getPosts(page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in posts API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

