import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, ArrowRight, Utensils, Building2, Users, HeartHandshake,
  BarChart3, ShieldCheck, QrCode, Truck, Heart, CheckCircle2,
  Sparkles, Award, Clock, ArrowDown
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, role } = useAuth();
  const [impactStats, setImpactStats] = useState({
    totalMealsRescued: 12450,
    totalKgRescued: 4980,
    co2KgSaved: 12450,
    completedDonations: 340,
    activeVolunteers: 180,
    activeNGOs: 65,
    activeDonors: 110,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await analyticsService.getImpact();
        const data = res.data?.data;
        if (data) {
          setImpactStats((prev) => ({
            ...prev,
            totalMealsRescued: data.totalMealsRescued || prev.totalMealsRescued,
            totalKgRescued: data.totalKgRescued || prev.totalKgRescued,
            co2KgSaved: data.co2KgSaved || prev.co2KgSaved,
            completedDonations: data.completedDonations || prev.completedDonations,
          }));
        }
      } catch {}
    };
    fetchStats();
  }, []);

  const donateLink = isAuthenticated ? (role === 'donor' ? '/donor/donate' : `/${role}/dashboard`) : '/register';
  const findFoodLink = isAuthenticated ? (role === 'ngo' ? '/ngo/available' : `/${role}/dashboard`) : '/register';
  const volunteerLink = isAuthenticated ? (role === 'volunteer' ? '/volunteer/available' : `/${role}/dashboard`) : '/register';

  return (
    <div className="overflow-x-hidden bg-slate-50 text-slate-800">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 overflow-hidden text-white pt-8 pb-20">
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-8">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-bold tracking-wide animate-fadeIn">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Rescue Food. Reduce Waste. Help People.
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight max-w-5xl mx-auto">
            Turn Surplus Food Into{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Someone's Hope
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            FoodRescue connects food donors, NGOs and volunteers to rescue surplus food from hostels, restaurants, function halls and events before it becomes waste.
          </p>

          {/* 4 Action Buttons Grid */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              to={donateLink}
              id="hero-donate-btn"
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all active:scale-95 flex items-center gap-2"
            >
              <Utensils className="h-4 w-4" />
              Donate Food
            </Link>

            <Link
              to={findFoodLink}
              id="hero-find-food-btn"
              className="px-7 py-3.5 rounded-2xl bg-white/15 hover:bg-white/20 border border-white/25 text-white font-bold text-sm sm:text-base backdrop-blur-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <Building2 className="h-4 w-4 text-teal-300" />
              Find Food
            </Link>

            <Link
              to={volunteerLink}
              id="hero-volunteer-btn"
              className="px-7 py-3.5 rounded-2xl bg-amber-500/90 hover:bg-amber-400 border border-amber-400/40 text-white font-bold text-sm sm:text-base shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <Truck className="h-4 w-4" />
              Become a Volunteer
            </Link>

            <a
              href="#how-it-works"
              className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-sm transition-colors border border-slate-700"
            >
              How It Works ↓
            </a>
          </div>

          {/* Visual Workflow Infographic Bar */}
          <div className="pt-10 max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-4">
              The Real-Time Food Rescue Loop
            </p>
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Node 1 */}
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/30">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-2">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-xs text-white">1. Surplus Food</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Hostels & Restaurants</p>
                </div>

                {/* Node 2 */}
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-amber-950/50 border border-amber-500/30">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-2">
                    <Truck className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-xs text-white">2. Volunteer</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">QR Verified Collection</p>
                </div>

                {/* Node 3 */}
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-blue-950/50 border border-blue-500/30">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-2">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-xs text-white">3. Verified NGO</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Safe Distribution</p>
                </div>

                {/* Node 4 */}
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/30">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-2">
                    <Heart className="h-5 w-5 fill-emerald-400" />
                  </div>
                  <h4 className="font-bold text-xs text-white">4. People in Need</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Zero Food Waste</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY FOOD RESCUE MATTERS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Social & Environmental Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Why Food Rescue Matters
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Every day, tons of perfectly edible, freshly prepared meals are discarded while millions go to bed hungry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
                1/3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Food Waste Crisis</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nearly 40% of all food produced is wasted globally, while hostels and event halls discard surplus buffet food nightly.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Immediate Hunger Relief</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                By bridging donors with shelters in under 2 hours, we deliver nutritious hot meals to children, families, and seniors.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-md">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Carbon Footprint Reduction</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Preventing organic food from decomposing in landfills drastically reduces toxic methane emissions and carbon waste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (STEP-BY-STEP) */}
      <section id="how-it-works" className="py-20 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              Transparent & Verified
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              How FoodRescue Works
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              From post to delivery in 4 streamlined, trackable steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 space-y-4">
              <span className="text-3xl font-black text-emerald-400">01</span>
              <h3 className="text-lg font-bold text-white">Donor Posts Food</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Donors enter quantity, food type (veg/non-veg), preparation time, and upload photos in a 6-step guided wizard.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 space-y-4">
              <span className="text-3xl font-black text-teal-400">02</span>
              <h3 className="text-lg font-bold text-white">NGO Requests</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Verified NGO shelters filter nearby food and submit instant requests for their daily community meals.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 space-y-4">
              <span className="text-3xl font-black text-amber-400">03</span>
              <h3 className="text-lg font-bold text-white">QR Code Pickup</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Volunteer accepts pickup and scans the donor's one-time QR code at collection to verify the right donation.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 space-y-4">
              <span className="text-3xl font-black text-emerald-400">04</span>
              <h3 className="text-lg font-bold text-white">Delivered & Impact Recorded</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                NGO confirms delivery receipt. Digital rescue certificates are issued and live impact statistics are updated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHO CAN DONATE? */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Community Food Network
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Who Can Donate Surplus Food?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Any entity with surplus edible food can list donations within 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Hostels & Canteens', icon: '🏨', desc: 'Hostel mess & dining halls' },
              { label: 'Restaurants & Cafes', icon: '🍽️', desc: 'Freshly cooked surplus' },
              { label: 'Hotels & Buffets', icon: '🍲', desc: 'Surplus buffet spreads' },
              { label: 'Marriage & Function Halls', icon: '🎉', desc: 'Event leftovers' },
              { label: 'Colleges & Universities', icon: '🎓', desc: 'Campus food centers' },
              { label: 'Catering Services', icon: '🍱', desc: 'Party & banquet packs' },
              { label: 'Supermarkets', icon: '🥖', desc: 'Packaged bakery & produce' },
              { label: 'Households & Families', icon: '🏡', desc: 'Home event surplus' },
            ].map((donor, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-300 transition-all text-center space-y-2"
              >
                <span className="text-3xl block">{donor.icon}</span>
                <h4 className="text-sm font-bold text-slate-900">{donor.label}</h4>
                <p className="text-xs text-slate-500">{donor.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LIVE IMPACT STATISTICS */}
      <section id="impact" className="py-20 bg-gradient-to-br from-emerald-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              Live Database Metrics
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Our Collective Rescue Impact
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Real-time milestones powered by generous donors, grassroots NGOs, and hero volunteers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-4xl sm:text-5xl font-black text-emerald-400">
                {impactStats.totalMealsRescued?.toLocaleString()}+
              </p>
              <p className="text-xs uppercase tracking-wider text-slate-300 font-bold mt-2">Meals Rescued</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-4xl sm:text-5xl font-black text-teal-300">
                {impactStats.totalKgRescued?.toLocaleString()} kg
              </p>
              <p className="text-xs uppercase tracking-wider text-slate-300 font-bold mt-2">Food Saved from Landfills</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-4xl sm:text-5xl font-black text-amber-300">
                {impactStats.completedDonations?.toLocaleString()}+
              </p>
              <p className="text-xs uppercase tracking-wider text-slate-300 font-bold mt-2">Completed Rescue Missions</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-4xl sm:text-5xl font-black text-emerald-400">
                {impactStats.co2KgSaved?.toLocaleString()} kg
              </p>
              <p className="text-xs uppercase tracking-wider text-slate-300 font-bold mt-2">CO₂ Emissions Prevented</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-10 sm:p-14 text-white shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Turn Surplus Food into Hope?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of food businesses, non-profits, and volunteers across India building a zero-hunger, zero-waste future.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-2xl bg-white text-emerald-900 hover:bg-slate-100 font-black text-sm shadow-lg transition-all active:scale-95"
            >
              Join FoodRescue Free
            </Link>
            <Link
              to="/help"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
