import React from 'react';
import { Product } from '../types';
import { Plus, Clock, Flame, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const formatMoney = (amount: number) => '$' + amount.toLocaleString('es-CO');

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="bg-[#141414] rounded-2xl p-3.5 sm:p-4 border border-neutral-800/80 hover:border-neutral-700/90 transition-all flex justify-between gap-3 sm:gap-4 relative overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-red-950/20"
    >
      {/* Accent glow on hover */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-600/10 transition-colors pointer-events-none" />

      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Badge & Timing */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {product.badge && (
              <span className="bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wider uppercase">
                {product.badge}
              </span>
            )}
            {product.prepTime && (
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-neutral-400" />
                <span>{product.prepTime}</span>
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <span>{product.name}</span>
          </h3>

          {/* Description */}
          <p className="text-xs text-neutral-300 mt-1 line-clamp-2 font-normal leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="mt-3.5 flex items-center justify-between pt-1 border-t border-neutral-800/40">
          <span className="font-display text-xl sm:text-2xl font-bold text-white tracking-wide">
            {formatMoney(product.price)}
          </span>

          <button
            id={`add-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="bg-[#E53E3E] hover:bg-[#C53030] active:scale-95 text-white text-xs font-extrabold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all shadow-md shadow-red-600/20 flex items-center gap-1 shrink-0"
          >
            <span>PEDIR</span>
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Product Image Box */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-inner self-center relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <span className="text-3xl sm:text-4xl select-none">{product.imageEmoji || '🍔'}</span>
        )}
      </div>
    </div>
  );
};
