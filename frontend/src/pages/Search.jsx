import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search as SearchIcon, Filter, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Search() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Load from query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlParam = params.get('url');
    const storeParam = params.get('store');
    const qParam = params.get('q');

    if (urlParam && storeParam) {
      triggerRealtimeScrape(urlParam, storeParam);
    } else if (qParam) {
      setKeyword(qParam);
      queryCatalog(qParam);
    } else {
      queryCatalog();
    }
  }, [location.search, storeFilter, categoryFilter, sortOrder]);

  // Autocomplete fetcher
  useEffect(() => {
    if (keyword.trim().length < 2 || keyword.startsWith('http')) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/products/suggestions?q=${encodeURIComponent(keyword)}`);
        if (res.data.success) {
          setSuggestions(res.data.suggestions);
        }
      } catch (err) {
        console.warn('Failed to load search suggestions:', err.message);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerRealtimeScrape = async (url, store) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/products/search', { url, store });
      if (response.data.success) {
        navigate(`/product/${response.data.product._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Scraper failed to parse this URL. Local fallback simulated.');
      setLoading(false);
    }
  };

  const queryCatalog = async (searchStr = '') => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '/api/products';
      const params = [];
      const queryVal = searchStr || keyword;
      if (queryVal && !queryVal.startsWith('http')) {
        params.push(`search=${encodeURIComponent(queryVal)}`);
      }
      if (storeFilter) params.push(`store=${storeFilter}`);
      if (categoryFilter) params.push(`category=${categoryFilter}`);
      if (sortOrder) params.push(`sort=${sortOrder}`);
      
      if (params.length > 0) {
        endpoint += `?${params.join('&')}`;
      }
      
      const response = await axios.get(endpoint);
      setProducts(response.data.products || []);
    } catch (err) {
      setError('Failed to load catalog data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (keyword.trim().startsWith('http')) {
      let store = 'amazon';
      if (keyword.includes('flipkart')) store = 'flipkart';
      else if (keyword.includes('myntra')) store = 'myntra';
      else if (keyword.includes('ajio')) store = 'ajio';
      else if (keyword.includes('meesho')) store = 'meesho';
      
      triggerRealtimeScrape(keyword.trim(), store);
    } else {
      queryCatalog(keyword);
    }
  };

  const handleSelectSuggestion = (val) => {
    setKeyword(val);
    setShowSuggestions(false);
    queryCatalog(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-100 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Find Products & Deals</h1>
          <p className="text-xs text-slate-400">Search tracked items or paste direct product links to trigger scraping</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Panel */}
        <div className="lg:col-span-1 p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-3">
            <Filter className="w-4 h-4 text-brand-400" />
            Filter & Sort Search
          </h3>

          {/* Store Filter */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Store</label>
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Stores</option>
              <option value="amazon">Amazon.in</option>
              <option value="flipkart">Flipkart</option>
              <option value="myntra">Myntra</option>
              <option value="ajio">Ajio</option>
              <option value="meesho">Meesho</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="footwear">Footwear</option>
              <option value="apparel">Apparel</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sort By</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">Best Match</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount_desc">Biggest Discount %</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>

          <button
            onClick={() => queryCatalog(keyword)}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-md hover:shadow-lg"
          >
            Apply Filters
          </button>
        </div>

        {/* Content Box */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 relative z-20">
            <div className="relative flex-grow" ref={dropdownRef}>
              <SearchIcon className="absolute left-4 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Paste product link OR search by keyword..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-slate-950 border border-white/10 rounded-2xl shadow-2xl z-30 overflow-hidden text-left p-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-brand-400 tracking-wider">SUGGESTIONS</div>
                  {suggestions.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectSuggestion(item)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-900 cursor-pointer rounded-xl transition-colors"
                    >
                      <SearchIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-purple-blue text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </form>

          {/* Error notice */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scraper Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw className="w-10 h-10 text-brand-400 animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-white">Searching E-commerce Index...</p>
                <p className="text-xs text-slate-500">Querying product logs, comparing stores, and applying smart weights.</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl">
              <p className="text-sm text-slate-400">No products matched your filters. Try pasting a link in the search bar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
