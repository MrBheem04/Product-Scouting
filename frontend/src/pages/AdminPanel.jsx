import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Settings, Play, RefreshCw, BarChart2, ShieldAlert, CheckCircle, Database, Tag, Link2, Copy, GitMerge, AlertCircle, ShoppingCart } from 'lucide-react';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [clicks, setClicks] = useState([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [jobSuccess, setJobSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Affiliate tags settings state
  const [selectedStore, setSelectedStore] = useState('amazon');
  const [affiliateTag, setAffiliateTag] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Merge duplicates state
  const [parentProductId, setParentProductId] = useState('');
  const [duplicateProductId, setDuplicateProductId] = useState('');
  const [mergeSuccess, setMergeSuccess] = useState('');
  const [mergeError, setMergeError] = useState('');
  const [merging, setMerging] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    
    if (!token || user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    loadAdminStats(token);
    loadClickAnalytics(token);
  }, []);

  const loadAdminStats = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (err) {
      setError('Admin access denied or server offline.');
    } finally {
      setLoading(false);
    }
  };

  const loadClickAnalytics = async (token) => {
    try {
      const res = await axios.get('/api/admin/clicks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setClicks(res.data.clicks);
        setTotalClicks(res.data.totalClicks);
      }
    } catch (err) {
      console.warn('Failed to load click analytics:', err.message);
    }
  };

  const handleTriggerScraperJob = async () => {
    const token = localStorage.getItem('token');
    setTriggering(true);
    setJobSuccess(false);
    try {
      const response = await axios.post('/api/admin/scrape-job', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setJobSuccess(true);
        loadAdminStats(token);
      }
    } catch (err) {
      setError('Scraper task failed to execute.');
    } finally {
      setTriggering(false);
    }
  };

  const handleSaveAffiliateSettings = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('/api/admin/affiliate-settings', {
        store: selectedStore,
        affiliateTag
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSettingsSuccess(true);
        setAffiliateTag('');
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.warn('Failed to save affiliate settings:', err.message);
    }
  };

  const handleMergeDuplicates = async (e) => {
    e.preventDefault();
    setMergeSuccess('');
    setMergeError('');
    setMerging(true);

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('/api/admin/merge-duplicates', {
        parentProductId,
        duplicateProductId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMergeSuccess(response.data.message);
        setParentProductId('');
        setDuplicateProductId('');
        loadAdminStats(token);
      }
    } catch (err) {
      setMergeError(err.response?.data?.message || 'Failed to merge products.');
    } finally {
      setMerging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs">Aggregating system health indexes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white font-sans">Admin Denied</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl text-white"
        >
          Back to User Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-100 font-sans space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-brand-400" />
          Admin System Panel
        </h1>
        <p className="text-xs text-slate-400">Manage queue tasks, configure store affiliate tags, merge duplicates, and monitor redirects</p>
      </div>

      {/* Grid of system status cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-2">
          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Total Accounts</span>
          <span className="text-2xl font-black text-white">{stats?.users}</span>
        </div>
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-2">
          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Tracked Products</span>
          <span className="text-2xl font-black text-white">{stats?.products}</span>
        </div>
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-2">
          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Active Alerts</span>
          <span className="text-2xl font-black text-brand-400">{stats?.alerts}</span>
        </div>
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-2">
          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Verified Coupons</span>
          <span className="text-2xl font-black text-emerald-400">{stats?.coupons}</span>
        </div>
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-2">
          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Affiliate Clicks</span>
          <span className="text-2xl font-black text-blue-400">{totalClicks || stats?.clicks || 0}</span>
        </div>
      </div>

      {/* Scraper runner configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Force scraper runner */}
        <div className="lg:col-span-1 p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pb-3 border-b border-white/5">
            <RefreshCw className="w-5 h-5 text-brand-400" />
            Background Scraper Queue
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Trigger a manual update job. This forces our Puppeteer background worker to scrape and update the current pricing metrics of all tracked products.
          </p>

          {jobSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] flex items-center gap-1">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Cron Update Completed! Price lists and history ticks updated.</span>
            </div>
          )}

          <button
            onClick={handleTriggerScraperJob}
            disabled={triggering}
            className="w-full py-3 bg-gradient-purple-blue text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 shadow-neon-glow text-white"
          >
            {triggering ? 'Scraping items...' : 'Execute Scrapers Cron'}
            <Play className="w-4 h-4" />
          </button>
        </div>

        {/* Worker health logs */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pb-3 border-b border-white/5">
            <Database className="w-5 h-5 text-emerald-400" />
            Active Microservices & Queue Logs
          </h3>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex justify-between items-center p-3 bg-slate-950/40 border border-white/5 rounded-xl">
              <span>BullMQ Queue Status</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded">
                {stats?.redisQueueStatus || 'Connected'}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950/40 border border-white/5 rounded-xl">
              <span>Scraper Workers (Cluster)</span>
              <span className="text-slate-100 font-mono">
                {stats?.activeScraperWorkers || 2} Online
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950/40 border border-white/5 rounded-xl">
              <span>Average Savings mapped</span>
              <span className="text-emerald-400 font-bold">
                INR {stats?.averageSavingsInr?.toLocaleString() || '0'}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950/40 border border-white/5 rounded-xl">
              <span>System Integrity Status</span>
              <span className="text-white font-mono">
                {stats?.systemHealth || 'Stable'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Affiliate Settings & Product Deduplication */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Affiliate settings manager */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pb-3 border-b border-white/5">
            <Tag className="w-5 h-5 text-brand-400" />
            Affiliate Tag Configurations
          </h3>

          <form onSubmit={handleSaveAffiliateSettings} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Select Store</label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="amazon">Amazon.in</option>
                <option value="flipkart">Flipkart</option>
                <option value="myntra">Myntra</option>
                <option value="ajio">Ajio</option>
                <option value="meesho">Meesho</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Affiliate ID / Parameter Tag</label>
              <input
                type="text"
                value={affiliateTag}
                onChange={(e) => setAffiliateTag(e.target.value)}
                placeholder="e.g. tag-21 or customaffid"
                required
                className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none focus:border-brand-500"
              />
            </div>

            {settingsSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Affiliate configuration saved!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-purple-blue text-white font-bold rounded-xl text-xs hover:opacity-90 shadow-md"
            >
              Update Store Tag
            </button>
          </form>
        </div>

        {/* Duplicate Products Merger */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pb-3 border-b border-white/5">
            <GitMerge className="w-5 h-5 text-amber-500" />
            Duplicate Products Merger (Deduplication)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Consolidate duplicate catalog entries. Enter the Parent product ID (to keep) and the Duplicate product ID (to delete). Price histories and alerts will be migrated automatically.
          </p>

          <form onSubmit={handleMergeDuplicates} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Parent Product ID</label>
                <input
                  type="text"
                  value={parentProductId}
                  onChange={(e) => setParentProductId(e.target.value)}
                  placeholder="Parent Mongo ID..."
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Duplicate Product ID</label>
                <input
                  type="text"
                  value={duplicateProductId}
                  onChange={(e) => setDuplicateProductId(e.target.value)}
                  placeholder="Duplicate Mongo ID..."
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {mergeSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px]">
                {mergeSuccess}
              </div>
            )}

            {mergeError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] flex items-center gap-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mergeError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={merging}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {merging ? 'Merging records...' : 'Merge & Consolidate'}
            </button>
          </form>
        </div>

      </div>

      {/* Clicks Redirect Analytics list */}
      <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            Affiliate Outbound Redirection Logs
          </h3>
          <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-full text-[10px]">
            {clicks.length} Active Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product Target</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Redirection URL</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clicks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-500">
                    No outbound clicks tracked yet. Share e-commerce widgets to generate logs.
                  </td>
                </tr>
              ) : (
                clicks.map((click, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2 max-w-xs">
                      <ShoppingCart className="w-4 h-4 text-brand-400 shrink-0" />
                      <span className="truncate">{click.product?.title || 'Unknown Item'}</span>
                    </td>
                    <td className="py-3.5 px-4 capitalize font-bold text-slate-400">
                      {click.store}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ₹{click.product?.currentPrice?.toLocaleString() || '0'}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1">
                        <Link2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate text-slate-500 select-all hover:text-slate-300" title={click.url}>
                          {click.url}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {new Date(click.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
