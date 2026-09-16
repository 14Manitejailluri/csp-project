import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, Clock, Headphones, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-14 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                FoodRescue
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Connecting food donors, verified NGOs, and local volunteers to eliminate surplus waste and ensure no good food goes uneaten.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Heart className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
              <span>Feeding Communities Together</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-emerald-400 transition-colors">Customer Support & FAQs</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">Register as Donor / NGO / Volunteer</Link>
              </li>
            </ul>
          </div>

          {/* Customer Support Block in Footer */}
          <div className="md:col-span-5 bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Headphones className="h-4 w-4" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Customer Support</h4>
            </div>
            <p className="text-xs text-slate-300">
              Need Help? We're Here for You. Have questions about donations, pickups, requests or your account? Contact FoodRescue Support.
            </p>

            <div className="space-y-1.5 text-xs text-slate-300">
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
                <span>Monday - Saturday, 9:00 AM - 6:00 PM</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href="tel:1800XXXXXX"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow"
              >
                <Phone className="h-3 w-3" />
                Call Support
              </a>
              <a
                href="mailto:support@foodrescue.com?subject=FoodRescue%20Support%20Inquiry"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs border border-slate-600 transition-colors"
              >
                <Mail className="h-3 w-3" />
                Email Support
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 FoodRescue Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/help" className="hover:text-slate-400 transition-colors">Help Center</Link>
            <span>•</span>
            <span className="text-slate-500">Note: 1800-XXX-XXXX is a placeholder helpline until configured.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;