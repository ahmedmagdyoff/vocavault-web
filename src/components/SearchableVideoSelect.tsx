import React, { useState, useRef, useEffect } from 'react';
import { Video } from '@/types';
import { X, Search } from 'lucide-react';

interface SearchableVideoSelectProps {
  videos: Video[];
  value: number | null;
  onChange: (id: number | null) => void;
}

export default function SearchableVideoSelect({ videos, value, onChange }: SearchableVideoSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const selectedVideo = videos.find(v => v.id === value);

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (id: number) => {
    onChange(id);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredVideos.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredVideos[highlightedIndex]) {
        handleSelect(filteredVideos[highlightedIndex].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        {selectedVideo ? (
          <div className="flex w-full items-center justify-between rounded-md border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
            <span className="truncate text-sm text-slate-900 dark:text-white">{selectedVideo.title}</span>
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search videos..."
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </>
        )}
      </div>

      {isOpen && !selectedVideo && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {filteredVideos.length === 0 ? (
            <div className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">
              No videos found.
            </div>
          ) : (
            <ul className="py-1 text-sm">
              {filteredVideos.map((video, index) => (
                <li
                  key={video.id}
                  onClick={() => handleSelect(video.id)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`cursor-pointer px-3 py-2 ${
                    index === highlightedIndex
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {video.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
