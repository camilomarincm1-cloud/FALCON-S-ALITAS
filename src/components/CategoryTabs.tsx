import React from 'react';
import { CategoryInfo, ProductCategory } from '../types';
import { Search, X, Flame } from 'lucide-react';

interface CategoryTabsProps {
  categories: CategoryInfo[];
  activeCategory: ProductCategory;
  onSelectCategory: (categoryId: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange
}) => {
  return (
    <nav className="sticky top-[var(--app-header-height,66px)] z-20 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-neutral-800/80 py-2 sm:py-2.5 px-3 sm:px-4 shadow-2xl transition-all">
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-2.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            id="menu-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar hamburguesas, alitas, combos, salchipapas..."
            className="w-full bg-neutral-900/90 text-xs sm:text-sm text-white placeholder-neutral-500 rounded-2xl pl-10 pr-8 py-2.5 border border-neutral-800/90 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 text-xs font-bold"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Scrollable Categories Strip */}
        <div className="relative">
          <div 
            id="category-scroll-strip"
            className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto hide-scrollbar py-1 scroll-smooth"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id && !searchQuery;
              return (
                <button
                  key={cat.id}
                  id={`cat-tab-${cat.id}`}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-4 py-2.5 sm:px-4.5 sm:py-2.5 rounded-2xl text-xs sm:text-[13px] whitespace-nowrap border transition-all flex items-center gap-2 shrink-0 active:scale-95 min-h-[42px] cursor-pointer shadow-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E53E3E] via-red-600 to-[#C53030] text-white font-black border-red-500 shadow-lg shadow-red-600/35 ring-2 ring-red-500/30 scale-[1.02]'
                      : 'bg-neutral-900/95 text-neutral-200 border-neutral-800 hover:bg-neutral-800/90 hover:border-neutral-700 hover:text-white font-bold'
                  }`}
                >
                  <span className="text-base sm:text-lg shrink-0 leading-none">{cat.icon}</span>
                  <span className="tracking-wide">{cat.name}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-sm animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
