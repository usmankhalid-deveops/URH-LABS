/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Radio, HelpCircle, HardDriveDownload, UserCheck, Shield } from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  user: UserProfile | null;
  onContactShortcut: () => void;
  isRealFirebase: boolean;
}

export default function Navbar({ user, onContactShortcut, isRealFirebase }: NavbarProps) {
  return (
    <nav className="h-16 border-b border-[#00f0ff]/10 bg-black/45 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Search/Dashboard Status indicators */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
          <span className="text-xs font-mono text-gray-400">
            Node Cloud State: <span className="text-[#00ff66] font-bold">Online</span>
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-2 border-l border-white/10 pl-6">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
          <span className="text-xs font-mono text-gray-400">
            API Gateway: <span className="text-[#00f0ff] font-bold">Active</span>
          </span>
        </div>
      </div>

      {/* Dynamic User Indicators and System Options */}
      <div className="flex items-center gap-4">
        {/* Support Center Shortcut */}
        <button 
          onClick={onContactShortcut}
          className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-medium hover:border-[#00ff66]/30 text-gray-300 hover:text-[#00ff66] transition-all flex items-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
          Support desk
        </button>

        {/* Database Status Tag */}
        <div className={`px-2.5 py-1.5 rounded text-[10px] font-mono font-bold uppercase border flex items-center gap-1 ${
          isRealFirebase 
            ? "bg-emerald-950/20 text-[#00ff66] border-[#00ff66]/20" 
            : "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/20"
        }`}>
          <span>Db:</span>
          <span>{isRealFirebase ? "Firebase Live" : "Local Sandbox"}</span>
        </div>

        {/* Credit Indicator Token */}
        {user && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#00f0ff]/10 to-[#00ff66]/5 pl-3 pr-4 py-1.5 rounded-full border border-[#00f0ff]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#00ff66] animate-spin-slow" />
            <span className="text-xs font-sans text-gray-300">
              Allocated: <b className="text-white font-mono">{user.role === "admin" ? "Infinite" : user.credits.toLocaleString()}</b>
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
