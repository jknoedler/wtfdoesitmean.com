'use client';

import { useState, useRef, useEffect } from 'react';
import { Post } from '@/lib/ghost';

interface SearchBarProps {
  posts: Post[];
  onSearch: (filteredPosts: Post[]) => void;
}

export default function SearchBar({ posts, onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      onSearch(posts);
      setIsOpen(false);
      return;
    }

    const filtered = posts.filter((post) => {
      const searchLower = query.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(searchLower);
      const excerptMatch = post.excerpt?.toLowerCase().includes(searchLower);
      const tagMatch = post.tags?.some((tag) =>
        tag.name.toLowerCase().includes(searchLower)
      );
      const contentMatch = post.html.toLowerCase().includes(searchLower);

      return titleMatch || excerptMatch || tagMatch || contentMatch;
    });

    onSearch(filtered);
    setIsOpen(filtered.length > 0 && query.length > 0);
  };

  const handlePostClick = (post: Post) => {
    const postId = `post-${post.id}`;
    const element = document.getElementById(postId);
    
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredResults = posts.filter((post) => {
    if (!searchQuery.trim()) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt?.toLowerCase().includes(searchLower) ||
      post.tags?.some((tag) => tag.name.toLowerCase().includes(searchLower))
    );
  }).slice(0, 5);

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(searchQuery.length > 0 && filteredResults.length > 0)}
          placeholder="Search..."
          className="px-4 py-2 bg-[#E5E5E5]/10 border border-[#E5E5E5]/20 rounded text-[#E5E5E5] placeholder:text-[#E5E5E5]/50 focus:outline-none focus:border-[#E5E5E5]/40 transition-colors w-48 sm:w-64"
        />
      </div>
      
      {isOpen && filteredResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-[#E5E5E5]/20 rounded shadow-lg max-h-96 overflow-y-auto z-50">
          {filteredResults.map((post) => (
            <button
              key={post.id}
              onClick={() => handlePostClick(post)}
              className="w-full px-4 py-3 text-left hover:bg-[#E5E5E5]/10 border-b border-[#E5E5E5]/10 last:border-b-0 transition-colors"
            >
              <div className="text-[#E5E5E5] font-medium">{post.title}</div>
              {post.excerpt && (
                <div className="text-[#E5E5E5]/70 text-sm mt-1 line-clamp-2">
                  {post.excerpt}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

