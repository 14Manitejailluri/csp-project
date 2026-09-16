import React, { useEffect, useRef } from 'react';
import { X, Award, Download, Share2, Heart, Sparkles, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export const CompletionCertificateModal = ({ isOpen, onClose, data }) => {
  const certificateRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Fire celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#f59e0b', '#3b82f6'],
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const {
    certificateId = 'CERT-FR-2026-001',
    foodName = 'Nutritious Cooked Meals',
    quantity = '50 meals',
    donorName = 'Community Food Donor',
    ngoName = 'City Relief Foundation',
    volunteerName = 'Community Rescue Volunteer',
    completedDate = new Date(),
    city = 'Community Zone',
  } = data;

  const formattedDate = new Date(completedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const shareText = `🌟 I helped rescue ${quantity} of "${foodName}" from becoming food waste through FoodRescue! Rescue Food. Reduce Waste. Help People.`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FoodRescue Impact Milestone',
          text: shareText,
          url: window.location.origin,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Impact message copied to clipboard! Ready to share on social media.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden my-8 text-center relative">
        {/* Modal Controls Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Sparkles className="h-4 w-4" />
            Official Rescue Certificate
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition-colors"
              title="Print Certificate"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Certificate Container (Aesthetic Parchment / Green Ribbon Design) */}
        <div
          ref={certificateRef}
          className="p-8 sm:p-12 bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 border-8 border-double border-emerald-700/30 m-4 rounded-2xl relative"
        >
          {/* Top Seal / Badge */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-amber-300">
            <Award className="h-8 w-8" />
          </div>

          <p className="text-xs font-bold tracking-widest text-emerald-800 uppercase mb-1">
            FoodRescue Platform
          </p>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Certificate of Food Rescue
          </h2>

          <p className="text-xs text-slate-500 font-serif italic mb-6">
            "Rescue Food. Reduce Waste. Help People."
          </p>

          <div className="max-w-md mx-auto text-xs text-slate-700 leading-relaxed mb-6 space-y-3">
            <p>This certifies that the surplus food donation of</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
              {quantity} of {foodName}
            </p>
            <p>
              was successfully rescued, safely transported, and delivered to feed people in need.
            </p>
          </div>

          {/* Key Parties Grid */}
          <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-emerald-900/10 mb-6 text-left">
            <div className="p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Food Donor
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block">{donorName}</span>
            </div>
            <div className="p-2 border-l border-r border-emerald-900/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Recipient NGO
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block">{ngoName}</span>
            </div>
            <div className="p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Hero Volunteer
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block">{volunteerName}</span>
            </div>
          </div>

          {/* Certificate Footer Metadata */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
            <div>
              <span>Date: </span>
              <strong>{formattedDate}</strong>
            </div>
            <div className="text-center sm:text-right">
              <span>Certificate ID: </span>
              <strong>{certificateId}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <Heart className="h-4 w-4 text-emerald-600 fill-emerald-600" />
            <span>Thank you for helping rescue food and reduce hunger.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShare}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share Impact
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5 inline mr-1" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionCertificateModal;
