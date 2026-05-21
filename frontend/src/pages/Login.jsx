import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { authStart, authSuccess, authFailure } from '../store/slices/authSlice';
import { ShieldCheck, Info, User, Lock, Mail, Sparkles } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  
  const { error, loading, isAuthenticated } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'register') {
      setIsRegister(true);
    } else {
      setIsRegister(false);
    }
  }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(authStart());
    
    try {
      const endpoint = isRegister ? '/api/users/register' : '/api/users/login';
      const payload = isRegister 
        ? { name, email, password, referralCode } 
        : { email, password };
        
      const response = await axios.post(endpoint, payload);
      if (response.data.success) {
        dispatch(authSuccess(response.data));
        navigate('/dashboard');
      }
    } catch (err) {
      dispatch(authFailure(err.response?.data?.message || 'Authentication failed. Please verify credentials.'));
    }
  };

  const autofillUser = () => {
    setEmail('john@gmail.com');
    setPassword('password123');
  };

  const autofillAdmin = () => {
    setEmail('admin@scoutprice.com');
    setPassword('adminpassword123');
  };

  return (
    <div className="max-w-md mx-auto my-20 px-4 sm:px-6 font-sans">
      <div className="p-8 rounded-3xl glass-panel bg-slate-900/60 border border-white/5 shadow-glass-dark space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">
            {isRegister ? 'Create Smart Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRegister ? 'Unlock tracking alerts and get INR 50 cashback credits' : 'Sign in to monitor your watchlists'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-white/5">
          <button
            onClick={() => { setIsRegister(false); navigate('/login'); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              !isRegister ? 'bg-gradient-purple-blue text-white' : 'text-slate-500 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); navigate('/login?tab=register'); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              isRegister ? 'bg-gradient-purple-blue text-white' : 'text-slate-500 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Info panel */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1 relative">
              <label className="block text-[10px] uppercase font-bold text-slate-500">Name</label>
              <User className="absolute left-4 top-8 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          )}

          <div className="space-y-1 relative">
            <label className="block text-[10px] uppercase font-bold text-slate-500">Email Address</label>
            <Mail className="absolute left-4 top-8 w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@gmail.com"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="block text-[10px] uppercase font-bold text-slate-500">Password</label>
            <Lock className="absolute left-4 top-8 w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          {isRegister && (
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-500">Referral Code (Optional)</label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="e.g. SP-ADMIN"
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 uppercase font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-purple-blue text-white font-bold rounded-xl text-xs hover:opacity-90 shadow-neon-glow transition-all"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Developer accounts box */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-brand-400" />
            Local Developer Accounts (Seed First)
          </span>

          <div className="flex gap-2">
            <button
              onClick={autofillUser}
              className="flex-1 py-1.5 bg-slate-950 border border-white/5 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white"
            >
              Autofill John (User)
            </button>
            <button
              onClick={autofillAdmin}
              className="flex-1 py-1.5 bg-slate-950 border border-white/5 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white"
            >
              Autofill Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
