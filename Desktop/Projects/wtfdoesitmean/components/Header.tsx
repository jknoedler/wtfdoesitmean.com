'use client';

import { Post } from '@/lib/ghost';
import RandomPost from './RandomPost';
import SearchBar from './SearchBar';

interface HeaderProps {
  posts: Post[];
  onSearch: (filteredPosts: Post[]) => void;
}

export default function Header({ posts, onSearch }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-sm border-b border-gray-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="font-hardcore text-4xl sm:text-5xl md:text-6xl text-[#E5E5E5] text-center sm:text-left">
            wtf does it mean?
          </h1>
          <div className="flex items-center gap-3">
            <SearchBar posts={posts} onSearch={onSearch} />
            <RandomPost posts={posts} />
          </div>
        </div>
      </div>
    </header>
  );
}

