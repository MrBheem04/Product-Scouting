import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, Heart, Gift, BarChart2, ShieldAlert, Trash2, ArrowUpRight, Share2 } from 'lucide-react';

export default function Dashboard() {
  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadDashboardData(token);
  }, []);

  const loadDashboardData = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Profile
      const profRes = await axios.get('/api/users/profile', { headers });
      setUserProfile(profRes.data.user);

      // 2. Fetch Watchlist
      const watchRes = await axios.get('/api/users/watchlist', { headers });
      setWatchlist(watchRes.data.watchlist);

      // 3. Fetch Price Alerts
      const alertRes = await axios.get('/api/alerts', { headers });
      setAlerts(alertRes.data.alerts);
    } catch (err) {
      setError('Session expired or DB unavailable. Please sign in again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWatch = async (productId) => {
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

  const handleDeleteAlert = async (alertId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(prev => prev.filter(a => a._id !== alertId));
    } catch (err) {
      console.error(err);
    }
  };

  const copyReferral = () => {
    if (userProfile) {
      navigator.clipboard.writeText(userProfile.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs">Aggregating shopping dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Dashboard Error</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={() => { localStorage.clear(); navigate('/login'); }}
          className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl text-white"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-100 font-sans space-y-8">
      
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-3xl glass-panel bg-slate-900/40 border border-white/5 shadow-glass-dark">
        <div className="flex items-center space-x-4">
          <img src={userProfile?.avatar} alt={userProfile?.name} className="w-16 h-16 rounded-2xl border-2 border-brand-500 object-cover" />
          <div>
            <span className="text-[10px] text-brand-400 font-bold uppercase tracking-widest block">PERSONAL ACCOUNT</span>
            <h1 className="text-2xl font-black text-white">{userProfile?.name}</h1>
            <p className="text-xs text-slate-400">{userProfile?.email}</p>
          </div>
        </div>

        {/* Cashback Summary widget */}
        <div className="flex items-center gap-4 bg-slate-950/60 border border-white/5 p-4 rounded-2xl shrink-0">
          <div className="text-right">
            <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold">CASHBACK BALANCE</span>
            <span className="text-xl font-black text-emerald-400">₹{userProfile?.cashbackBalance?.toFixed(2)}</span>
          </div>
          <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Gift className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Grid containing Stats & Referrals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Referral Box */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pb-2 border-b border-white/5">
            <Gift className="w-5 h-5 text-emerald-400" />
            Invite Friends & Earn
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Invite friends to sign up! They get a <strong>₹50 bonus</strong>, and you earn <strong>₹100 bonus</strong> when they register.
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-grow px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs font-black text-white font-mono text-center">
              {userProfile?.referralCode}
            </div>
            <button
              onClick={copyReferral}
              className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-colors"
            >
              {copiedCode ? 'Copied' : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Analytics Box */}
        <div className="md:col-span-2 p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pb-2 border-b border-white/5">
            <BarChart2 className="w-5 h-5 text-brand-400" />
            Watchlist Value Analytics
          </h3>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="py-3 bg-slate-950/40 border border-white/5 rounded-xl">
              <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-medium">Alerts Configured</span>
              <span className="text-base font-black text-white">{alerts.length} Active</span>
            </div>
            <div className="py-3 bg-slate-950/40 border border-white/5 rounded-xl">
              <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-medium">Watchlist items</span>
              <span className="text-base font-black text-white">{watchlist.length} Saved</span>
            </div>
            <div className="py-3 bg-slate-950/40 border border-white/5 rounded-xl">
              <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-medium">Cashback bonus</span>
              <span className="text-base font-black text-emerald-400">₹{userProfile?.cashbackBalance}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid containing watchlists & Active Alert Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Watchlist */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pb-3 border-b border-white/5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            Your Watchlist
          </h3>
          
          {watchlist.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No items saved yet. Paste links in search to track.</p>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {watchlist.map((w) => (
                <div key={w._id} className="flex items-center justify-between p-3 bg-slate-950/30 border border-white/5 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <img src={w.image} alt={w.title} className="w-10 h-10 object-cover rounded-lg border border-white/10" />
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 max-w-[150px] sm:max-w-[200px]">{w.title}</h4>
                      <span className="text-[9px] uppercase font-bold text-brand-400">₹{w.currentPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/product/${w._id}`)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                      title="View Graph"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveWatch(w._id)}
                      className="p-1.5 bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-white/5 rounded-lg text-xs"
                      title="Unwatch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Alerts */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pb-3 border-b border-white/5">
            <Bell className="w-5 h-5 text-brand-400" />
            Configured Price-Drop Alerts
          </h3>
          
          {alerts.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No alert thresholds configured yet.</p>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {alerts.map((a) => (
                <div key={a._id} className="flex items-center justify-between p-3 bg-slate-950/30 border border-white/5 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1 max-w-[150px] sm:max-w-[200px]">{a.product?.title}</h4>
                    <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-500 uppercase">
                      <span>Store: {a.product?.store}</span>
                      <span>&bull;</span>
                      <span>Target: <strong className="text-brand-400">₹{a.targetPrice.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAlert(a._id)}
                    className="p-1.5 bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-white/5 rounded-lg"
                    title="Remove alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
