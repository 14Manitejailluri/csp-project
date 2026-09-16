import React from 'react';
import { Phone, Mail, Clock, Headphones, HelpCircle } from 'lucide-react';

export const CustomerSupportCard = ({
  variant = 'card', // 'card' | 'banner' | 'compact'
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/20 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Customer Support</h4>
            <p className="text-xs text-emerald-300">Need Help? We're Here for You</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Have questions about donations, pickups, requests or your account? Contact FoodRescue Support.
        </p>

        <div className="space-y-2 mb-5 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-white">Toll-Free:</span>
            <span>1800-XXX-XXXX</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">Placeholder</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
            <span className="font-semibold text-white">Email:</span>
            <a href="mailto:support@foodrescue.com?subject=FoodRescue%20Support%20Inquiry" className="text-teal-300 hover:underline">
              support@foodrescue.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            <span>Mon – Sat, 9:00 AM – 6:00 PM</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:1800XXXXXX"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md"
          >
            <Phone className="h-3.5 w-3.5" />
            Call Support
          </a>
          <a
            href="mailto:support@foodrescue.com?subject=FoodRescue%20Support%20Inquiry"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            Email Support
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-emerald-500/20 relative overflow-hidden ${className}`}>
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 flex-shrink-0">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-1.5">
                <HelpCircle className="h-3 w-3" />
                Dedicated Customer Support
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Need Help? We're Here for You
              </h3>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Have questions about donations, pickups, requests or your account? Contact FoodRescue Support.
              </p>
            </div>
          </div>
        </div>

        {/* Support Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Toll Free */}
          <div className="bg-white/5 border border-white/10 hover:border-emerald-500/40 rounded-xl p-4 transition-all backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Phone className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Toll-Free Helpline</span>
            </div>
            <p className="text-base font-bold text-white tracking-wide">1800-XXX-XXXX</p>
            <p className="text-[11px] text-amber-300/90 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse"></span>
              Placeholder until configured
            </p>
          </div>

          {/* Email */}
          <div className="bg-white/5 border border-white/10 hover:border-teal-500/40 rounded-xl p-4 transition-all backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Direct Email</span>
            </div>
            <a
              href="mailto:support@foodrescue.com?subject=FoodRescue%20Support%20Inquiry"
              className="text-sm sm:text-base font-bold text-teal-300 hover:text-teal-200 hover:underline truncate block"
            >
              support@foodrescue.com
            </a>
            <p className="text-[11px] text-slate-400 mt-1">Typical response in under 2 hours</p>
          </div>

          {/* Hours */}
          <div className="bg-white/5 border border-white/10 hover:border-emerald-500/40 rounded-xl p-4 transition-all backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Support Hours</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-white">Monday - Saturday</p>
            <p className="text-[11px] text-emerald-400 mt-1 font-medium">9:00 AM – 6:00 PM</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
          <a
            href="tel:1800XXXXXX"
            className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 active:scale-95"
          >
            <Phone className="h-4 w-4" />
            Call Support
          </a>
          <a
            href="mailto:support@foodrescue.com?subject=FoodRescue%20Support%20Inquiry"
            className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-all hover:border-white/30 active:scale-95"
          >
            <Mail className="h-4 w-4" />
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportCard;
