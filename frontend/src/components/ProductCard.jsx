import React from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingDown, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function ProductCard({ product, onSave, isSaved }) {
  const storeColors = {
    amazon: 'from-amber-500 to-amber-600',
    flipkart: 'from-blue-500 to-blue-600',
    myntra: 'from-pink-500 to-pink-600',
    ajio: 'from-indigo-500 to-indigo-600',
    meesho: 'from-purple-500 to-purple-600'
  };

  const storeFormatted = product.store.charAt(0).toUpperCase() + product.store.slice(1);

  return (
    <div className="relative flex flex-col group w-full h-[430px] rounded-2xl glass-panel bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-brand-500/30 overflow-hidden shadow-glass-dark transition-all duration-300 hover:-translate-y-1">
      {/* Clickable Image Container */}
      <Link to={`/product/${product._id}`} className="relative w-full h-48 bg-slate-950 overflow-hidden block">
        {/* Platform Badge */}
        <span className={`absolute top-4 left-4 z-10 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-white rounded-full bg-gradient-to-r ${storeColors[product.store] || 'from-slate-600 to-slate-700'}`}>
          {storeFormatted}
        </span>

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <span className="absolute top-4 right-4 z-10 flex items-center gap-0.5 px-2 py-0.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <TrendingDown className="w-3.5 h-3.5" />
            {product.discountPercent}% Off
          </span>
        )}

        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60"></div>
      </Link>

      {/* Details Box */}
      <div className="flex flex-col flex-1 p-5 justify-between">
        {/* Clickable Info Area */}
        <Link to={`/product/${product._id}`} className="space-y-2 block">
          {/* Category */}
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            {product.category || 'Electronics'}
          </span>
          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors line-clamp-2">
            {product.title}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-xs font-bold ml-1">{product.ratings || '4.2'}</span>
            </div>
            <span className="text-[10px] text-slate-500">({product.ratingsCount || '150'} reviews)</span>
          </div>
        </Link>

        <div>
          {/* Pricing Row */}
          <div className="flex items-baseline space-x-2 mt-4 mb-4">
            <span className="text-lg font-extrabold text-white">₹{product.currentPrice.toLocaleString()}</span>
            <span className="text-xs text-slate-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
          </div>

          {/* Action Row */}
          <div className="flex gap-2">
            <Link
              to={`/product/${product._id}`}
              className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold text-white bg-slate-800 border border-white/5 rounded-xl hover:bg-slate-700 transition-colors"
            >
              Analyze Trends
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            
            {onSave && (
              <button
                onClick={(e) => { e.preventDefault(); onSave(product._id); }}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                  isSaved
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-white/5'
                }`}
                title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                Watch
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
