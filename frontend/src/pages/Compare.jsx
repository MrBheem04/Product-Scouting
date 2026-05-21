import React, { useState } from 'react';
import axios from 'axios';
import { Search, Flame, TrendingDown, Info, ShieldCheck, ArrowRight, ArrowUpDown } from 'lucide-react';

export default function Compare() {
  const [keyword, setKeyword] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('price'); // 'price' or 'rating'

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/products/compare', {
        title: keyword.trim(),
        category: 'Electronics'
      });
      if (response.data.success) {
        setComparison(response.data.comparison);
      }
    } catch (err) {
      setError('Comparison index failed to compile for this item.');
    } finally {
      setLoading(false);
    }
  };

  const getStoreLogo = (store) => {
    const storeFormatted = store.charAt(0).toUpperCase() + store.slice(1);
    return (
      <span className={`px-2.5 py-1 text-[10px] font-bold text-white rounded-full uppercase tracking-wider ${
        store === 'amazon'
          ? 'bg-amber-500'
          : store === 'flipkart'
          ? 'bg-blue-600'
          : store === 'myntra'
          ? 'bg-rose-500'
          : store === 'ajio'
          ? 'bg-teal-600'
          : store === 'meesho'
          ? 'bg-purple-650'
          : 'bg-slate-600'
      }`}>
        {storeFormatted}
      </span>
    );
  };

  // Dynamically sort stores list based on state
  const sortedStores = comparison?.stores
    ? [...comparison.stores].sort((a, b) => {
        if (sortBy === 'price') {
          return (a.price + a.deliveryCharges) - (b.price + b.deliveryCharges);
        } else if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        return 0;
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-100 font-sans space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Compare Across 5 Platforms</h1>
        <p className="text-xs text-slate-400">Search any product to find the cheapest store immediately</p>
      </div>

      {/* Search Input bar */}
      <div className="max-w-3xl p-4 rounded-2xl glass-panel bg-slate-900/60 border border-white/5 shadow-glass-dark">
        <form onSubmit={handleCompare} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Type product name to compare (e.g. UltraBoost Premium Runner Sneaker)..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-gradient-purple-blue text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:opacity-90 shadow-neon-glow"
          >
            Compare Prices
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-slate-400">Comparing prices, calculating shipping, mapping ratings...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs text-center">
          {error}
        </div>
      ) : comparison ? (
        <div className="space-y-6">
          {/* Comparison summary headers */}
          <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">COMPARE CONTEXT</span>
              <h2 className="text-lg font-bold text-white">{comparison.title}</h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Sorting selectors */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-550" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="price">Sort by Price</option>
                  <option value="rating">Sort by Rating</option>
                </select>
              </div>

              <div className="py-2 px-4 bg-slate-950/40 border border-white/5 rounded-xl text-center">
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-medium">CHEAPEST DEALER</span>
                <span className="text-sm font-extrabold text-emerald-400 uppercase">{comparison.cheapestStore}</span>
              </div>
            </div>
          </div>

          {/* Matrix comparing stores side by side */}
          <div className="overflow-x-auto rounded-2xl glass-panel border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-4">Store</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Delivery Charges</th>
                  <th className="p-4">Price Quote</th>
                  <th className="p-4">Final Total</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {sortedStores.map((item, idx) => {
                  const finalTotal = item.price + item.deliveryCharges;
                  const isCheapest = item.storeName === comparison.cheapestStore;
                  const token = localStorage.getItem('token') || '';
                  const redirectUrl = `/api/affiliate/redirect?productId=${comparison.productId || ''}&store=${item.storeName}&url=${encodeURIComponent(item.url)}&token=${token}`;

                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${isCheapest ? 'bg-emerald-500/5' : 'hover:bg-slate-900/30'}`}
                    >
                      {/* Store badge */}
                      <td className="p-4 flex items-center gap-2">
                        {getStoreLogo(item.storeName)}
                        {isCheapest && (
                          <span className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Best Price
                          </span>
                        )}
                      </td>
                      
                      {/* Rating */}
                      <td className="p-4 font-bold text-slate-200">
                        {item.rating} / 5.0
                      </td>
                      
                      {/* Delivery charges */}
                      <td className="p-4">
                        {item.deliveryCharges === 0 ? (
                          <span className="text-emerald-400 font-bold">FREE Delivery</span>
                        ) : (
                          `₹${item.deliveryCharges}`
                        )}
                      </td>
                      
                      {/* Base price */}
                      <td className="p-4 font-semibold">
                        ₹{item.price.toLocaleString()}
                      </td>
                      
                      {/* Final Total */}
                      <td className={`p-4 font-black ${isCheapest ? 'text-emerald-400 text-sm' : 'text-white'}`}>
                        ₹{finalTotal.toLocaleString()}
                      </td>

                      {/* Redirect CTA */}
                      <td className="p-4 text-right">
                        <a
                          href={redirectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex items-center gap-1 px-4 py-2 font-bold rounded-xl text-[10px] transition-all ${
                            isCheapest
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-neon-glow'
                              : 'bg-slate-800 text-white hover:bg-slate-700'
                          }`}
                        >
                          Shop Deal
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl text-xs text-slate-500">
          Try typing 'UltraBoost Premium Runner Sneaker' in the box above to compile a side-by-side quote comparison.
        </div>
      )}
    </div>
  );
}
