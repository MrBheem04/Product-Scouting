import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, Trash2, ShieldAlert, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function PriceAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadAlerts(token);
  }, []);

  const loadAlerts = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(response.data.alerts || []);
    } catch (err) {
      setError('Failed to fetch configured price alert thresholds.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alertId) => {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs">Fetching active price alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Error Loading Alerts</h2>
        <p className="text-xs text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-100 font-sans space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-brand-400" />
            Price Alerts
          </h1>
          <p className="text-xs text-slate-400">Get notified immediately when products hit your target price thresholds</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 bg-slate-900 border border-white/5 rounded-xl text-slate-350">
          {alerts.length} Active Alerts
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl space-y-4">
          <Bell className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No active price alerts</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You will be able to set price alerts from any product's details page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((a) => (
            <div key={a._id} className="p-5 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img src={a.product?.image} alt={a.product?.title} className="w-12 h-12 object-cover rounded-xl border border-white/10" />
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1 max-w-[200px] sm:max-w-md">{a.product?.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 mt-1 uppercase">
                    <span>Store: {a.product?.store}</span>
                    <span>&bull;</span>
                    <span>Current: ₹{a.product?.currentPrice?.toLocaleString()}</span>
                    <span>&bull;</span>
                    <span>Target: <strong className="text-emerald-400">₹{a.targetPrice.toLocaleString()}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/product/${a.product?._id}`)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                  title="View product details"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="p-2.5 bg-slate-900 hover:bg-red-500/10 text-slate-550 hover:text-red-400 border border-white/5 rounded-xl transition-all"
                  title="Remove alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
