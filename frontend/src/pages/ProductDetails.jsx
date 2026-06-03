import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ShieldAlert, AlertTriangle, Sparkles, TrendingDown, ArrowUpRight, CheckCircle, Smartphone } from 'lucide-react';
import PriceChart from '../components/PriceChart';
import AIChatbot from '../components/AIChatbot';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Load product detail and variants
      const prodRes = await axios.get(`/api/products/${id}`);
      setProduct(prodRes.data.product);
      setVariants(prodRes.data.variants || []);
      setAlertPrice(Math.round(prodRes.data.product.currentPrice * 0.9).toString());

      // 2. Load historical logs
      const histRes = await axios.get(`/api/products/${id}/history`);
      setHistory(histRes.data.history);

      // 3. Load AI recommendation insights
      const insightRes = await axios.post('/api/ai/insights', { productId: id });
      setInsights(insightRes.data.insights);
    } catch (err) {
      setError('Failed to aggregate details for this SKU. Local records missing.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must sign in to configure price alerts.');
      return;
    }

    try {
      const res = await axios.post('/api/alerts', {
        productId: id,
        targetPrice: parseFloat(alertPrice),
        notificationChannel: 'email'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAlertSuccess(true);
        setTimeout(() => setAlertSuccess(false), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register price alert.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-white">Aggregating pricing analytics & AI indexes...</p>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Sku Processing Error</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <Link to="/search" className="inline-block px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl text-white">
          Back to Search
        </Link>
      </div>
    );
  }

  const storeFormatted = product.store.charAt(0).toUpperCase() + product.store.slice(1);
  const token = localStorage.getItem('token') || '';
  const redirectUrl = `/api/affiliate/redirect?productId=${product._id}&store=${product.store}&url=${encodeURIComponent(product.originalUrl)}&token=${token}&_cb=${Date.now()}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-100 font-sans space-y-8">
      {/* Back Button */}
      <Link to="/search" className="text-xs text-brand-400 hover:underline">
        &larr; Back to Catalog search
      </Link>

      {/* Main product core card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Image column */}
        <div className="lg:col-span-1 rounded-2xl glass-panel bg-slate-900/40 p-6 flex flex-col items-center justify-center border border-white/5 relative">
          <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-bold text-white rounded-full bg-brand-600 uppercase tracking-widest">
            {storeFormatted}
          </span>
          <div className="w-full h-72 rounded-xl bg-slate-950/40 overflow-hidden flex items-center justify-center mb-6 border border-white/5">
            <img src={product.image} alt={product.title} className="max-w-full max-h-full object-contain p-2" />
          </div>
          <a
            href={redirectUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 bg-gradient-purple-blue text-white text-center font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:opacity-90 shadow-neon-glow"
          >
            Buy on {storeFormatted}
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Middle details column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {product.title}
            </h1>
            
            {/* Ratings */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold ml-1">{product.ratings}</span>
              </div>
              <span className="text-slate-500">({product.ratingsCount} verified reviews)</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-6 rounded-2xl glass-panel bg-slate-900/20 border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Current Quote</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">₹{product.currentPrice.toLocaleString()}</span>
                <span className="text-sm text-slate-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                {product.discountPercent > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded">
                    {product.discountPercent}% Off
                  </span>
                )}
              </div>
            </div>

            {/* AI Recommendation Badge */}
            {insights && (
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">AI Recommendation</span>
                <span className={`px-4 py-2 text-xs font-black rounded-xl text-white shadow-lg ${
                  insights.buyScore > 75
                    ? 'bg-emerald-600 shadow-emerald-600/30'
                    : insights.buyScore > 45
                    ? 'bg-amber-600 shadow-amber-600/30'
                    : 'bg-rose-600 shadow-rose-600/30'
                }`}>
                  {insights.recommendation} ({insights.buyScore}/100)
                </span>
              </div>
            )}
          </div>

          {/* Specifications Selector / Variants */}
          {variants.length > 0 && (
            <div className="p-5 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-3">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Available Variants</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {variants.map((v) => (
                  <Link
                    key={v._id}
                    to={`/product/${v._id}`}
                    className="px-3.5 py-2 bg-slate-950/80 border border-white/5 hover:border-brand-500 rounded-xl text-xs transition-all text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    {v.storage && <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400">{v.storage}</span>}
                    {v.ram && <span className="text-[11px]">{v.ram} RAM</span>}
                    {v.color && <span className="text-[11px] text-slate-400">• {v.color}</span>}
                    {v.size && <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400">{v.size}</span>}
                    <span className="text-brand-400 font-extrabold ml-1">₹{v.price.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Specifications Table */}
          <div className="p-5 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block pb-2 border-b border-white/5">Product Specifications</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Brand</span>
                <span className="text-slate-200 font-bold">{product.title.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Category</span>
                <span className="text-slate-200 font-bold capitalize">{product.category}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Platform Store</span>
                <span className="text-slate-200 font-bold capitalize">{product.store}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Stock Availability</span>
                <span className={`font-bold ${product.availability ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {product.availability ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Last Synced</span>
                <span className="text-slate-200 font-semibold">{new Date(product.lastScrapedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Rating Index</span>
                <span className="text-slate-200 font-bold">{product.ratings} / 5.0</span>
              </div>
            </div>
          </div>

          {/* Price Graph Block */}
          <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white">Price History Analysis</h3>
            <PriceChart history={history} />
          </div>
        </div>
      </div>

      {/* Lower Details, AI and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Set alert */}
        <div className="lg:col-span-1 p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pb-3 border-b border-white/5">
            <ShieldAlert className="w-5 h-5 text-brand-400" />
            Price Drop Alert
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter your target price. We will send you transactional email alerts the second this product drops below your limit.
          </p>

          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-2 text-xs font-bold text-slate-500">₹</span>
              <input
                type="number"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder="Target Price..."
                className="w-full pl-12 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            {alertSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] flex items-center gap-1">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Price drop watcher successfully registered! Check John's inbox.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-purple-blue text-white font-bold rounded-xl text-xs hover:opacity-90 shadow-neon-glow transition-all"
            >
              Monitor Price Drops
            </button>
          </form>
        </div>

        {/* Right Columns: AI Alternative Match and vector search lookup */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pb-3 border-b border-white/5">
            <Sparkles className="w-5 h-5 text-brand-400" />
            AI LookAlike Cheaper Matches
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our local vectors parsed alternative merchants. We flagged these similar alternatives mapping cheaper prices today:
          </p>

          {insights && insights.alternatives ? (
            <div className="space-y-4">
              {insights.alternatives.map((alt, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-white">{alt.title}</h4>
                    <span className="text-[9px] uppercase font-bold text-slate-500">{alt.store} store</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-black text-emerald-400">₹{alt.price.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-500">Save ₹{alt.savings.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No lookup alternatives found.</p>
          )}

          {/* AI Insights block */}
          {insights && (
            <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">AI SMART INSIGHTS</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights.smartInsight} Buying strategy: Purchase is recommended during <strong>{insights.bestTimeToBuyPrediction}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating chatbot assistant */}
      <AIChatbot productContext={product} />
    </div>
  );
}
