'use client';

import { Post } from '@/lib/ghost';
import { formatDate } from '@/lib/posts';

// Remove sign up, login, subscribe buttons and forms from post content
function cleanPostHtml(html: string): string {
  if (!html) return '';
  
  // Remove sign up/login/subscribe buttons and forms
  // Using [\s\S] instead of . to match newlines (works without 's' flag)
  let cleaned = html
    .replace(/<a[^>]*class="[^"]*sign[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<a[^>]*class="[^"]*login[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<a[^>]*class="[^"]*subscribe[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<a[^>]*class="[^"]*register[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<form[^>]*class="[^"]*sign[^"]*"[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/<form[^>]*class="[^"]*login[^"]*"[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/<form[^>]*class="[^"]*subscribe[^"]*"[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/<button[^>]*class="[^"]*sign[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '')
    .replace(/<button[^>]*class="[^"]*login[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '')
    .replace(/<button[^>]*class="[^"]*subscribe[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '')
    .replace(/<div[^>]*class="[^"]*sign[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*login[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*subscribe[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/href="[^"]*\/signup[^"]*"/gi, '')
    .replace(/href="[^"]*\/login[^"]*"/gi, '')
    .replace(/href="[^"]*\/subscribe[^"]*"/gi, '')
    .replace(/href="[^"]*\/register[^"]*"/gi, '');
  
  return cleaned;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article
      id={`post-${post.id}`}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-[#E5E5E5]/10"
    >
      <header className="mb-6">
        <h2 className="font-westend text-3xl sm:text-4xl md:text-5xl text-[#E5E5E5] mb-4 leading-tight">
          {post.title}
        </h2>
        <div className="flex items-center gap-4 text-sm text-[#E5E5E5]/60">
          <time dateTime={post.published_at}>
            {formatDate(post.published_at)}
          </time>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag.slug}
                  className="px-2 py-1 bg-[#E5E5E5]/10 rounded text-xs"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>
      
      {post.excerpt && (
        <p className="text-lg text-[#E5E5E5]/80 mb-6 italic">
          {post.excerpt}
        </p>
      )}
      
      <div
        className="prose prose-invert prose-lg max-w-none text-[#E5E5E5]"
        dangerouslySetInnerHTML={{ __html: cleanPostHtml(post.html) }}
        style={{
          color: '#E5E5E5',
        }}
      />
    </article>
  );
}

