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
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain"
            />
            <h1 className="font-westend text-4xl sm:text-5xl md:text-6xl text-[#E5E5E5] text-center sm:text-left">
              wtf does it mean?
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar posts={posts} onSearch={onSearch} />
            <RandomPost posts={posts} />
          </div>
        </div>
      </div>
    </header>
  );
}

