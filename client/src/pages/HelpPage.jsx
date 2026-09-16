import React, { useState } from 'react';
import {
  HelpCircle, ChevronDown, ChevronUp, MessageSquare,
  ShieldCheck, Heart, Sparkles, Send, CheckCircle
} from 'lucide-react';
import CustomerSupportCard from '../components/common/CustomerSupportCard';
import toast from 'react-hot-toast';

const FAQS = [
  {
    q: 'How does food donation work on FoodRescue?',
    a: 'Donors (restaurants, supermarkets, caterers, individuals) list surplus edible food with description, quantity, shelf life, and pickup location. Verified NGOs and volunteers get instantly notified to claim and pick up the food before expiration.',
  },
  {
    q: 'How are NGOs verified?',
    a: 'NGO partners provide their government registration / 80G numbers and contact coordinators. Platform administrators verify their credentials before enabling high-volume claims to ensure food safely reaches genuine beneficiaries.',
  },
  {
    q: 'How do volunteers accept pickup tasks?',
    a: 'Volunteers can view "Available Pickups" in their dashboard. When an NGO claims a donation that needs delivery, nearby volunteers can accept the task, navigate to the donor location, and deliver to the NGO shelter.',
  },
  {
    q: 'What should I do if a pickup cannot be completed?',
    a: 'Please contact FoodRescue Customer Support immediately via our toll-free line or direct email, or mark the task status on your deliveries dashboard so another volunteer can be dispatched.',
  },
  {
    q: 'Is there any fee or charge to use the platform?',
    a: 'No, FoodRescue is completely free for donors, non-profit organizations, and community volunteers to fight hunger and eliminate food waste.',
  },
];

export const HelpPage = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Your message has been received! Our support team will get back to you shortly.');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="h-3.5 w-3.5" />
          Help & Customer Support Center
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How Can We Help You Today?
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Find instant answers to common questions or reach out directly to our dedicated FoodRescue care team.
        </p>
      </div>

      {/* Main Support Section */}
      <CustomerSupportCard variant="card" />

      {/* FAQ & Contact Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FAQ Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <span className="font-bold text-slate-800 text-sm sm:text-base">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Message Box */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Send an Inquiry</h3>
                <p className="text-xs text-slate-500">Leave a note and we'll reply by email</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Question about donation scheduling"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your question or issue in detail..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Sending Inquiry...' : 'Submit Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
