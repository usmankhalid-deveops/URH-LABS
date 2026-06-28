/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Sparkles, 
  ArrowUpRight, 
  HelpCircle, 
  Mic, 
  Sliders, 
  AudioLines, 
  FolderSync, 
  Radio, 
  History, 
  TrendingUp,
  Award,
  Database,
  LogOut
} from "lucide-react";
import { UserProfile, ActivePage, HistoryItem } from "../types";

interface DashboardProps {
  user: UserProfile | null;
  history: HistoryItem[];
  setActivePage: (page: ActivePage) => void;
  onLogout: () => void;
}

export default function Dashboard({ user, history, setActivePage, onLogout }: DashboardProps) {
  // Safe bounds for credits computations
  const totalAllocated = user?.plan === "Free Plan" ? 50000 : 
                         user?.plan === "1M Characters" ? 1000000 :
                         user?.plan === "3M Characters" ? 3000000 :
                         user?.plan === "5M Characters" ? 5000000 :
                         user?.plan === "11M Characters" ? 11000000 : 50000;

  const remaining = user?.credits ?? 0;
  const consumed = Math.max(0, totalAllocated - remaining);
  const percentUsed = totalAllocated > 0 ? (consumed / totalAllocated) * 100 : 0;
  const circum = 2 * Math.PI * 70; // r=70 stroke-dasharray

  const quickTools = [
    { id: "text-to-speech", name: "Text to speech", desc: "Synthesize high-fidelity voice profiles.", icon: AudioLines, color: "text-[#00f0ff] hover:bg-[#00f0ff]/5" },
    { id: "speech-to-text", name: "Speech to text", desc: "Ultra-accurate neural transcription & paragraphs.", icon: Mic, color: "text-[#00ff66] hover:bg-[#00ff66]/5" },
    { id: "voice-cloning", name: "Voice clone", desc: "Clone any voice footprint from audio snippets.", icon: Sparkles, color: "text-purple-400 hover:bg-purple-400/5" },
    { id: "voice-design", name: "Voice design", desc: "Design custom synthetic voices with advanced morphing parameters.", icon: Sliders, color: "text-rose-400 hover:bg-rose-400/5" },
    { id: "voice-conversion", name: "Voice converter", desc: "Transform any audio track's speaker identity with ease.", icon: FolderSync, color: "text-[#00f0ff] hover:bg-[#00f0ff]/5" },
    { id: "dubbing", name: "Dubbing app", desc: "Translate and lip-sync video/audio content seamlessly.", icon: Radio, color: "text-teal-400 hover:bg-teal-400/5" },
    { id: "podcast-studio", name: "Postcard studio", desc: "Draft high-retention audio scripts and multitrack podcasts.", icon: Radio, color: "text-amber-400 hover:bg-amber-400/5" },
  ];

  // Render beautiful interactive SVG charts representing weekly characters activity
  const weeklyData = [
    { day: "Mon", chars: 14500 },
    { day: "Tue", chars: 32000 },
    { day: "Wed", chars: 21000 },
    { day: "Thu", chars: 48000 },
    { day: "Fri", chars: consumed > 100 ? consumed * 0.4 : 12000 },
    { day: "Sat", chars: consumed > 100 ? consumed * 0.2 : 8000 },
    { day: "Sun", chars: consumed > 100 ? remaining * 0.05 : 15000 },
  ];

  const maxVal = Math.max(...weeklyData.map(d => d.chars), 10000);

  return (
    <div className="space-y-8">
      {/* Promotional plan warning / option to navigate to Billing */}
      {user && user.offeredPlans && user.offeredPlans.length > 0 && (
        <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Award className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Administration Offered a Premium Plan Promotion!</h4>
              <p className="text-gray-400 text-xs">You have pre-approved promotional plan offers waiting. Go to Billing to claim them instantly.</p>
            </div>
          </div>
          <button
            onClick={() => setActivePage("billing")}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:brightness-105 text-black font-extrabold text-xs tracking-wide transition-all shrink-0 cursor-pointer"
          >
            Claim Promotional Offer
          </button>
        </div>
      )}

      {/* SaaS Greeting Card */}
      <div className="relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-gray-950 via-black to-slate-950 border border-[#00f0ff]/15 shadow-[0_0_50px_rgba(0,240,255,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-[#00f0ff]/10 to-[#00ff66]/5 blur-3xl pointer-events-none rounded-full" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[10px] text-[#00f0ff] font-mono tracking-wider uppercase">
            ⚡ Premium Access Node Enabled
          </div>
          <h2 className="text-3xl font-black font-sans tracking-tight text-white md:text-4xl">
            Welcome to the Future of Sound, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#00ff66] to-[#00f0ff]">{user?.name}</span>!
          </h2>
          <p className="text-gray-400 text-sm max-w-xl">
            Synthesize voice scripts, clone timber biometric cards, and create high-retention podcasts within our secure, fully glassed neural cluster dashboard.
          </p>
        </div>

        <button 
          onClick={() => setActivePage("text-to-speech")}
          className="relative group shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,102,0.5)] transition-all flex items-center justify-center gap-2"
        >
          <span>Instantiate Synthesis</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>

      {/* Analytics Bento Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Circle Progress Tracker Card */}
        <div className="p-6 rounded-2xl bg-black border border-white/5 flex flex-col items-center justify-between min-h-[300px] relative overflow-hidden group">
          <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-[#00f0ff] to-transparent" />
          <h3 className="text-sm font-semibold text-gray-300 font-sans tracking-wide self-start flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00f0ff]" /> Credits Circular Progress
          </h3>

          {/* Interactive Radial Gauge with real numeric indicators */}
          <div className="relative my-4 flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
              {/* Outer boundary buffer */}
              <circle cx="80" cy="80" r="70" stroke="#1c1c1f" strokeWidth="8" fill="transparent" />
              {/* Active neon highlight overlay */}
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                stroke="url(#neonBlueGrad)" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 70}
                strokeDashoffset={(circum - (percentUsed / 100) * circum)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: "drop-shadow(0 0 6px #00f0ff)" }}
              />
              <defs>
                <linearGradient id="neonBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#00ff66" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center quantitative label */}
            <div className="absolute text-center">
              <span className="text-2xl font-black text-white font-mono">{percentUsed.toFixed(1)}%</span>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Consumed</p>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 text-center border-t border-white/5 pt-4">
            <div>
              <span className="text-[10px] text-gray-500 font-mono block uppercase">Allocated Total</span>
              <span className="text-sm font-semibold font-mono text-white">
                {user?.role === "admin" ? "∞ (10M)" : totalAllocated.toLocaleString()}
              </span>
            </div>
            <div className="border-l border-white/5">
              <span className="text-[10px] text-[#00ff66] font-mono block uppercase">Fidelity Left</span>
              <span className="text-sm font-semibold font-mono text-[#00ff66]">
                {user?.role === "admin" ? "Infinite" : remaining.toLocaleString()} Chars
              </span>
              <span className="text-[8px] text-gray-500 font-mono block mt-0.5">
                As of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Character Usage Visual Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-black border border-white/5 flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
          <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-[#00ff66] to-transparent" />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300 font-sans tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00ff66]" /> Weekly Vocal Activity Load
            </h3>
            <span className="text-[10px] font-mono text-gray-500">Scale max: {maxVal.toLocaleString()} Chars</span>
          </div>

          {/* Premium Custom SVG graph with nice labels and glowing nodes */}
          <div className="w-full h-40 flex items-end justify-between px-2 pt-6">
            {weeklyData.map((d, index) => {
              const rectHeight = (d.chars / maxVal) * 110; // Scaling height physically
              return (
                <div key={d.day} className="flex flex-col items-center gap-2 w-full group/bar cursor-pointer">
                  <div className="w-10 flex flex-col items-center relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-gray-900 border border-[#00f0ff]/30 text-[9px] font-mono text-white py-0.5 px-1.5 rounded z-10 pointer-events-none whitespace-nowrap shadow-xl">
                      {Math.round(d.chars).toLocaleString()} Chars
                    </div>
                    {/* Chart Pillar bar */}
                    <div 
                      style={{ height: `${Math.max(4, rectHeight)}px` }}
                      className="w-4 bg-gradient-to-t from-[#00f0ff]/20 to-[#00f0ff]/80 rounded-t-sm group-hover/bar:to-[#00ff66] shadow-[0_0_10px_rgba(0,240,255,0.1)] group-hover/bar:shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all duration-500" 
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-500 group-hover/bar:text-white transition-colors">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5 font-mono">
              <Award className="w-3.5 h-3.5 text-[#00ff66]" /> Subscribed plan: <b className="text-white font-sans">{user?.plan}</b>
            </span>
            <span className="font-mono text-[10px]">
              Active session metrics computed at UTC time
            </span>
          </div>
        </div>

      </div>

      {/* Bento Stats Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0b0c10]/70 border border-white/5 flex flex-col gap-1 shadow-sm">
          <span className="text-[10px] font-medium uppercase font-mono tracking-wider text-gray-500">Total Characters Left</span>
          <span className="text-2xl font-black text-white tracking-tight font-mono">
            {user?.role === "admin" ? "Infinite" : remaining.toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-[#0b0c10]/70 border border-white/5 flex flex-col gap-1 shadow-sm">
          <span className="text-[10px] font-medium uppercase font-mono tracking-wider text-gray-500">Active Voice Clones</span>
          <span className="text-2xl font-black text-[#00f0ff] tracking-tight font-mono">
            {history.filter((h) => h.tool === "Voice Cloning").length + 1}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-[#0b0c10]/70 border border-white/5 flex flex-col gap-1 shadow-sm">
          <span className="text-[10px] font-medium uppercase font-mono tracking-wider text-gray-500">History Log count</span>
          <span className="text-2xl font-black text-[#00ff66] tracking-tight font-mono">
            {history.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-[#0b0c10]/70 border border-white/5 flex flex-col gap-1 shadow-sm">
          <span className="text-[10px] font-medium uppercase font-mono tracking-wider text-gray-500">Portal Tier Profile</span>
          <span className="text-lg font-bold text-white tracking-tight leading-8 truncate pr-1">
            {user?.role === "admin" ? "Systems Root" : "Standard User"}
          </span>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight text-white mb-2">
          Primary Voice AI Engines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActivePage(tool.id as ActivePage)}
                className={`p-5 rounded-xl bg-gradient-to-b from-gray-950 to-black border border-white/5 hover:border-[#00f0ff]/30 text-left transition-all duration-300 relative overflow-hidden group cursor-pointer`}
              >
                {/* Thin side light highlight */}
                <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-[#00f0ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-lg bg-white/5 ${tool.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-[#00ff66] translate-y-1 -translate-x-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                </div>
                <div className="mt-4 space-y-1">
                  <h4 className="font-bold text-sm text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Account Session & Plan Health Node */}
      {(() => {
        const remainingPct = totalAllocated > 0 ? (remaining / totalAllocated) * 100 : 0;
        return (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-950 via-black to-slate-950 border border-[#00f0ff]/15 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#00ff66]/5 blur-3xl pointer-events-none rounded-full" />
            
            <h3 className="text-lg font-bold tracking-tight text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#00ff66]" /> Account & Subscription Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
              {/* User Email & Logout segment */}
              <div className="space-y-2 border-r border-white/5 pr-4">
                <span className="text-[10px] font-mono font-bold tracking-wider text-gray-500 uppercase block">Account Identity</span>
                <p className="text-sm font-semibold text-white truncate font-sans">{user?.email || "No Email Registered"}</p>
                
                <button
                  onClick={onLogout}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  Log out of your account
                </button>
              </div>

              {/* Package Information */}
              <div className="space-y-1.5 border-r border-white/5 pr-4">
                <span className="text-[10px] font-mono font-bold tracking-wider text-gray-500 uppercase block">Package Tier</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-xs text-[#00f0ff] font-bold">
                    {user?.plan || "Free Plan"}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono">Premium Neural Allocation</p>
              </div>

              {/* Usage Counters */}
              <div className="space-y-1.5 border-r border-white/5 pr-4">
                <span className="text-[10px] font-mono font-bold tracking-wider text-gray-500 uppercase block">Usage Breakdown</span>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Characters used:</span>
                    <span className="text-white font-mono font-bold">{consumed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Remaining:</span>
                    <span className="text-[#00ff66] font-mono font-black">{remaining.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Plan Health & Remaining Gauge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-500 font-bold font-mono">
                  <span>Plan Health</span>
                  <span className="text-[#00ff66]">{remainingPct.toFixed(1)}% Left</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 border border-white/5 overflow-hidden">
                  <div 
                    style={{ width: `${remainingPct}%` }}
                    className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.4)] transition-all duration-500 rounded-full"
                  />
                </div>
                <p className="text-[9px] text-gray-500 font-mono">Package capacity status</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Recent Telemetry Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Recent Studio Logs
          </h3>
          <button 
            onClick={() => setActivePage("history")}
            className="text-xs font-mono text-[#00f0ff] hover:text-[#00ff66] hover:underline"
          >
            Show full history audit
          </button>
        </div>

        {history.length === 0 ? (
          <div className="p-8 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
            <History className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm font-semibold text-gray-300">No requests log found on current session</p>
            <p className="text-xs text-gray-500">Run some text interactions inside the voice tools page to generate logs</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-gray-950 to-black divide-y divide-white/5">
            {history.slice(0, 3).map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 transition-colors">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 rounded bg-white/5 text-[#00f0ff] font-mono text-xs text-center border border-white/5 min-w-[110px]">
                    {item.tool}
                  </div>
                  <div>
                    <p className="text-xs text-gray-300 font-sans line-clamp-1 italic">
                      "{item.request}"
                    </p>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                  <span className="text-gray-400">
                    Consumed: <b className="text-[#00ff66]">{item.creditsUsed.toLocaleString()} URH</b>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
