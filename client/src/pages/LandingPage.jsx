import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, Utensils, Building2, Users, HeartHandshake, BarChart3, Shield } from 'lucide-react';

const stats = [
  { value: '10,000+', label: 'Meals Rescued' },
  { value: '250+', label: 'Verified NGOs' },
  { value: '5,000+', label: 'Volunteers' },
  { value: '99%', label: 'Food Safety Rate' },
];

const roles = [
  {
    icon: Utensils,
    title: 'Food Donors',
    desc: 'Restaurants, hotels, and households can post surplus food in minutes and connect with verified collectors instantly.',
    color: 'emerald',
    gradient: 'from-emerald-400 to-teal-500',
    link: '/register',
    linkLabel: 'Donate Food',
  },
  {
    icon: Building2,
    title: 'NGO Partners',
    desc: 'Verified organizations get priority access to available donations near them and coordinate volunteer pickups.',
    color: 'blue',
    gradient: 'from-blue-400 to-indigo-500',
    link: '/register',
    linkLabel: 'Join as NGO',
  },
  {
    icon: Users,
    title: 'Volunteers',
    desc: 'Community volunteers can sign up for pickup assignments, helping bridge the gap between donors and NGOs.',
    color: 'amber',
    gradient: 'from-amber-400 to-orange-500',
    link: '/register',
    linkLabel: 'Volunteer Now',
  },
];

const howItWorks = [
  { step: '01', title: 'Donor Posts Food', desc: 'Takes 2 minutes to list surplus food with quantity, expiry, and pickup location.' },
  { step: '02', title: 'NGO Claims It', desc: 'Nearby verified NGOs receive instant notifications and can claim available donations.' },
  { step: '03', title: 'Volunteer Picks Up', desc: 'A volunteer is assigned and picks up the food before it expires.' },
  { step: '04', title: 'Food Gets Delivered', desc: 'The food reaches those in need, and impact statistics are updated in real time.' },
];

export const LandingPage = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium mb-8">
            <Leaf className="h-4 w-4" />
            Fighting food waste, one meal at a time
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Rescue Food.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Feed Communities.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            FoodRescue connects surplus food from restaurants, hotels, and households with verified NGOs and volunteers — before it becomes waste.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              id="hero-cta-register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base hover:opacity-90 transition-opacity shadow-xl shadow-emerald-900/50"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              id="hero-cta-login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white font-medium text-base hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-emerald-300 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">How FoodRescue Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">From post to delivery in four simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative text-center">
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-emerald-100" />
                )}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-lg shadow-emerald-200">
                  {step.step}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role cards */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Who is FoodRescue For?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Join as a donor, NGO partner, or volunteer</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map(({ icon: Icon, title, desc, gradient, link, linkLabel }) => (
              <div key={title} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow p-8 flex flex-col">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1">{desc}</p>
                <Link
                  to={link}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:gap-3 transition-all"
                >
                  {linkLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact section */}
      <section id="impact" className="py-24 bg-gradient-to-br from-emerald-900 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <HeartHandshake className="h-12 w-12 mx-auto text-emerald-300 mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Make a Real Impact</h2>
          <p className="text-emerald-200 max-w-xl mx-auto mb-12 leading-relaxed">
            Every meal rescued represents not just food saved, but carbon emissions avoided, water conserved, and a life nourished.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Shield, stat: '100% Verified', label: 'All NGOs are vetted before approval' },
              { icon: BarChart3, stat: 'Live Analytics', label: 'Track your impact in real time' },
              { icon: Users, stat: 'Community Led', label: 'Built on volunteer networks' },
            ].map(({ icon: Icon, stat, label }) => (
              <div key={stat} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <Icon className="h-7 w-7 text-emerald-300 mx-auto mb-3" />
                <p className="text-xl font-bold mb-1">{stat}</p>
                <p className="text-emerald-200 text-sm">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link
              to="/register"
              id="impact-cta"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-emerald-700 font-bold hover:bg-emerald-50 transition-colors shadow-xl"
            >
              Join the Movement <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
