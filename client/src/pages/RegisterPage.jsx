import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, User, Mail, Lock, Phone, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const dashboardRoutes = {
  donor: '/donor/dashboard',
  ngo: '/ngo/dashboard',
  volunteer: '/volunteer/dashboard',
};

const roleOptions = [
  { value: 'donor', label: '🍽️ Food Donor', desc: 'Restaurants, households, events' },
  { value: 'ngo', label: '🏛️ NGO Partner', desc: 'Verified collection organizations' },
  { value: 'volunteer', label: '🤝 Volunteer', desc: 'Help with pickups & deliveries' },
];

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor',
    organizationName: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.role !== 'ngo') delete payload.organizationName;
      const user = await register(payload);
      toast.success('Account created! Welcome to FoodRescue!');
      navigate(dashboardRoutes[user.role] || '/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Join FoodRescue</h2>
      <p className="text-emerald-200 text-sm mb-6">Create your free account to get started</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role selector */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">I am a…</label>
          <div className="grid grid-cols-3 gap-2">
            {roleOptions.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                id={`role-${value}`}
                onClick={() => set('role', value)}
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  form.role === value
                    ? 'border-emerald-400 bg-emerald-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <p className="text-xs font-semibold leading-tight">{label}</p>
                <p className="text-[10px] mt-0.5 opacity-70 leading-tight">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              id="register-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        {form.role === 'ngo' && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Organization Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                id="register-org"
                type="text"
                required
                value={form.organizationName}
                onChange={(e) => set('organizationName', e.target.value)}
                placeholder="Feed the World Foundation"
                className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">Phone (optional)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              id="register-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              id="register-password"
              type={showPass ? 'text' : 'password'}
              required
              minLength={6}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Min 6 characters"
              className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          id="register-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{' '}
        <Link to="/login" className="text-emerald-300 hover:text-emerald-200 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
