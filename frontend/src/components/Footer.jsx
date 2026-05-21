import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Github, Twitter, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-glow">
              <span className="p-2 bg-gradient-purple-blue rounded-xl text-white">
                <TrendingUp className="w-5 h-5" />
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                Scout<span className="text-brand-400">Price</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              ScoutPrice tracks, analyzes, and predicts pricing trends across Amazon, Flipkart, Myntra, Ajio, and Meesho. Save smart on every transaction with AI insights.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Features</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/search" className="hover:text-white transition-colors">Search Engine</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Visual Product Compare</Link></li>
              <li><Link to="/deals" className="hover:text-white transition-colors">Flash Sales</Link></li>
              <li><Link to="/coupons" className="hover:text-white transition-colors">Coupon Finder</Link></li>
            </ul>
          </div>

          {/* Supported Stores */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Supported Platforms</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <span className="hover:text-white transition-colors">Amazon.in</span>
              <span className="hover:text-white transition-colors">Flipkart</span>
              <span className="hover:text-white transition-colors">Myntra</span>
              <span className="hover:text-white transition-colors">Ajio</span>
              <span className="hover:text-white transition-colors">Meesho</span>
            </div>
          </div>

          {/* Extensions and Social */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-2">Join the Community</h4>
            <p className="text-xs text-slate-400">Install our Manifest V3 Chrome Extension to track prices automatically on item loads.</p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} ScoutPrice Inc. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-4 sm:mt-0">
            Crafted with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for smart shoppers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
