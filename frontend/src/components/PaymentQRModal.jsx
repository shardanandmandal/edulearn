import React, { useState, useEffect } from 'react';
import {
  X, QrCode, CheckCircle2, Copy, Check, ShieldCheck,
  CreditCard, Smartphone, AlertCircle, ArrowRight, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export const PaymentQRModal = ({ course, onClose, onSuccess }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    const fetchQR = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.generateQR(course.id);
        if (res.success) {
          setQrData(res);
        } else {
          setError(res.message || 'Failed to generate QR code.');
        }
      } catch (err) {
        setError('Error connecting to payment gateway.');
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, [course.id]);

  const handleCopyUPI = () => {
    if (qrData?.upiId) {
      navigator.clipboard.writeText(qrData.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert('Please enter your 12-digit UPI Reference / UTR number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitUTR({
        courseId: course.id,
        utrNumber: utrNumber.trim(),
        note: `Paid via UPI for ${course.title}`
      });

      if (res.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });

        setSuccessResult(res);
        setTimeout(() => {
          onSuccess();
        }, 2200);
      } else {
        alert(res.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      alert('Failed to submit transaction reference.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Instant UPI QR Checkout</h2>
              <p className="text-xs text-slate-400">Scan & Pay to Unlock Course Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">Generating dynamic payment QR code...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-80" />
              <p className="text-sm">{error}</p>
            </div>
          ) : successResult ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">Payment Verified!</h3>
              <p className="text-sm text-slate-300 max-w-xs mx-auto">
                {successResult.message}
              </p>
              <div className="pt-2 text-xs text-indigo-400 flex items-center justify-center space-x-1 font-medium">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Redirecting to your classroom portal...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Course & Amount summary banner */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Course Enrolling:</span>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{course.title}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Payable:</span>
                  <div className="text-lg font-extrabold text-emerald-400">
                    ₹{qrData.amount}
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center">
                <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-indigo-500/30">
                  <img
                    src={qrData.qrDataUrl}
                    alt="UPI Payment QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 flex items-center space-x-1">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Scan with PhonePe, Google Pay, Paytm or any UPI app</span>
                </p>
              </div>

              {/* UPI ID Copy Field */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Payee UPI ID</div>
                  <div className="text-xs font-mono text-indigo-300 font-medium">{qrData.upiId}</div>
                  <div className="text-[10px] text-slate-400">Name: {qrData.payeeName}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Form to submit UTR */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    UPI Reference / UTR Number (12 Digits):
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 429012398451"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono tracking-wider"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Found in your UPI app receipt under "UPI Transaction ID" or "UTR".
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Verifying Transaction...</span>
                  ) : (
                    <>
                      <span>Submit Reference & Unlock Course</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Guarantee badge */}
              <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Immediate Access Verification • Secure Learner Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
