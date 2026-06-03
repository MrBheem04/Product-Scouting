import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function PriceChart({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 border border-dashed border-white/10 rounded-2xl bg-slate-900/20 text-xs text-slate-500">
        No price history logs available yet. Set price drops to capture ticks.
      </div>
    );
  }

  // Format data for Recharts
  const chartData = history.map((item) => {
    const date = new Date(item.timestamp);
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      Price: item.price,
    };
  });

  // Calculate lowest, highest, average
  const prices = history.map((h) => h.price);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  
  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel bg-slate-900/90 border border-brand-500/30 p-3 rounded-xl shadow-glass-dark text-xs">
          <p className="text-slate-400 mb-1">{payload[0].payload.date}</p>
          <p className="text-sm font-extrabold text-white">
            INR {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-4">
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              domain={['auto', 'auto']}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Price"
              stroke="#a78bfa"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Visual Indicator Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="py-2.5 bg-slate-900/30 border border-white/5 rounded-xl">
          <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-medium">Historical Low</span>
          <span className="text-sm font-black text-emerald-400">INR {lowest.toLocaleString()}</span>
        </div>
        <div className="py-2.5 bg-slate-900/30 border border-white/5 rounded-xl">
          <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-medium">Historical High</span>
          <span className="text-sm font-black text-rose-400">INR {highest.toLocaleString()}</span>
        </div>
        <div className="py-2.5 bg-slate-900/30 border border-white/5 rounded-xl">
          <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-medium">Last Quote</span>
          <span className="text-sm font-black text-brand-400">INR {prices[prices.length - 1]?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
