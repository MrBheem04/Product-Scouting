import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Smartphone, Shirt, Footprints, Sparkles, AlertCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Category() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('electronics');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categoriesList = [
    { name: 'electronics', label: 'Electronics', icon: Smartphone, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { name: 'apparel', label: 'Apparel', icon: Shirt, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { name: 'footwear', label: 'Footwear', icon: Footprints, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { name: 'accessories', label: 'Accessories', icon: Sparkles, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' }
  ];

  useEffect(() => {
    loadCategoryProducts(selectedCategory);
  }, [selectedCategory]);

  const loadCategoryProducts = async (catName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/products?category=${catName}`);
      setProducts(response.data.products || []);
    } catch (err) {
      setError('Failed to load items for this category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-100 font-sans space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Browse by Category</h1>
        <p className="text-xs text-slate-400">Discover handpicked deals grouped by hierarchical store tags</p>
      </div>

      {/* Category selector row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categoriesList.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`p-6 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-slate-900 border-brand-500 shadow-neon-glow scale-[1.02]'
                  : 'bg-slate-950 border-white/5 hover:border-white/10'
              }`}
            >
              <div className={`p-3 rounded-xl w-fit mb-4 border ${cat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{cat.label}</h3>
              <p className="text-[10px] text-slate-500 mt-1">Explore tracked {cat.name} deals</p>
            </button>
          );
        })}
      </div>

      {/* Products list grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <h2 className="text-lg font-bold text-white capitalize">{selectedCategory} Catalog</h2>
          <span className="text-xs text-slate-400">{products.length} Items Listed</span>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading catalog items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl">
            <p className="text-sm text-slate-500">No catalog products listed under this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
