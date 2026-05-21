import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, ShieldAlert, Sparkles, TrendingDown, ArrowRight, Chrome, Zap, Clock } from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const [urlInput, setUrlInput] = useState('');
  const [storeInput, setStoreInput] = useState('amazon');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const trendingSearches = [
    'iPhone 15 Black 128GB',
    'Sony WH-1000XM5',
    'OnePlus Bullets Wireless Z2',
    'Noise ColorFit Icon 2',
    'Nike Air Max SYSTM'
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('recent_searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        setRecentSearches([]);
      }
    }

    // Handle click outside suggestions dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced/realtime autocomplete lookup
  useEffect(() => {
    if (urlInput.trim().length < 2 || urlInput.startsWith('http')) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/products/suggestions?q=${encodeURIComponent(urlInput)}`);
        if (res.data.success) {
          setSuggestions(res.data.suggestions);
        }
      } catch (err) {
        console.warn('Failed to load search suggestions:', err.message);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [urlInput]);

  const saveSearchToRecent = (query) => {
    if (!query || query.startsWith('http')) return;
    const cleanQuery = query.trim();
    const updated = [cleanQuery, ...recentSearches.filter(s => s !== cleanQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    
    saveSearchToRecent(urlInput);

    // Check if input is a valid URL
    if (urlInput.startsWith('http://') || urlInput.startsWith('https://')) {
      navigate(`/search?url=${encodeURIComponent(urlInput)}&store=${storeInput}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(urlInput)}`);
    }
  };

  const handleSelectSuggestion = (value) => {
    setUrlInput(value);
    setShowSuggestions(false);
    saveSearchToRecent(value);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="relative overflow-hidden min-h-screen text-slate-100 font-sans pb-20">
      {/* Background Neon Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none"></div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        {/* Glow Tagline */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-300 rounded-full text-xs font-bold mb-6 tracking-wide animate-pulse-ring">
          <Sparkles className="w-3.5 h-3.5" />
          AI-POWERED SHOPPING SAVINGS ENGINE
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white max-w-4xl mx-auto mb-6">
          Never Pay Full Price Again. <br className="hidden sm:inline" />
          Track with <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-blue-400 text-glow">ScoutPrice</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Instantly search, track price histories, set target alerts, and find verified coupons across Amazon, Flipkart, Myntra, Ajio, and Meesho.
        </p>

        {/* Floating Tracking Search Engine */}
        <div className="max-w-3xl mx-auto p-4 rounded-2xl glass-panel bg-slate-900/60 border border-white/5 shadow-glass-dark mb-8 relative z-20">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            {/* Store Select */}
            <select
              value={storeInput}
              onChange={(e) => setStoreInput(e.target.value)}
              className="px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="amazon">Amazon.in</option>
              <option value="flipkart">Flipkart</option>
              <option value="myntra">Myntra</option>
              <option value="ajio">Ajio</option>
              <option value="meesho">Meesho</option>
            </select>

            {/* Input field */}
            <div className="flex-grow relative" ref={dropdownRef}>
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Paste product link OR search by keyword..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && (urlInput.trim().length >= 2 || recentSearches.length > 0) && (
                <div className="absolute left-0 right-0 mt-2 bg-slate-950 border border-white/10 rounded-2xl shadow-2xl z-30 overflow-hidden text-left p-2 max-h-80 overflow-y-auto">
                  {/* Suggestions List */}
                  {suggestions.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-bold text-brand-400 tracking-wider">MATCHING SUGGESTIONS</div>
                      {suggestions.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectSuggestion(item)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-900 cursor-pointer rounded-xl transition-colors"
                        >
                          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mt-2 border-t border-white/5 pt-2">
                      <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-slate-400 tracking-wider">
                        <span>RECENT SEARCHES</span>
                        <button
                          type="button"
                          onClick={() => {
                            setRecentSearches([]);
                            localStorage.removeItem('recent_searches');
                          }}
                          className="text-[9px] hover:text-red-400 uppercase transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      {recentSearches.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectSuggestion(item)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 cursor-pointer rounded-xl transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTA button */}
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-purple-blue text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:opacity-90 shadow-neon-glow transition-all"
            >
              Analyze Price
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Trending Searches Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 mb-16 relative z-10">
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 uppercase tracking-wide">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Trending:
          </span>
          {trendingSearches.map((term, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSuggestion(term)}
              className="px-2.5 py-1 bg-slate-900/80 hover:bg-brand-500/20 border border-white/5 hover:border-brand-500/30 text-[11px] text-slate-300 hover:text-white rounded-full transition-all"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Platform Stat Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/5">
          <div className="text-center">
            <span className="block text-2xl font-black text-white">5+ Stores</span>
            <span className="text-xs text-slate-500">Unified tracking</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-black text-emerald-400">INR 1,200+</span>
            <span className="text-xs text-slate-500">Avg. savings per user</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-black text-white">99.8%</span>
            <span className="text-xs text-slate-500">Accuracy rate</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-black text-brand-400">AI Powered</span>
            <span className="text-xs text-slate-500">Alternative matches</span>
          </div>
        </div>
      </div>

      {/* Feature Grids */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-black text-center text-white mb-12">
          Designed for Premium Savings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Scraper */}
          <div className="p-6 rounded-2xl glass-panel bg-slate-900/30 border border-white/5 space-y-4">
            <span className="inline-block p-3 bg-brand-500/10 text-brand-400 rounded-xl">
              <Zap className="w-6 h-6" />
            </span>
            <h3 className="text-lg font-bold text-white">Real-Time Scraping Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our automated queues refresh prices continuously. Spot drop trends as they happen and capitalize on flash deals instantly.
            </p>
          </div>

          {/* Card 2: Alerts */}
          <div className="p-6 rounded-2xl glass-panel bg-slate-900/30 border border-white/5 space-y-4">
            <span className="inline-block p-3 bg-rose-500/10 text-rose-400 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <h3 className="text-lg font-bold text-white">Instant Price-Drop Alerts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Set target price points and receive live updates through WebSockets, transactional emails, or FCM push alerts straight to your devices.
            </p>
          </div>

          {/* Card 3: AI Assistant */}
          <div className="p-6 rounded-2xl glass-panel bg-slate-900/30 border border-white/5 space-y-4">
            <span className="inline-block p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </span>
            <h3 className="text-lg font-bold text-white">AI Shopping Assistant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chat directly with our LLM-backed assistant to discover cheaper visual matches, lookalikes, coupons, and historical buying score indexes.
            </p>
          </div>
        </div>
      </div>

      {/* Chrome Extension CTA banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-purple-blue text-white shadow-neon-glow flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
          
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-xs font-bold">
              <Chrome className="w-4 h-4" />
              CHROME WEB STORE
            </div>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight">
              Get the Floating Widget. <br />
              Compare as you Browse!
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Install the ScoutPrice extension. Automatically inject price graphs, compare across 5 stores, and apply coupon codes inside Amazon and Flipkart checkout screens.
            </p>
          </div>

          <button
            onClick={() => navigate('/extension')}
            className="px-6 py-3 bg-white text-slate-950 font-extrabold rounded-xl text-xs hover:bg-slate-100 hover:scale-105 transition-all shadow-lg shrink-0 flex items-center gap-1.5"
          >
            <Chrome className="w-4 h-4" />
            Install Free Extension
          </button>
        </div>
      </div>
    </div>
  );
}
