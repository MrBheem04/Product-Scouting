import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, ThumbsUp, ThumbsDown, Check, Copy } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadCoupons();
  }, [selectedStore]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/coupons';
      if (selectedStore) endpoint += `?store=${selectedStore}`;
      
      const response = await axios.get(endpoint);
      setCoupons(response.data.coupons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (couponId, voteType) => {
    try {
      const response = await axios.post(`/api/coupons/${couponId}/vote`, { voteType });
      if (response.data.success) {
        setCoupons(prev => prev.map(c => 
          c._id === couponId 
            ? { ...c, upvotes: response.data.upvotes, downvotes: response.data.downvotes } 
            : c
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCode = (couponId, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(couponId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const storeTabs = [
    { label: 'All Coupons', value: '' },
    { label: 'Amazon', value: 'amazon' },
    { label: 'Flipkart', value: 'flipkart' },
    { label: 'Myntra', value: 'myntra' },
    { label: 'Ajio', value: 'ajio' },
    { label: 'Meesho', value: 'meesho' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-100 font-sans space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <Tag className="w-8 h-8 text-emerald-500 fill-emerald-500/20" />
          Verified Store Coupons
        </h1>
        <p className="text-xs text-slate-400">Discover active discount codes upvoted and verified by the community</p>
      </div>

      {/* Store Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
        {storeTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStore(tab.value)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              selectedStore === tab.value
                ? 'bg-gradient-purple-blue text-white border-transparent shadow-neon-glow'
                : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-slate-400">Filtering active discount codes...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl text-xs text-slate-500">
          No coupons found for this store selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((c) => {
            const upPercentage = c.upvotes + c.downvotes > 0 
              ? Math.round((c.upvotes / (c.upvotes + c.downvotes)) * 100) 
              : 100;
              
            return (
              <div
                key={c._id}
                className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 flex flex-col justify-between gap-4 relative overflow-hidden"
              >
                {/* Store badge */}
                <span className="absolute top-4 right-4 text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                  {c.store}
                </span>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black rounded-lg">
                      {c.discountType === 'percent' ? `${c.discountAmount}% OFF` : `₹${c.discountAmount} OFF`}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {upPercentage}% Success Rate
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{c.description}</h3>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                  {/* Copy Coupon Code Box */}
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm font-black text-white font-mono uppercase tracking-wider">
                      {c.code}
                    </div>
                    <button
                      onClick={() => handleCopyCode(c._id, c.code)}
                      className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors border border-white/5"
                      title="Copy promo code"
                    >
                      {copiedId === c._id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Upvote / Downvote */}
                  <div className="flex items-center space-x-2 text-xs">
                    <button
                      onClick={() => handleVote(c._id, 'upvote')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950/40 border border-white/5 rounded-xl hover:text-emerald-400 transition-colors"
                      title="Works"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{c.upvotes}</span>
                    </button>

                    <button
                      onClick={() => handleVote(c._id, 'downvote')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950/40 border border-white/5 rounded-xl hover:text-rose-400 transition-colors"
                      title="Expired"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{c.downvotes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
