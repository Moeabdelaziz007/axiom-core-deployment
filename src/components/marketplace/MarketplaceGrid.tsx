'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ChevronDown, 
  SlidersHorizontal,
  SortAsc,
  SortDesc,
  X,
  Loader2
} from 'lucide-react';
import { MarketplaceAgent, MarketplaceSearchFilters, SearchSorting } from '@/types/marketplace';
import AgentListingCard from './AgentListingCard';

interface MarketplaceGridProps {
  agents: MarketplaceAgent[];
  loading?: boolean;
  onAgentSelect?: (agent: MarketplaceAgent) => void;
  onAgentDeploy?: (agent: MarketplaceAgent) => void;
  onAgentCompare?: (agent: MarketplaceAgent) => void;
  onAgentFavorite?: (agent: MarketplaceAgent) => void;
  filters?: MarketplaceSearchFilters;
  onFiltersChange?: (filters: MarketplaceSearchFilters) => void;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function MarketplaceGrid({
  agents,
  loading = false,
  onAgentSelect,
  onAgentDeploy,
  onAgentCompare,
  onAgentFavorite,
  filters,
  onFiltersChange,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: MarketplaceGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(filters?.query || '');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SearchSorting>(filters?.sorting || 'relevance');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedRating, setSelectedRating] = useState(0);

  const categories = [
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'creative', label: 'Creative', icon: '🎨' },
    { value: 'technical', label: 'Technical', icon: '⚙️' },
    { value: 'analytical', label: 'Analytical', icon: '📊' },
    { value: 'communication', label: 'Communication', icon: '💬' },
    { value: 'security', label: 'Security', icon: '🔒' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎮' }
  ];

  const sortingOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating-desc', label: 'Rating (High to Low)' },
    { value: 'rating-asc', label: 'Rating (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'popularity-desc', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' }
  ];

  useEffect(() => {
    if (onFiltersChange) {
      const updatedFilters: MarketplaceSearchFilters = {
        ...filters,
        query: searchQuery,
        sorting: sortBy,
        category: selectedCategories[0] as any,
        pricing: {
          minPrice: priceRange.min,
          maxPrice: priceRange.max
        },
        rating: {
          min: selectedRating,
          max: 5
        },
        pagination: {
          page: currentPage,
          limit: 20
        }
      };
      onFiltersChange(updatedFilters);
    }
  }, [searchQuery, sortBy, selectedCategories, priceRange, selectedRating, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [category] // Single selection for now
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 1000 });
    setSelectedRating(0);
    setSortBy('relevance');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Search and Filters Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 size-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents by name, capability, or description..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </form>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-cyan-500 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-cyan-500 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                {(selectedCategories.length > 0 || priceRange.min > 0 || priceRange.max < 1000 || selectedRating > 0) && (
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                name="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SearchSorting)}
                className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                aria-label="Sort agents by"
              >
                {sortingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <SortAsc className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none size-4" />
            </div>

            {/* Results Count */}
            <div className="text-white/60 text-sm">
              {totalCount > 0 && (
                <>
                  Showing {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, totalCount)} of {totalCount} agents
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-black/80 backdrop-blur-lg border-b border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label
                        key={category.value}
                        className="flex items-center gap-3 cursor-pointer hover:text-white/80 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.value)}
                          onChange={() => handleCategoryToggle(category.value)}
                          className="rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                        />
                        <span className="text-sm">{category.icon} {category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-white/60">Min Price</label>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/60">Max Price</label>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                        placeholder="1000"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Minimum Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <label
                        key={rating}
                        className="flex items-center gap-3 cursor-pointer hover:text-white/80 transition-colors"
                      >
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={selectedRating === rating}
                          onChange={() => setSelectedRating(rating)}
                          className="border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                        />
                        <span className="text-sm">
                          {'⭐'.repeat(rating)} & up
                        </span>
                      </label>
                    ))}
                    <label
                      className="flex items-center gap-3 cursor-pointer hover:text-white/80 transition-colors"
                    >
                      <input
                        type="radio"
                        name="rating"
                        value={0}
                        checked={selectedRating === 0}
                        onChange={() => setSelectedRating(0)}
                        className="border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                      />
                      <span className="text-sm">All ratings</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleClearFilters}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white/80"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-cyan-500 size-8" />
            <span className="ml-3 text-white/60">Loading agents...</span>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-white mb-2">No agents found</h2>
            <p className="text-white/60 mb-6">
              Try adjusting your filters or search terms to find the perfect agent for your needs.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            <AnimatePresence mode="popLayout">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <AgentListingCard
                    agent={agent}
                    onView={onAgentSelect}
                    onDeploy={onAgentDeploy}
                    onCompare={onAgentCompare}
                    onFavorite={onAgentFavorite}
                    compact={viewMode === 'list'}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            {totalPages > 5 && (
              <>
                <span className="text-white/40">...</span>
                <button
                  onClick={() => onPageChange?.(totalPages)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
            
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketplaceGrid;