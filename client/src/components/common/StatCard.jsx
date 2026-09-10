import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color = 'emerald', loading = false }) => {
  const colorMap = {
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-indigo-600',
    amber: 'from-amber-400 to-orange-500',
    rose: 'from-rose-500 to-pink-600',
    violet: 'from-violet-500 to-purple-600',
    teal: 'from-teal-500 to-cyan-600',
  };

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-500' : 'text-slate-400';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          {Icon && <Icon className="h-6 w-6 text-white" />}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 bg-slate-100 rounded animate-pulse w-20" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-32" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold text-slate-800">{value ?? '—'}</p>
          <p className="text-sm text-slate-500 mt-1">{title}</p>
          {trendLabel && <p className="text-xs text-slate-400 mt-1">{trendLabel}</p>}
        </>
      )}
    </div>
  );
};

export default StatCard;
