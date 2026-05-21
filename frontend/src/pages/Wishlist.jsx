import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Trash2, ArrowRight, ShoppingBag, ShieldAlert } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadWatchlist(token);
  }, []);

  const loadWatchlist = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/users/watchlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWatchlist(response.data.watchlist || []);
    } catch (err) {
      setError('Failed to load watchlist details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/users/watchlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWatchlist(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs">Fetching your saved watchlist items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Error Loading Wishlist</h2>
        <p className="text-xs text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-100 font-sans space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
            My Watchlist
          </h1>
          <p className="text-xs text-slate-400">Track and monitor pricing updates for your saved products</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 bg-slate-900 border border-white/5 rounded-xl text-slate-350">
          {watchlist.length} Products Tracked
        </span>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-655 mx-auto" />
          <h3 className="text-sm font-bold text-white">Your watchlist is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse active products or paste e-commerce item links into the search page to begin price monitoring.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-2.5 bg-gradient-purple-blue text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 hover:opacity-95"
          >
            Explore Catalog
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {watchlist.map((product) => (
            <div key={product._id} className="relative group">
              <ProductCard product={product} />
              <button
                onClick={() => handleRemove(product._id)}
                className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl transition-all shadow-lg backdrop-blur-sm z-10"
                title="Remove from watchlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
