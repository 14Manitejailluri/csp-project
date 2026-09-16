import React, { useState } from 'react';
import {
  X, Camera, CheckCircle2, AlertCircle, Loader2,
  ShieldCheck, Upload, ArrowRight, Image as ImageIcon, Sparkles
} from 'lucide-react';
import { pickupService } from '../../services/pickupService';
import toast from 'react-hot-toast';

export const ScanQRModal = ({ isOpen, onClose, pickup, onPickupConfirmed }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [proofPhoto, setProofPhoto] = useState('');
  const [notes, setNotes] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e?.preventDefault();
    const token = tokenInput.trim();
    if (!token) {
      toast.error('Please enter or scan the pickup token');
      return;
    }

    setIsVerifying(true);
    try {
      // If token is in JSON format from raw QR payload: { pickupId, token }
      let cleanToken = token;
      try {
        const parsed = JSON.parse(token);
        if (parsed.token) cleanToken = parsed.token;
      } catch {}

      const res = await pickupService.verifyQR(pickup._id, { token: cleanToken });
      setVerificationResult(res.data?.data);
      toast.success('Pickup token verified successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired pickup code.');
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmPickup = async () => {
    setIsConfirming(true);
    try {
      await pickupService.markPickedUp(pickup._id, {
        pickupProofPhoto: proofPhoto,
        proofImageUrl: proofPhoto,
        notes: notes.trim(),
      });
      toast.success('Donation marked as Picked Up!');
      onPickupConfirmed && onPickupConfirmed();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm pickup');
    } finally {
      setIsConfirming(false);
    }
  };

  const foodTitle = pickup?.donation?.title || pickup?.donation?.foodName || 'Donated Food';
  const quantity = pickup?.donation?.quantity
    ? `${pickup?.donation?.quantity} ${pickup?.donation?.quantityUnit || 'meals'}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden my-8 text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-white/20">
              <Camera className="h-4 w-4" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-200">
              Volunteer Verification
            </span>
          </div>

          <h3 className="text-xl font-black tracking-tight">Scan / Enter Pickup QR</h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            Verify the donor's token to confirm collection of {foodTitle}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {!verificationResult ? (
            /* STEP 1: Verification Form */
            <div className="space-y-5">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-emerald-950 mb-1">Mission Checklist:</p>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Ask the donor to open their <strong>Pickup QR code</strong> or provide their unique 32-character token.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Scan or Paste Pickup Code
                  </label>
                  <input
                    type="text"
                    required
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste 32-character token or QR payload"
                    className="w-full px-4 py-3 text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isVerifying || !tokenInput.trim()}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying Code...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Verify Pickup QR
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 2: Verified Details & Proof Upload */
            <div className="space-y-5 animate-fadeIn">
              {/* Green Verified Box */}
              <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-2xl p-5 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="text-lg font-black text-emerald-950">✓ Pickup Verified</h4>
                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <p>
                    <span className="font-semibold text-slate-800">Donation:</span> {verificationResult.foodName}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Quantity:</span> {verificationResult.quantity}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Volunteer:</span> {verificationResult.volunteerName}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Verified At:</span>{' '}
                    {new Date(verificationResult.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Proof Photo Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                  Pickup Proof Photo (Optional / Recommended)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={proofPhoto}
                    onChange={(e) => setProofPhoto(e.target.value)}
                    placeholder="Enter proof photo URL (e.g. food packages in vehicle)"
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Sample Proof:</span>
                  <button
                    type="button"
                    onClick={() => setProofPhoto('https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&auto=format&fit=crop&q=80')}
                    className="text-[11px] text-emerald-600 hover:underline font-medium"
                  >
                    Use Sample Photo
                  </button>
                </div>
              </div>

              {/* Pickup Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Pickup Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 50 meal boxes collected in clean thermal carriers."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>

              {/* Confirm Pickup Action */}
              <button
                onClick={handleConfirmPickup}
                disabled={isConfirming}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirming Food Collection...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm Pickup & Begin Delivery
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanQRModal;
