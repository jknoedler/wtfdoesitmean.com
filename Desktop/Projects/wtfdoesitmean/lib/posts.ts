import { Post } from './ghost';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getPostKeywords(post: Post): string[] {
  const keywords: string[] = [];
  
  if (post.title) {
    keywords.push(...post.title.toLowerCase().split(/\s+/));
  }
  
  if (post.tags) {
    keywords.push(...post.tags.map(tag => tag.name.toLowerCase()));
  }
  
  return [...new Set(keywords)];
}

export function extractExcerpt(html: string, maxLength: number = 150): string {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '');
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
}

