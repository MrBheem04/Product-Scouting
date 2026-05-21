import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Flame, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/products');
      // Sort products by discount percent descending
      const sorted = [...response.data.products].sort((a, b) => b.discountPercent - a.discountPercent);
      setDeals(sorted);
    } catch (err) {
      setError('Failed to query active discounts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-100 font-sans space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Flame className="w-8 h-8 text-rose-500 fill-rose-500 animate-pulse-ring" />
            Hot Price-Drop Deals
          </h1>
          <p className="text-xs text-slate-400">Spotlight of high discount items tracked across e-commerce databases</p>
        </div>

        <button
          onClick={loadDeals}
          className="p-2.5 bg-slate-900 border border-white/5 rounded-xl hover:bg-slate-800 transition-colors"
          title="Refresh Deals"
        >
          <RefreshCw className="w-4 h-4 text-brand-400" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-slate-400">Scanning tracked databases for major discount adjustments...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs text-center">
          {error}
        </div>
      ) : deals.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl text-xs text-slate-500">
          No active catalog records logged. Seed database to unlock sample metrics!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <ProductCard key={deal._id} product={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
