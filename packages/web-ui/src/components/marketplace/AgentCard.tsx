'use client';

import React from 'react';
import {
  ShoppingCart,
  MapPin,
  Utensils,
  Scale,
  Zap,
  Clock,
  Cpu,
  ArrowRight,
  Wallet,
} from 'lucide-react';
import { AgentCardProps, AGENT_ROLE_CONFIG } from '@/types/marketplace';

const iconMap = {
  ShoppingCart,
  MapPin,
  Utensils,
  Scale,
};

export default function AgentCard({
  blueprint,
  isWalletConnected,
  onHire,
  onConnectWallet,
}: AgentCardProps) {
  const roleConfig = AGENT_ROLE_CONFIG[blueprint.role];
  const IconComponent = iconMap[roleConfig.icon as keyof typeof iconMap];

  const handleHireClick = () => {
    if (isWalletConnected) {
      onHire(blueprint.id);
    } else {
      onConnectWallet();
    }
  };

  const getModelBadgeColor = (provider: string) => {
    switch (provider) {
      case 'groq':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'google':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
      {/* Gradient Header */}
      <div className={`h-32 bg-gradient-to-br ${roleConfig.color} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
        <div className="absolute top-4 right-4">
          <div className={`w-12 h-12 rounded-xl ${roleConfig.bgColor} flex items-center justify-center shadow-lg`}>
            <IconComponent className={`w-6 h-6 ${roleConfig.textColor}`} />
          </div>
        </div>
        <div className="absolute bottom-4 left-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
            {blueprint.name}
          </h3>
          <p className="text-white/90 text-sm font-medium">
            {roleConfig.label}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {blueprint.description}
        </p>

        {/* Capabilities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {blueprint.capabilities.specialties?.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Model Info */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-1 text-xs rounded-full border ${getModelBadgeColor(blueprint.modelProvider)}`}>
            <Cpu className="w-3 h-3 inline mr-1" />
            {blueprint.modelProvider}
          </span>
          {blueprint.capabilities.response_speed && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full border border-green-200">
              <Zap className="w-3 h-3 inline mr-1" />
              {blueprint.capabilities.response_speed}
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {blueprint.priceDisplay}
            </span>
            <span className="text-gray-500 text-sm ml-1">/month</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              {blueprint.modelProvider === 'groq' ? 'Ultra-fast' : 'AI-powered'}
            </div>
            <div className="text-xs text-gray-500">
              {blueprint.capabilities.max_tokens ? `${blueprint.capabilities.max_tokens.toLocaleString()} tokens` : 'Fast response'}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleHireClick}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
            isWalletConnected
              ? `bg-gradient-to-r ${roleConfig.color} hover:shadow-lg transform hover:scale-105`
              : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
          }`}
        >
          {isWalletConnected ? (
            <>
              <span>HIRE NOW</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>

        {/* Feature highlights */}
        {blueprint.capabilities.languages && (
          <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              {blueprint.capabilities.languages.join(' • ')} Support
            </span>
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}