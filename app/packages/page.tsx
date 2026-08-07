'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, CheckCircle, X, Upload, ImageIcon } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  price_rs: number;
  daily_cash: number;
  duration_days: number;
}

interface PaymentInfo {
  name: string;
  jazzcash: string;
  easypaisa: string;
}

const planConfig: Record<string, { gradient: string; badge: string; emoji: string }> = {
  Starter: { gradient: 'from-emerald-600/20 to-emerald-600/5', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', emoji: '🌱' },
  Basic: { gradient: 'from-blue-600/20 to-blue-600/5', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', emoji: '⚡' },
  Pro: { gradient: 'from-amber-600/20 to-amber-600/5', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', emoji: '🔥' },
  Elite: { gradient: 'from-rose-600/20 to-rose-600/5', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', emoji: '👑' },
};

export default function PackagesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [method, setMethod] = useState<'jazzcash' | 'easypaisa'>('jazzcash');
  const [form, setForm] = useState({ phone: '', transactionId: '', notes: '' });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/plans').then(r => r.json()).then(d => setPlans(d.plans || []));
    fetch('/api/payment-info').then(r => r.json()).then(d => setPaymentInfo(d));
  }, []);

  function handleSelectPlan(plan: Plan) {
    setSelected(plan);
    setError('');
    setSuccess('');
    setForm({ phone: '', transactionId: '', notes: '' });
    setScreenshot(null);
    setScreenshotPreview(null);
  }

  function handleClose() {
    setSelected(null);
    setError('');
  }

  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please upload an image file');
    if (file.size > 5 * 1024 * 1024) return setError('Image must be under 5MB');
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
    setError('');
  }

  async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    if (!data.secure_url) throw new Error('Upload failed');
    return data.secure_url;
  }

  async function handleSubmit() {
    if (!form.phone || form.phone.length < 10) return setError('Enter your valid phone number');
    if (!form.transactionId.trim()) return setError('Transaction ID is required');
    if (!screenshot) return setError('Payment screenshot is required');

    setLoading(true);
    setUploading(true);
    setError('');

    let screenshotUrl = '';
    try {
      screenshotUrl = await uploadToCloudinary(screenshot);
    } catch {
      setLoading(false);
      setUploading(false);
      return setError('Screenshot upload failed. Try again.');
    }
    setUploading(false);

    const res = await fetch('/api/user/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: selected!.id,
        phone: form.phone,
        method,
        transactionId: form.transactionId,
        screenshotUrl,
        notes: form.notes || null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error);
    setSelected(null);
    setSuccess('✅ Deposit submitted! Your plan will activate after admin approval.');
  }

  const paymentNumber = method === 'jazzcash' ? paymentInfo?.jazzcash : paymentInfo?.easypaisa;

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6 md:pt-24">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Packages</h1>
          <p className="text-gray-500 text-sm mt-1">Choose a plan · collect diamonds daily · withdraw as cash</p>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 mb-6">
            {success}
          </div>
        )}

        <div className="space-y-4">
          {plans.map(plan => {
            const config = planConfig[plan.name] ?? planConfig.Starter;
            const totalDiamonds = plan.daily_cash * plan.duration_days;
            const cashValue = Math.floor(totalDiamonds / 100) * 10;

            return (
              <div
                key={plan.id}
                className={`relative overflow-hidden border border-white/8 rounded-2xl bg-gradient-to-br ${config.gradient} hover:border-white/15 transition-all`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center text-xl">
                        {config.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold">{plan.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${config.badge}`}>
                            {plan.duration_days} days
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">{plan.daily_cash} 💎 daily reward</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-xl">Rs. {plan.price_rs}</p>
                      <p className="text-gray-500 text-xs">one time</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: 'Daily earn', value: `Rs. ${plan.daily_cash}` },
                      { label: 'Total earn', value: `Rs. ${(plan.daily_cash * plan.duration_days).toFixed(0)}` },
                      { label: 'Duration', value: `${plan.duration_days} days` },
                    ].map(stat => (
                      <div key={stat.label} className="bg-black/20 rounded-xl p-3 text-center">
                        <p className="text-white text-sm font-semibold">{stat.value}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full bg-white/8 hover:bg-white/12 border border-white/10 hover:border-amber-500/40 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
                  >
                    Subscribe to {plan.name} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-end md:items-center justify-center px-0 md:px-4 pb-0 md:pb-4">
            <div className="bg-[#111] border border-white/10 rounded-t-3xl md:rounded-2xl w-full max-w-md h-[92vh] md:max-h-[85vh] md:h-auto overflow-y-auto overscroll-contain">

              <div className="sticky top-0 bg-[#111] border-b border-white/8 px-5 py-4 rounded-t-3xl md:rounded-t-2xl flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">{selected.name} Plan</p>
                  <p className="text-gray-500 text-xs">Rs. {selected.price_rs} · {selected.duration_days} days</p>
                </div>
                <div className="pb-6">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
                  >
                    {uploading ? '📤 Uploading screenshot...' : loading ? 'Submitting...' : 'Submit Deposit Request'}
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-6">

                {/* Step 1 */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Step 1 — Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['jazzcash', 'easypaisa'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setMethod(m)}
                        className={`py-3 rounded-xl text-sm font-semibold border transition-all ${method === m
                          ? m === 'jazzcash'
                            ? 'bg-red-500/15 border-red-500/40 text-red-400'
                            : 'bg-green-500/15 border-green-500/40 text-green-400'
                          : 'bg-white/3 border-white/8 text-gray-400 hover:text-white'
                          }`}
                      >
                        {m === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2 */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Step 2 — Send Payment</p>
                  <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
                      <div>
                        <p className="text-gray-500 text-xs">Account Name</p>
                        <p className="text-white font-semibold text-sm mt-0.5">{paymentInfo?.name}</p>
                      </div>
                      <button onClick={() => copyToClipboard(paymentInfo?.name ?? '', 'name')} className="text-amber-400 hover:text-amber-300 transition-colors">
                        {copied === 'name' ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-xs">{method === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} Number</p>
                        <p className="text-white font-bold text-lg mt-0.5 tracking-wide">{paymentNumber}</p>
                      </div>
                      <button onClick={() => copyToClipboard(paymentNumber ?? '', 'number')} className="text-amber-400 hover:text-amber-300 transition-colors">
                        {copied === 'number' ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-start gap-2 px-1">
                    <span className="text-amber-400 text-xs mt-0.5">💡</span>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      Open your {method === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} app and send exactly <span className="text-white font-semibold">Rs. {selected.price_rs}</span> to the number above. Save your receipt.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Step 3 — Confirm Payment</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Your Phone Number</label>
                      <input
                        type="tel"
                        placeholder="03XX-XXXXXXX"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Transaction ID <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. TXN1234567890"
                        value={form.transactionId}
                        onChange={e => setForm({ ...form, transactionId: e.target.value })}
                        className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                      />
                      <p className="text-gray-600 text-xs mt-1">Found in your payment receipt or SMS</p>
                    </div>

                    {/* Screenshot upload */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Payment Screenshot <span className="text-red-400">*</span></label>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {screenshotPreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-white/8">
                          <img src={screenshotPreview} alt="Screenshot" className="w-full h-40 object-cover" />
                          <button
                            onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-lg flex items-center justify-center text-white hover:bg-black transition-colors"
                          >
                            <X size={14} />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-1.5">
                            <p className="text-white text-xs font-medium">✓ Screenshot attached</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="w-full border border-dashed border-white/15 hover:border-amber-500/40 bg-white/2 hover:bg-amber-500/5 rounded-xl p-6 flex flex-col items-center gap-2 transition-all"
                        >
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                            <ImageIcon size={20} className="text-gray-500" />
                          </div>
                          <p className="text-gray-400 text-sm font-medium">Upload Screenshot</p>
                          <p className="text-gray-600 text-xs">Tap to select from your gallery · Max 5MB</p>
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Notes <span className="text-gray-600">(optional)</span></label>
                      <textarea
                        placeholder="Any extra info for admin..."
                        value={form.notes}
                        onChange={e => setForm({ ...form, notes: e.target.value })}
                        rows={2}
                        className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
                >
                  {uploading ? '📤 Uploading screenshot...' : loading ? 'Submitting...' : 'Submit Deposit Request'}
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}