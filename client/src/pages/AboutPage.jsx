import React from 'react';
import { Leaf, Heart, Users, ShieldCheck, Award, Utensils, Building2, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20 px-4 sm:px-6 pt-6">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Leaf className="h-3.5 w-3.5" />
          About FoodRescue
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Rescue Food. Reduce Waste. Help People.
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          FoodRescue is a technology-driven community platform designed to bridge surplus food from commercial kitchens, hotels, canteens and events directly with verified hunger-relief organizations.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold border border-emerald-400/30">
            <Heart className="h-6 w-6 fill-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold">Our Mission</h3>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            To eliminate edible food waste at its source and ensure that nutritious, clean food reaches every child, vulnerable elder, and struggling family with dignity and swiftness.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold border border-teal-100">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Safety & Trust</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every listing undergoes verification checks, and every collection is secured with single-use cryptographic QR passes to guarantee safety, transparency, and accountability.
          </p>
        </div>
      </div>

      {/* Role Ecosystem */}
      <div className="space-y-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">The FoodRescue Ecosystem</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Utensils className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Food Donors</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hostels, restaurants, buffets, and caterers who log surplus food in 2 minutes instead of throwing it away.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Hero Volunteers</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Everyday citizens who donate their spare time to collect and transport meals across town.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Verified NGOs</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Grassroots orphanages, elderly shelters, and community kitchens distributing meals where needed most.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-slate-900 text-white rounded-3xl p-10 space-y-5">
        <h3 className="text-2xl font-bold">Be Part of the Solution</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Sign up today and help us ensure that no nutritious meal goes to waste in our cities.
        </p>
        <Link
          to="/register"
          className="inline-block px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs shadow-lg transition-colors"
        >
          Create Free Account
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
