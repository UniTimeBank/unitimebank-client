import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, BookOpen } from 'lucide-react';
import { useLazyGetPostSuggestionsQuery } from '@/core/api/post/postApi';

interface PostSearchBarProps {
  onSearch: (q: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const PostSearchBar: React.FC<PostSearchBarProps> = ({
  onSearch,
  placeholder = 'Tìm kiếm kỹ năng, môn học hoặc từ khóa...',
  initialValue = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [triggerSuggestions, { data: suggestions }] = useLazyGetPostSuggestionsQuery();

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        triggerSuggestions(searchTerm.trim());
        setIsOpen(true);
      }, 250);
      return () => clearTimeout(timeoutId);
    } else {
      setIsOpen(false);
    }
  }, [searchTerm, triggerSuggestions]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (value: string) => {
    setSearchTerm(value);
    setIsOpen(false);
    onSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsOpen(false);
      onSearch(searchTerm);
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-xl">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
          <Search className="w-4 h-4 text-gray-400" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 text-xs font-medium bg-gray-50/80 hover:bg-white focus:bg-white border border-gray-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-2xs"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              onSearch('');
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Live Suggestions Dropdown */}
      {isOpen && suggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in-50 duration-200">
          {/* Skills match */}
          {suggestions.skills && suggestions.skills.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 text-3xs font-extrabold uppercase tracking-wider text-gray-400 mb-2">
                <Sparkles className="w-3 h-3 text-primary-500" />
                <span>Kỹ năng gợi ý</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.skills.map((skill, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(skill)}
                    className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-primary-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Titles match */}
          {suggestions.titles && suggestions.titles.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-3xs font-extrabold uppercase tracking-wider text-gray-400 mb-2">
                <BookOpen className="w-3 h-3 text-blue-500" />
                <span>Lớp học liên quan</span>
              </div>
              <div className="flex flex-col gap-1">
                {suggestions.titles.map((title, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(title)}
                    className="text-left px-2.5 py-1.5 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-800 transition-colors truncate cursor-pointer"
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
