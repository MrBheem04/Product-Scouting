import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { TrendingUp, Bell, Tag, Sparkles, User, LogOut, Sun, Moon, Heart } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel bg-slate-950/70 border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-glow group">
            <span className="p-2 bg-gradient-purple-blue rounded-xl text-white shadow-neon-glow transition-transform group-hover:scale-105">
              <TrendingUp className="w-6 h-6" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-white">
              Scout<span className="text-brand-400">Price</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link to="/search" className="text-slate-300 hover:text-white transition-colors">
              Find Products
            </Link>
            <Link to="/compare" className="text-slate-300 hover:text-white transition-colors">
              Compare Prices
            </Link>
            <Link to="/category" className="text-slate-300 hover:text-white transition-colors">
              Categories
            </Link>
            <Link to="/deals" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Hot Deals
            </Link>
            <Link to="/coupons" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1">
              <Tag className="w-4 h-4 text-emerald-400" />
              Coupons
            </Link>
            <Link to="/extension" className="text-slate-300 hover:text-white transition-colors">
              Chrome Widget
            </Link>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Widget */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 border border-white/5 rounded-xl transition-all"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Cashback balance */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs text-slate-400">Cashback Balance</span>
                  <span className="text-sm font-bold text-emerald-400">₹{user?.cashbackBalance?.toFixed(2) || '0.00'}</span>
                </div>
                
                {/* Navigation actions */}
                <Link to="/wishlist" className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-white/5 rounded-xl hover:bg-slate-800 transition-colors" title="My Wishlist">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/10" />
                </Link>

                <Link to="/alerts" className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-white/5 rounded-xl hover:bg-slate-800 transition-colors" title="Price Alerts">
                  <Bell className="w-4 h-4 text-brand-400" />
                </Link>

                <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border border-white/5 rounded-xl hover:bg-slate-800 transition-colors">
                  <User className="w-4 h-4 text-brand-400" />
                  <span className="hidden sm:inline text-xs text-slate-200">{user?.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 bg-slate-900/50 hover:bg-red-500/10 border border-white/5 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?tab=register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-purple-blue rounded-xl hover:opacity-90 shadow-neon-glow hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
