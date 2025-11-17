'use client';

import { Post } from '@/lib/ghost';

interface RandomPostProps {
  posts?: Post[];
}

export default function RandomPost({ posts = [] }: RandomPostProps) {
  const scrollToRandomPost = () => {
    if (posts.length === 0) return;

    const randomIndex = Math.floor(Math.random() * posts.length);
    const postId = `post-${posts[randomIndex].id}`;
    const element = document.getElementById(postId);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <button
      onClick={scrollToRandomPost}
      className="px-4 py-2 bg-[#E5E5E5]/10 hover:bg-[#E5E5E5]/20 border border-[#E5E5E5]/20 rounded text-[#E5E5E5] transition-colors duration-200 text-sm font-medium"
      aria-label="Go to random post"
    >
      Random
    </button>
  );
}

