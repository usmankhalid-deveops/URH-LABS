/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  SquarePlay, 
  Settings, 
  LogOut, 
  Mic, 
  BookOpen, 
  Volume2, 
  FileText, 
  Users, 
  HelpCircle, 
  History, 
  CreditCard, 
  Code,
  Sparkles,
  RefreshCw,
  Sliders,
  AudioLines,
  UserCheck,
  ShieldCheck,
  X
} from "lucide-react";
import { ActivePage, UserProfile } from "../types";

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  user: UserProfile | null;
  onLogout: () => void;
  onToggleRole: () => void; // Development convenience helper
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activePage, setActivePage, user, onLogout, onToggleRole, isOpen, onClose }: SidebarProps) {
  // Sidebar items mapped to requested links
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Volume2 },
    { id: "text-to-speech", label: "Text to speech", icon: AudioLines, category: "AI Tools" },
    { id: "speech-to-text", label: "Speech to text", icon: Mic, category: "AI Tools" },
    { id: "voice-cloning", label: "Voice clone", icon: Sparkles, category: "AI Tools" },
    { id: "voice-design", label: "Voice design", icon: Sliders, category: "AI Tools" },
    { id: "voice-conversion", label: "Voice converter", icon: RefreshCw, category: "AI Tools" },
    { id: "dubbing", label: "Dubbing app", icon: SquarePlay, category: "AI Tools" },
    { id: "podcast-studio", label: "Postcard studio", icon: BookOpen, category: "AI Tools" },
    { id: "history", label: "Usage History", icon: History, category: "Account" },
    { id: "billing", label: "Billing & Credits", icon: CreditCard, category: "Account" },
    ...(user?.role === "admin" ? [{ id: "developers", label: "Developers API", icon: Code, category: "System" }] : []),
    { id: "settings", label: "Settings", icon: Settings, category: "System" },
  ];

  const categories = ["Overview", "AI Tools", "Account", "System"];

  return (
    <>
      {/* Mobile background overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-all duration-350 cursor-pointer pointer-events-auto"
          onClick={onClose}
        />
      )}

      <aside className={`w-68 bg-[#040406]/98 lg:bg-black/90 backdrop-blur-xl border-r border-[#00f0ff]/15 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } text-gray-300`}>
        {/* Platform Branded Header with Official URH Logo Graphic */}
        <div className="p-6 border-b border-[#00f0ff]/15 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Customized Logo using inline vectors representing requested official logo */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#00ff66] p-[1.5px] shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0">
              <div className="w-full h-full bg-black rounded-lg flex items-center justify-center overflow-hidden">
                <svg 
                  viewBox="0 0 100 100" 
                  className="w-8 h-8 text-[#00f0ff] animate-pulse"
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="5"
                >
                  <path d="M25 75V25C25 45 40 55 50 55C60 55 75 45 75 25V75" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M50 55V85" stroke="#00ff66" strokeLinecap="round" />
                  <circle cx="50" cy="55" r="5" fill="#00ff66" />
                  {/* Voice pulse indicator */}
                  <line x1="12" y1="50" x2="12" y2="60" stroke="#00f0ff" strokeWidth="4" strokeLinecap="round" />
                  <line x1="88" y1="50" x2="88" y2="60" stroke="#00f0ff" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                URH <span className="text-[#00f0ff] font-semibold text-lg">Labs</span>
              </h1>
              <span className="text-[9px] font-mono tracking-widest text-[#00ff66] uppercase animate-pulse">
                Neural Voice Node
              </span>
            </div>
          </div>

          {/* Close button - only visible on tablet and mobile viewports */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/20 text-gray-400 hover:text-red-400 transition-all cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
        {categories.map((cat) => {
          const items = menuItems.filter(item => 
            cat === "Overview" ? !item.category : item.category === cat
          );

          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-1">
              <span className="px-3 text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase">
                {cat}
              </span>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActivePage(item.id as ActivePage);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 relative group text-left ${
                          isActive
                            ? "bg-gradient-to-r from-[#00f0ff]/10 to-transparent text-white border-l-2 border-[#00f0ff]/80 shadow-[0_0_15px_rgba(0,240,255,0.05)]"
                            : "hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-colors ${
                          isActive ? "text-[#00f0ff]" : "text-gray-400 group-hover:text-[#00ff66]"
                        }`} />
                        <span className="font-medium">{item.label}</span>
                        
                        {/* Glow dot on hover */}
                        <span className={`absolute right-3 w-1.5 h-1.5 rounded-full bg-[#00ff66] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          isActive ? "opacity-100 bg-[#00f0ff]" : ""
                        }`} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {/* Administrator Node (Isolated Section) */}
        {user?.role === "admin" && (
          <div className="space-y-1 pt-4 border-t border-white/5">
            <span className="px-3 text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ff66]" /> Admin Console
            </span>
            <button
              onClick={() => {
                setActivePage("admin");
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 relative group text-left ${
                activePage === "admin"
                  ? "bg-gradient-to-r from-red-500/10 to-transparent text-[#00ff66] border-l-2 border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.05)]"
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4 text-[#00ff66]" />
              <span className="font-medium">Admin Panel</span>
              <span className="absolute right-3 bg-red-950/40 text-red-400 text-[9px] px-1.5 py-0.5 rounded border border-red-800/35">
                ROOT
              </span>
            </button>
          </div>
        )}
      </div>

      {/* User Session Footer Card */}
      <div className="p-4 border-t border-[#00f0ff]/15 bg-black/60 backdrop-blur-md">
        {user && (
          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/5 flex flex-col gap-1.5 relative overflow-hidden group">
            {/* Green glowing corner decoration */}
            <div className="absolute right-0 top-0 w-8 h-8 bg-gradient-to-br from-[#00f0ff]/10 to-[#00ff66]/10 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] flex items-center justify-center text-black text-xs font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-gray-400 truncate font-mono">{user.email}</p>
              </div>
            </div>

            {user.role !== "admin" ? (() => {
              const getPlanLimit = (planName: string): number => {
                if (planName === "1M Characters" || planName.includes("1M")) return 1000000;
                if (planName === "3M Characters" || planName.includes("3M")) return 3000000;
                if (planName === "5M Characters" || planName.includes("5M")) return 5000000;
                if (planName === "11M Characters" || planName.includes("11M")) return 11000000;
                return 50000; // Free Plan or fallback
              };

              const limit = getPlanLimit(user.plan);
              const remaining = Math.max(0, Math.min(limit, user.credits));
              const used = Math.max(0, limit - remaining);
              const remainingPct = Math.min(100, Math.max(0, (remaining / limit) * 100));

              return (
                <div className="space-y-2 pt-2 border-t border-white/5 text-[10px] font-mono text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Plan Package:</span>
                    <span className="text-white font-bold">{user.plan}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Used characters:</span>
                    <span className="text-rose-400 font-bold">{used.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Remaining characters:</span>
                    <span className="text-[#00ff66] font-extrabold">{user.credits.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-gray-500 font-mono">
                    <span>As of:</span>
                    <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {/* Real-time slider progress gauge */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[8px] uppercase tracking-wider text-gray-500 font-bold">
                      <span>Plan Health</span>
                      <span className="text-[#00ff66]">{remainingPct.toFixed(1)}% Left</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 border border-white/5 overflow-hidden">
                      <div 
                        style={{ width: `${remainingPct}%` }}
                        className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.4)] transition-all duration-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5 font-mono">
                <span className="text-gray-400">Credits:</span>
                <span className="text-[#00f0ff] font-bold">∞ (Admin)</span>
              </div>
            )}

            {/* Simulated convenient toggle button for easy testing */}
            {user.email.toLowerCase() === "usmankhalid619131@gmail.com" && (
              <button 
                onClick={onToggleRole}
                title="Dev mode: swap user <-> admin roles to inspect layout blocks instantly"
                className="mt-1 w-full text-[9px] font-mono text-gray-500 hover:text-[#00ff66] bg-black/40 py-1 rounded border border-white/5 hover:border-[#00ff66]/20 transition-all flex items-center justify-center gap-1"
              >
                <UserCheck className="w-3 h-3 text-gray-500 group-hover:text-[#00ff66]" />
                Role: <span className={user.role === "admin" ? "text-red-400" : "text-[#00f0ff]"}>{user.role.toUpperCase()}</span>
              </button>
            )}
          </div>
        )}

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-white p-2 rounded hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300 font-mono"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            Logout
          </span>
          <span>Quit</span>
        </button>
      </div>
    </aside>
    </>
  );
}
