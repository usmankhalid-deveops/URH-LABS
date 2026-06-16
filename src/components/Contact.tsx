/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, PhoneCall, HeartHandshake, AlertCircle, Check, Send, ShieldAlert, RefreshCcw } from "lucide-react";

export default function Contact() {
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate real mail sending or ticketing
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTicketSubject("");
      setTicketMessage("");
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Informational Column */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Support Greeting Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-950 to-black border border-white/5 space-y-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#00ff66]/5 rounded-full blur-xl pointer-events-none" />
          <h2 className="text-xl font-bold text-white flex items-center gap-1.5 font-sans">
            <HeartHandshake className="text-[#00ff66] w-5 h-5 animate-pulse" /> Support Command Center
          </h2>
          <p className="text-xs text-gray-400">
            Encountering latency delays or authentication exceptions? Our support engineers are standing by globally and locally in Pakistan.
          </p>
        </div>

        {/* Official Channels Deck */}
        <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">Official Channels</h4>
          
          <div className="space-y-4 font-mono text-xs text-gray-300">
            
            {/* Email contact */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#00f0ff]/10 text-[#00f0ff]">
                <Mail className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Email Desk</span>
                <a 
                  href="mailto:usmankhalid619131ics@gmail.com" 
                  className="text-white hover:text-[#00ff66] font-bold text-xs underline truncate block select-all"
                >
                  usmankhalid619131ics@gmail.com
                </a>
              </div>
            </div>

            {/* Phone support */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#00ff66]/10 text-[#00ff66]">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Hotline Telephone</span>
                <a 
                  href="tel:03316865783" 
                  className="text-white hover:text-[#00f0ff] font-bold text-xs select-all block font-mono"
                >
                  03316865783
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Security Warning Card */}
        <div className="p-5 rounded-2xl bg-[#090500]/50 border border-amber-500/20 text-xs text-gray-400 space-y-1.5 font-sans">
          <span className="font-extrabold text-amber-500 uppercase font-mono tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-4 h-4" /> Security Safeguard notice:
          </span>
          <p className="leading-relaxed">
            Support staff will **NEVER** solicit your password credentials, API keys, or private wallet pin numbers. Safeguard your secrets strictly. If any anomalous system telemetry is discovered, contact the supervisor at once.
          </p>
        </div>

      </div>

      {/* Support Interactive Ticket Submit Form */}
      <div className="lg:col-span-7 p-6 rounded-2xl bg-black border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 font-mono uppercase pb-3 border-b border-white/5">
          ✏️ File a Developer Ticket
        </h3>

        {success ? (
          <div className="p-8 bg-[#00ff66]/5 border border-[#00ff66]/20 rounded-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#00ff66]/10 text-[#00ff66] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 animate-ping" />
            </div>
            <h4 className="font-bold text-white text-base">Developer ticket submitted!</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              We recorded your message under trace ID URH-TKT-{Math.floor(Math.random() * 90000 + 10000)}. Our support engineers will follow up with you at usmankhalid619131ics@gmail.com shortly.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="px-4 py-2 rounded bg-white/5 text-xs text-white border border-white/10"
            >
              Raise another query
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-gray-500 font-bold uppercase text-[10px]">Subject or affected AI Tool</label>
              <input 
                type="text" 
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Voice Cloning timbre feedback loop delay"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-sans"
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 font-bold uppercase text-[10px]">Describe problem details</label>
              <textarea 
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                rows={6}
                placeholder="List exact steps to reproduce the exception or request pricing clearing update..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white font-sans focus:outline-none focus:border-[#00f0ff]/50"
                required 
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00ff66] hover:brightness-105 text-black font-extrabold text-sm tracking-wide shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin text-black" />
                  <span>Submitting request...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-black" />
                  <span>Transmit ticket to USMAN Labs</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
