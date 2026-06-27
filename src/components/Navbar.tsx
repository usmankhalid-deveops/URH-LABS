/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Radio, HelpCircle, HardDriveDownload, UserCheck, Shield, Menu } from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  user: UserProfile | null;
  onContactShortcut: () => void;
  isRealFirebase: boolean;
  onOpenSidebar: () => void;
}

export default function Navbar({ user, onContactShortcut, isRealFirebase, onOpenSidebar }: NavbarProps) {
  return (
    <nav className="h-16 border-b border-[#00f0ff]/10 bg-black/45 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Search/Dashboard Status indicators */}
      <div className="flex items-center gap-2 sm:gap-6">
        {/* Mobile Hamburger menu toggle button */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#00ff66]/30 text-gray-300 hover:text-[#00ff66] transition-all cursor-pointer flex items-center justify-center shrink-0"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

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
          className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-medium hover:border-[#00ff66]/30 text-gray-300 hover:text-[#00ff66] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
          <span className="hidden sm:inline">Support desk</span>
        </button>

        {/* Database Status Tag */}
        <div className={`px-2 py-1.5 rounded text-[10px] font-mono font-bold uppercase border flex items-center gap-1 shrink-0 ${
          isRealFirebase 
            ? "bg-emerald-950/20 text-[#00ff66] border-[#00ff66]/20" 
            : "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/20"
        }`}>
          <span className="hidden xs:inline md:inline">Db:</span>
          <span>{isRealFirebase ? "Live" : "Sandbox"}</span>
        </div>

        {/* Credit Indicator Token */}
        {user && (
          <>
            <div className="hidden sm:flex flex-col text-right font-mono text-[10px] text-gray-400 shrink-0 border-r border-white/10 pr-4">
              <div>
                <span>Used: </span>
                <span className="text-[#00ff66] font-bold">
                  {Math.floor((user.usedDuration || 0) / 3600) > 0 ? `${Math.floor((user.usedDuration || 0) / 3600)}h ` : ""}
                  {Math.floor(((user.usedDuration || 0) % 3600) / 60)}m {(user.usedDuration || 0) % 60}s
                </span>
              </div>
              <div>
                <span>Remaining: </span>
                <span className="text-[#00f0ff] font-bold">
                  {(() => {
                    const rem = Math.max(0, (user.totalPackageDuration || 7200) - (user.usedDuration || 0));
                    return `${Math.floor(rem / 3600) > 0 ? `${Math.floor(rem / 3600)}h ` : ""}${Math.floor((rem % 3600) / 60)}m ${rem % 60}s`;
                  })()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#00f0ff]/10 to-[#00ff66]/5 pl-2 pr-3 sm:pl-3 sm:pr-4 py-1.5 rounded-full border border-[#00f0ff]/20 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#00ff66] animate-spin-slow" />
              <span className="text-[10px] sm:text-xs font-sans text-gray-300 font-medium">
                {user.role === "admin" ? "∞ Admin" : `${user.credits.toLocaleString()} Ch`}
              </span>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
