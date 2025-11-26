'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Users,
  Clock,
  Zap,
  TrendingUp,
  Shield,
  DollarSign,
  Check,
  ArrowRight,
  Heart,
  Share2,
  Eye
} from 'lucide-react';
import { MarketplaceAgent } from '@/types/marketplace';

interface AgentListingCardProps {
  agent: MarketplaceAgent;
  onView?: (agent: MarketplaceAgent) => void;
  onDeploy?: (agent: MarketplaceAgent) => void;
  onCompare?: (agent: MarketplaceAgent) => void;
  onFavorite?: (agent: MarketplaceAgent) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function AgentListingCard({
  agent,
  onView,
  onDeploy,
  onCompare,
  onFavorite,
  showActions = true,
  compact = false
}: AgentListingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'SOL' ? 'SOL' : currency === 'USDC' ? 'USD' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      business: 'from-blue-500 to-cyan-500',
      creative: 'from-purple-500 to-pink-500',
      technical: 'from-green-500 to-emerald-500',
      analytical: 'from-orange-500 to-red-500',
      communication: 'from-indigo-500 to-purple-500',
      security: 'from-red-500 to-rose-500',
      education: 'from-yellow-500 to-amber-500',
      entertainment: 'from-pink-500 to-rose-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      business: '💼',
      creative: '🎨',
      technical: '⚙️',
      analytical: '📊',
      communication: '💬',
      security: '🔒',
      education: '📚',
      entertainment: '🎮'
    };
    return icons[category as keyof typeof icons] || '🤖';
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite?.(agent);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: agent.name,
        text: agent.description,
        url: window.location.href + `/agents/${agent.id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.href + `/agents/${agent.id}`);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={compact ? 12 : 14}
        className={i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
      />
    ));
  };

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-black/40 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-all"
        onClick={() => onView?.(agent)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getCategoryColor(agent.category)} flex items-center justify-center text-lg`}>
              {!imageError && agent.avatar ? (
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-10 h-10 rounded-lg object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span>{getCategoryIcon(agent.category)}</span>
              )}
            </div>
            {agent.verified && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                <Shield size={10} className="text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{agent.name}</h3>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <div className="flex items-center gap-1">
                {renderStars(agent.rating)}
                <span>({agent.reviewCount})</span>
              </div>
              <span>•</span>
              <span>{agent.category}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-cyan-400">
              {formatPrice(agent.pricing.monthlyPrice || agent.pricing.purchasePrice || 0, agent.pricing.currency)}
            </div>
            <div className="text-xs text-white/60">
              {agent.pricing.model === 'subscription' ? '/month' : 'one-time'}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-black/60 border border-white/10 rounded-2xl overflow-hidden cursor-pointer group hover:border-cyan-500/50 transition-all"
      onClick={() => onView?.(agent)}
    >
      {/* Header with avatar and basic info */}
      <div className="relative p-6 pb-4">
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleFavorite}
            className="p-2 bg-black/60 rounded-lg hover:bg-white/10 transition-colors"
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={16}
              className={isFavorited ? 'text-red-400 fill-red-400' : 'text-white/60'}
            />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-black/60 rounded-lg hover:bg-white/10 transition-colors"
            title="Share agent"
            aria-label="Share agent"
          >
            <Share2 size={16} className="text-white/60" />
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getCategoryColor(agent.category)} flex items-center justify-center text-2xl shadow-lg`}>
              {!imageError && agent.avatar ? (
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-14 h-14 rounded-xl object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span>{getCategoryIcon(agent.category)}</span>
              )}
            </div>
            
            {agent.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-black">
                <Check size={12} className="text-white" />
              </div>
            )}
            
            {agent.featured && (
              <div className="absolute -top-1 -left-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white">
                Featured
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
            <p className="text-white/60 text-sm mb-2 line-clamp-2">{agent.description}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                {renderStars(agent.rating)}
                <span className="text-white/60 ml-1">
                  {agent.rating.toFixed(1)} ({agent.reviewCount})
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-white/60">
                <Users size={14} />
                <span>{agent.marketplaceStats.deployments}</span>
              </div>
              
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                agent.availability.status === 'available' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {agent.availability.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities and features */}
      <div className="px-6 py-3 border-t border-white/5">
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.capabilities.slice(0, 3).map((capability, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-xs text-cyan-400"
            >
              {capability.name}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60">
              +{agent.capabilities.length - 3} more
            </span>
          )}
        </div>

        {/* Performance metrics */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-1 text-white/60">
            <Zap size={12} className="text-green-400" />
            <span>{agent.performance.successRate}% success</span>
          </div>
          <div className="flex items-center gap-1 text-white/60">
            <Clock size={12} className="text-blue-400" />
            <span>{agent.performance.averageResponseTime}ms</span>
          </div>
          <div className="flex items-center gap-1 text-white/60">
            <TrendingUp size={12} className="text-purple-400" />
            <span>{agent.performance.averageUptime}% uptime</span>
          </div>
        </div>
      </div>

      {/* Pricing and actions */}
      <div className="px-6 py-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-2xl font-bold text-cyan-400">
              {formatPrice(agent.pricing.monthlyPrice || agent.pricing.purchasePrice || 0, agent.pricing.currency)}
            </div>
            <div className="text-sm text-white/60">
              {agent.pricing.model === 'subscription' ? 'per month' : 
               agent.pricing.model === 'pay-per-use' ? 'per use' : 'one-time'}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/60">
            <Eye size={14} />
            <span>{agent.marketplaceStats.views.toLocaleString()}</span>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onDeploy?.(agent);
              }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              Deploy Now
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onCompare?.(agent);
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg font-medium text-white hover:bg-white/10 transition-colors"
            >
              Compare
            </motion.button>
          </div>
        )}
      </div>

      {/* Hover overlay for quick actions */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"
        />
      )}
    </motion.div>
  );
}

export default AgentListingCard;