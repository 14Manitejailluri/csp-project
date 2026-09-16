import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, ShieldCheck, Clock, AlertCircle, Copy, Check, RefreshCw } from 'lucide-react';
import { pickupService } from '../../services/pickupService';
import toast from 'react-hot-toast';

export const PickupQRModal = ({ isOpen, onClose, pickup }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && pickup?._id) {
      fetchQR();
    }
  }, [isOpen, pickup]);

  const fetchQR = async () => {
    setLoading(true);
    try {
      const res = await pickupService.generateQR(pickup._id);
      setQrData(res.data?.data);
    } catch (err) {
      toast.error('Failed to load secure pickup QR code');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (qrData?.secureToken) {
      navigator.clipboard.writeText(qrData.secureToken);
      setCopied(true);
      toast.success('Pickup token copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const foodTitle = pickup?.donation?.title || pickup?.donation?.foodName || qrData?.foodName || 'Surplus Food Donation';
  const quantity = pickup?.donation?.quantity
    ? `${pickup?.donation?.quantity} ${pickup?.donation?.quantityUnit || 'meals'}`
    : qrData?.quantity || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden text-center relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 text-white shadow-inner">
            <QrCode className="h-6 w-6" />
          </div>

          <h3 className="text-xl font-black tracking-tight">Pickup Verification QR</h3>
          <p className="text-xs text-emerald-100 mt-1">
            Show this QR code to the assigned volunteer upon food collection
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Donation Preview */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-left flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{foodTitle}</p>
              <p className="text-[11px] text-emerald-700 font-semibold">{quantity}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Ready for Pickup
            </span>
          </div>

          {/* QR Code Canvas */}
          <div className="flex flex-col items-center justify-center">
            {loading ? (
              <div className="w-52 h-52 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
                <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mb-2" />
                <p className="text-xs text-slate-500">Generating secure token...</p>
              </div>
            ) : qrData?.secureToken ? (
              <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-xl inline-block relative group">
                <QRCodeSVG
                  value={qrData.qrPayload || qrData.secureToken}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                  ONE-TIME PASS
                </div>
              </div>
            ) : (
              <div className="w-52 h-52 flex flex-col items-center justify-center bg-rose-50 rounded-2xl border border-rose-100 text-rose-600">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="text-xs">Failed to load QR code</p>
                <button
                  onClick={fetchQR}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Fallback Token */}
          {qrData?.secureToken && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
              <p className="text-[11px] text-slate-500 mb-1">
                Volunteer can't scan? Use verification token:
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xs font-black tracking-widest text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200">
                  {qrData.secureToken}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
                  title="Copy Token"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 text-left p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900">
            <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Security Notice:</strong> This QR code is single-use and verifies that the volunteer is collecting the correct designated food.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickupQRModal;
