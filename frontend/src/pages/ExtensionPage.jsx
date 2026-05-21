import React from 'react';
import { Chrome, HelpCircle, Code, Settings, Sparkles, CheckCircle } from 'lucide-react';

export default function ExtensionPage() {
  const steps = [
    {
      title: 'Enable Developer Mode',
      desc: 'Open chrome://extensions/ inside your browser url bar and toggle "Developer mode" in the top-right corner.'
    },
    {
      title: 'Load Unpacked',
      desc: 'Click on the "Load unpacked" button in the top-left corner.'
    },
    {
      title: 'Select Folder',
      desc: 'Select the "extension" subdirectory from the ScoutPrice repository root. That is it! The widget is now active.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen text-slate-100 font-sans space-y-12 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-500/5 blur-[120px] pointer-events-none"></div>

      {/* Hero section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-300 rounded-full text-xs font-bold">
          <Chrome className="w-4 h-4" />
          SCOUTPRICE BROWSER ADDON
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Track Prices Instantly <br />
          While You Shop.
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Get the official ScoutPrice Manifest V3 Chrome Extension. It automatically injects an analytical price history graph, price comparison matrix, and auto-coupon validation overlay onto product pages.
        </p>
      </div>

      {/* Features List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-3">
          <span className="inline-block p-3 bg-brand-500/10 text-brand-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </span>
          <h4 className="text-sm font-bold text-white">Floating Price Graph Widget</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Injects a beautiful line chart tracking 30 days of fluctuations directly under product titles on Amazon and Flipkart.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-3">
          <span className="inline-block p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Code className="w-5 h-5" />
          </span>
          <h4 className="text-sm font-bold text-white">Auto-Apply Coupons</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Scans our database, types, and validates promotional discount codes automatically inside checkout portals.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel bg-slate-900/40 border border-white/5 space-y-3">
          <span className="inline-block p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Settings className="w-5 h-5" />
          </span>
          <h4 className="text-sm font-bold text-white">Side-by-Side Compare</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Spotlights cheaper visual matching alternatives on competitor stores right on your active tab screen.
          </p>
        </div>
      </div>

      {/* Guide steps */}
      <div className="p-8 rounded-3xl glass-panel bg-slate-900/60 border border-white/5 space-y-8">
        <h3 className="text-lg font-bold text-white text-center flex items-center justify-center gap-1.5 pb-4 border-b border-white/5">
          <HelpCircle className="w-5 h-5 text-brand-400" />
          How to Load Unpacked (Manifest V3 Dev Mode)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className="space-y-3 relative">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 text-sm font-bold">
                {idx + 1}
              </span>
              <h4 className="text-sm font-bold text-white">{s.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
