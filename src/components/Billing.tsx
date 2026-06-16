/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Check, 
  HelpCircle, 
  Upload, 
  CreditCard, 
  DollarSign, 
  PhoneCall, 
  ShieldCheck, 
  Clock, 
  Coins, 
  UserPlus
} from "lucide-react";
import { UserProfile, PaymentRequest, SaaSPlan } from "../types";
import { FirebaseIntegration } from "../firebase";

interface BillingProps {
  user: UserProfile | null;
  onRefreshUser: () => void;
  onRequestSubmitted: () => void;
}

export default function Billing({ user, onRefreshUser, onRequestSubmitted }: BillingProps) {
  const [isYearly, setIsYearly] = useState(false);
  
  // Forms states
  const [payAmount, setPayAmount] = useState(4000);
  const [selectedPlan, setSelectedPlan] = useState("1M Characters");
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // SaaS character pricing plan declarations
  const plans: SaaSPlan[] = [
    {
      id: "free",
      name: "Free Plan",
      credits: 50000,
      creditsDisplay: "50k Characters",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "Access to standard TTS synthesis",
        "Dual speaker Speech to Text translation",
        "Standard 128kbps vocal bitrate",
        "Session diagnostics & terminal console"
      ]
    },
    {
      id: "1m",
      name: "1M Characters",
      credits: 1000000,
      creditsDisplay: "1,000,000 Chars",
      monthlyPrice: 4000, // PKR pricing fits Easypaisa transfers perfectly!
      yearlyPrice: 32000,
      features: [
        "Include deep-neural voice cloning",
        "Vocal Architecture Voice Design studio",
        "Fast synthesis response queue (+2x priority)",
        "30-sec Short Podcast script tracks compilation",
        "Studio grade 320kbps audio playbacks"
      ],
      isPopular: true
    },
    {
      id: "3m",
      name: "3M Characters",
      credits: 3000000,
      creditsDisplay: "3,000,000 Chars",
      monthlyPrice: 9000,
      yearlyPrice: 72000,
      features: [
        "All 1M Character tier functions",
        "Dubbing Sync script lip-align overlays",
        "Save unlimited biometric voice prints",
        "Long podcast composer scripts (up to 4 speakers)",
        "Premium API Access token gateway"
      ]
    },
    {
      id: "5m",
      name: "5M Characters",
      credits: 5000000,
      creditsDisplay: "5,000,000 Chars",
      monthlyPrice: 14000,
      yearlyPrice: 112000,
      features: [
        "All 3M Character tier functions",
        "High affinity neural conversions (unlocked)",
        "Custom formant pitch adjusters enabled",
        "Dedicated VIP webhook endpoints",
        "Premium discord help desk queue"
      ]
    },
    {
      id: "11m",
      name: "11M Characters",
      credits: 11000000,
      creditsDisplay: "11,000,000 Chars",
      monthlyPrice: 29000,
      yearlyPrice: 232000,
      features: [
        "Maximum acoustic throughput limit",
        "Infinite target voice design layers",
        "Exclusive early access to newly deployed models",
        "Personal server-side engineers mapping custom models",
        "Complete commercial distribution clearance"
      ]
    }
  ];

  // Image upload to Base64 extractor
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit manual top-up query
  const handlePaymentRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!screenshotBase64) {
      alert("Please upload your transaction screenshot receipt to proceed.");
      return;
    }

    setIsUploading(true);
    try {
      await FirebaseIntegration.createPaymentRequest(
        user.uid,
        payAmount,
        screenshotBase64,
        user.name,
        user.email
      );
      setFormSuccess(true);
      setScreenshotBase64(null);
      onRequestSubmitted();
      onRefreshUser();
    } catch (err: any) {
      console.error(err);
      alert("Billing interface error. Unable to file transaction receipt.");
    } finally {
      setIsUploading(false);
    }
  };

  const getPKRPriceString = (p: SaaSPlan, yearly: boolean) => {
    if (p.monthlyPrice === 0) return "Free";
    const price = yearly ? p.yearlyPrice : p.monthlyPrice;
    return `PKR ${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-12">
      
      {/* Upper Segment: Monthly/Yearly plans display */}
      <div className="space-y-6 text-center">
        <h2 className="text-3xl font-black text-white tracking-tight">Select your Character Threshold</h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Secure character credits immediately. Premium tiers unlock voice cloning, lip-sync dubbing, and deep custom acoustics.
        </p>

        {/* Toggle option */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className={`text-xs font-semibold ${!isYearly ? "text-[#00f0ff]" : "text-gray-400"}`}>Monthly Rate</span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="w-12 h-6 rounded-full bg-white/10 p-1 flex items-center transition-all focus:outline-none"
          >
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] transition-transform ${isYearly ? "translate-x-6" : ""}`} />
          </button>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${isYearly ? "text-[#00ff66]" : "text-gray-400"}`}>
            Yearly Rate <span className="bg-[#00ff66]/15 text-[#00ff66] text-[9px] px-1.5 py-0.5 rounded-full font-mono">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {plans.map((p) => (
          <div 
            key={p.id}
            className={`p-5 rounded-2xl bg-[#060608] border relative flex flex-col justify-between transition-all duration-300 ${
              p.isPopular 
                ? "border-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.08)] bg-slate-950/20" 
                : "border-white/5 hover:border-white/15"
            }`}
          >
            {p.isPopular && (
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow">
                Best Value
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">{p.name}</h4>
                <p className="text-xl font-bold font-sans mt-2 text-transparent bg-clip-text bg-gradient-to-br from-[#00f0ff] to-[#00ff66]">
                  {p.creditsDisplay}
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-black text-white">{getPKRPriceString(p, isYearly)}</span>
                  <span className="text-[10px] text-gray-500 font-mono">/{isYearly ? "yr" : "mo"}</span>
                </div>
              </div>

              <ul className="space-y-2 border-t border-white/5 pt-4 text-[11px] text-gray-400">
                {p.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#00ff66] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {p.monthlyPrice > 0 && (
              <button
                onClick={() => {
                  setPayAmount(isYearly ? p.yearlyPrice : p.monthlyPrice);
                  setSelectedPlan(p.name);
                  // Scroll dynamically down to checkout form
                  document.getElementById("manual-payment-box")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white hover:text-[#00ff66] border border-white/10 hover:border-[#00ff66]/40 text-xs font-bold transition-all cursor-pointer"
              >
                Top-up through transfer
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Manual localized mobile wallet transfers box */}
      <div id="manual-payment-box" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-white/5">
        
        {/* Left instructions block */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-gradient-to-b from-gray-950 to-black border border-white/5 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#00ff66]/10 border border-[#00ff66]/20 text-[10px] text-[#00ff66] font-mono uppercase tracking-wider">
              🟢 Manual Payment verification Engine
            </div>
            <h3 className="text-xl font-bold text-white font-sans">100% Secure PKR Mobile Wallet Transfers</h3>
            <p className="text-gray-400 text-xs">
              Due to local payment constraints, character top-ups are cleared quickly through manual review. Simply send the money using the wallet accounts listed below, upload your receipt transcript screenshot, and credits will be credited to your account instantly!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* JazzCash option card */}
            <div className="p-4 rounded-xl bg-amber-950/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 font-bold text-xs flex items-center justify-center border border-yellow-500/20">
                  JC
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-white">JazzCash Wallet</h5>
                  <span className="text-[10px] text-[#00ff66] font-mono">Auto clearing (24 Hour)</span>
                </div>
              </div>
              <div className="bg-black/50 p-2.5 rounded border border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400">Account #:</span>
                <span className="text-sm font-black font-mono text-white tracking-widest fill-white select-all">
                  03316865783
                </span>
              </div>
            </div>

            {/* Easypaisa option card */}
            <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00ff66]/10 text-[#00ff66] font-bold text-xs flex items-center justify-center border border-[#00ff66]/20">
                  EP
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-white">Easypaisa Wallet</h5>
                  <span className="text-[10px] text-[#00f0ff] font-mono">Immediate Validation</span>
                </div>
              </div>
              <div className="bg-black/50 p-2.5 rounded border border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400">Account #:</span>
                <span className="text-sm font-black font-mono text-white tracking-widest select-all">
                  03323200482
                </span>
              </div>
            </div>

          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs text-gray-400">
            <span className="font-bold text-white flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-500" /> Administrative review timelines:
            </span>
            <p className="leading-relaxed font-sans">
              Our support desk processes transactions round the clock. Approvals typically take between 5 to 30 minutes. Once cleared, your character allowances update in real-time.
            </p>
          </div>
        </div>

        {/* Right receipt upload form */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-black border border-white/5 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 font-mono flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-[#00f0ff]" /> Confirm Transfer
          </h4>

          {formSuccess ? (
            <div className="p-6 bg-[#00ff66]/5 border border-[#00ff66]/20 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#00ff66]/10 text-[#00ff66] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 animate-pulse" />
              </div>
              <h5 className="font-bold text-white text-base">Receipt Submitted Successfully!</h5>
              <p className="text-xs text-gray-400">
                The secure transaction bundle has been forwarded to our support administration. Your profile statistics will refresh immediately upon approval.
              </p>
              <button
                onClick={() => setFormSuccess(false)}
                className="mt-2 px-4 py-2 rounded bg-white/5 text-xs text-white border border-white/10"
              >
                File another ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handlePaymentRequestSubmit} className="space-y-4 text-xs font-mono text-gray-400">
              
              <div className="space-y-1">
                <label className="text-gray-500 uppercase font-bold text-[10px]">Select Desired Top-up Tier</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => {
                    setSelectedPlan(e.target.value);
                    const matchedPlan = plans.find((p) => p.name === e.target.value);
                    if (matchedPlan) setPayAmount(isYearly ? matchedPlan.yearlyPrice : matchedPlan.monthlyPrice);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-gray-100"
                >
                  <option value="1M Characters">1M Characters (PKR {isYearly ? "32,000" : "4,000"})</option>
                  <option value="3M Characters">3M Characters (PKR {isYearly ? "72,000" : "9,000"})</option>
                  <option value="5M Characters">5M Characters (PKR {isYearly ? "112,000" : "14,000"})</option>
                  <option value="11M Characters">11M Characters (PKR {isYearly ? "232,000" : "29,000"})</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase font-bold text-[10px]">Verify Executed Transfer Amount (PKR)</label>
                <input 
                  type="number" 
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" 
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 uppercase font-bold text-[10px]">Upload Transfer screenshot receipt</label>
                <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-4 bg-white/5 relative hover:border-[#00f0ff]/30 transition-colors">
                  <Upload className="w-6 h-6 text-[#00f0ff] mb-2" />
                  <span className="text-[10px] text-gray-400 text-center">Drag screenshot here or click</span>
                  <input 
                    type="file" 
                    id="screenshot-input" 
                    accept="image/*" 
                    onChange={handleScreenshotChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {screenshotBase64 && (
                <div className="p-2 bg-white/5 border border-white/5 rounded-lg text-center space-y-1.5">
                  <span className="text-[10px] text-gray-500 block">Screenshot registered:</span>
                  <img 
                    src={screenshotBase64} 
                    alt="Billing Screen Transcript" 
                    className="max-h-24 mx-auto rounded border border-white/10"
                  />
                  <button 
                    type="button" 
                    onClick={() => setScreenshotBase64(null)} 
                    className="text-[9px] text-red-400 hover:underline"
                  >
                    Delete photo and select new
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading || !screenshotBase64}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00ff66] hover:brightness-105 text-black font-extrabold text-sm tracking-wide shadow disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUploading ? (
                  <span>Recording payment request...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>Submit Payment Ticket</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Feature comparison list */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white tracking-tight text-center">Comprehensive SaaS Feature Grid</h3>
        <div className="overflow-hidden border border-white/5 rounded-2xl bg-[#060608]">
          <table className="w-full border-collapse text-left text-xs font-sans text-gray-400">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-gray-300 font-mono uppercase text-[10px]">
                <th className="p-4 font-bold">Feature Name</th>
                <th className="p-4 font-bold">Free Plan</th>
                <th className="p-4 font-bold">Standard 1M / 3M</th>
                <th className="p-4 font-bold">VIP Elite 5M / 11M</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              <tr>
                <td className="p-4 text-white">Vocal synthesis (TTS)</td>
                <td className="p-4 text-[#00ff66]">Standard Model</td>
                <td className="p-4 text-white">High Quality (Neural)</td>
                <td className="p-4 text-[#00f0ff] font-bold">Ultra Finesse</td>
              </tr>
              <tr>
                <td className="p-4 text-white">Speech Transcription (STT)</td>
                <td className="p-4 text-white">15 MB limit</td>
                <td className="p-4 text-white">50 MB limit</td>
                <td className="p-4 text-white font-bold">Unlimited Limit</td>
              </tr>
              <tr>
                <td className="p-4 text-white">Interactive Voice Cloning</td>
                <td className="p-4 text-gray-600">Locked</td>
                <td className="p-4 text-white">Up to 3 styles</td>
                <td className="p-4 text-[#00ff66] font-bold">Unlimited slots</td>
              </tr>
              <tr>
                <td className="p-4 text-white">Lip-Sync Dubbing overlays</td>
                <td className="p-4 text-gray-600">Locked</td>
                <td className="p-4 text-white">3 runs / day</td>
                <td className="p-4 text-white">Full scale</td>
              </tr>
              <tr>
                <td className="p-4 text-white">Podcast script drafts</td>
                <td className="p-4 text-gray-600">Locked</td>
                <td className="p-4 text-white">Standard</td>
                <td className="p-4 text-[#00f0ff] font-bold">Dedicated Writer Node</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
