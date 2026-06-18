/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import AudioTools from "./components/AudioTools";
import Billing from "./components/Billing";
import Contact from "./components/Contact";
import AdminPanel from "./components/AdminPanel";
import Auth from "./components/Auth";
import ExtraPages from "./components/ExtraPages";
import LandingPage from "./components/LandingPage";
import { UserProfile, HistoryItem, ActivePage } from "./types";
import { FirebaseIntegration } from "./firebase";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [authChecking, setAuthChecking] = useState(true);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [initialForm, setInitialForm] = useState<"login" | "signup">("login");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Synchronize state from database or storage triggers
  useEffect(() => {
    const unsub = FirebaseIntegration.onAuthChanged(async (profile: UserProfile | null) => {
      setUser(profile);
      setAuthChecking(false);

      if (profile) {
        try {
          const hist = await FirebaseIntegration.getUserHistory(profile.uid);
          setHistory(hist);
        } catch (e) {
          console.error("Failed to fetch session history:", e);
        }
      }
    });

    return () => unsub();
  }, []);

  // Sync user profile values on manual override edits or credit changes
  const refreshUserProfile = async () => {
    if (!user) return;
    try {
      const updatedProfile = await FirebaseIntegration.getUserProfile(user.uid);
      if (updatedProfile) {
        setUser(updatedProfile);
        const hist = await FirebaseIntegration.getUserHistory(user.uid);
        setHistory(hist);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle user/admin roles in developer preview
  const handleToggleRoleDev = async () => {
    if (!user) return;
    const nextRole = user.role === "admin" ? "user" : "admin";
    
    // Strict admin boundary checking
    if (nextRole === "admin" && user.email.toLowerCase() !== "usmankhalid619131@gmail.com") {
      alert("Access Denied: Administrative role is uniquely locked to the designated usmankhalid619131@gmail.com master account.");
      return;
    }

    const nextPlan = nextRole === "admin" ? "11M Characters" : "Free Plan";
    const nextCredits = nextRole === "admin" ? 10000000 : 50000;

    try {
      // Modify local users state OR real firebase
      const usersStorageKey = "urh_labs_users";
      const localUsers = localStorage.getItem(usersStorageKey);
      if (localUsers) {
        const usersObj = JSON.parse(localUsers);
        if (usersObj[user.uid]) {
          usersObj[user.uid].role = nextRole;
          usersObj[user.uid].plan = nextPlan;
          usersObj[user.uid].credits = nextCredits;
          localStorage.setItem(usersStorageKey, JSON.stringify(usersObj));
        }
      }

      // Overwrite database profile credentials
      await FirebaseIntegration.manuallyAdjustUserCredits(user.uid, nextCredits, nextPlan);
      
      const sessionUser = { ...user, role: nextRole, plan: nextPlan, credits: nextCredits };
      setUser(sessionUser);
      localStorage.setItem("urh_labs_current_user", JSON.stringify(sessionUser));
      
      window.dispatchEvent(new Event("storage"));
      alert(`Role swapped to: ${nextRole.toUpperCase()} successfully!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await FirebaseIntegration.logout();
    } catch (err) {
      console.warn("URH LABS: Handled error during logout:", err);
    } finally {
      setUser(null);
      setShowAuthPage(false);
      setActivePage("dashboard");
    }
  };

  const handleAddHistory = (item: HistoryItem) => {
    setHistory((prev) => [item, ...prev]);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your local workspace logs?")) {
      localStorage.removeItem("urh_labs_history");
      setHistory([]);
    }
  };

  // Render Skeleton Loader during bootstrap verification auth
  if (authChecking) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-xs text-gray-500">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#00ff66] p-[1.5px] shadow-[0_0_20px_rgba(0,240,255,0.4)] mb-4 animate-spin">
          <div className="w-full h-full bg-black rounded-xl" />
        </div>
        <span className="animate-pulse tracking-widest text-[#00ff66] uppercase font-bold">
          URH LABS Synthetic Node Booting...
        </span>
      </div>
    );
  }

  // Display Landing Page or Authorization forms if unauthenticated
  if (!user) {
    if (showAuthPage) {
      return (
        <Auth 
          onAuthSuccess={(profile) => setUser(profile)} 
          initialForm={initialForm}
          onBackToLanding={() => setShowAuthPage(false)}
        />
      );
    }
    return (
      <LandingPage 
        onGetStarted={(formMode) => {
          setInitialForm(formMode);
          setShowAuthPage(true);
        }} 
      />
    );
  }

  const isReal = FirebaseIntegration.isRealFirebase();

  return (
    <div className="min-h-screen bg-black text-gray-100 flex font-sans overflow-x-hidden">
      
      {/* 1. Left Fixed Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        user={user} 
        onLogout={handleLogout}
        onToggleRole={handleToggleRoleDev}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 2. Main content segment wrapper */}
      <div className="flex-1 min-h-screen flex flex-col pl-0 lg:pl-68 transition-all duration-300">
        
        {/* 3. Top telemetry bar */}
        <Navbar 
          user={user} 
          onContactShortcut={() => setActivePage("contact" as any)}
          isRealFirebase={isReal}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* 4. Active viewport dynamic routing */}
        <main className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
          {activePage === "dashboard" && (
            <Dashboard 
              user={user} 
              history={history} 
              setActivePage={setActivePage} 
            />
          )}

          {activePage === "admin" && (
            <AdminPanel 
              currentUser={user} 
              onRefreshUser={refreshUserProfile} 
            />
          )}

          {activePage === "billing" && (
            <Billing 
              user={user} 
              onRefreshUser={refreshUserProfile} 
              onRequestSubmitted={refreshUserProfile}
            />
          )}

          {activePage === "contact" as any && (
            <Contact />
          )}

          {/* Core AI Tools routing mappings */}
          {[
            "text-to-speech",
            "speech-to-text",
            "voice-cloning",
            "voice-design",
            "voice-conversion",
            "dubbing",
            "podcast-studio"
          ].includes(activePage) && (
            <AudioTools 
              activePage={activePage} 
              user={user} 
              onRefreshUser={refreshUserProfile} 
              onAddHistory={handleAddHistory} 
            />
          )}

          {/* Secondary generic screens router */}
          {["history", "developers", "settings"].includes(activePage) && (
            <ExtraPages 
              activePage={activePage} 
              user={user} 
              history={history} 
              onRefreshUser={refreshUserProfile} 
              onClearHistory={handleClearHistory}
            />
          )}
        </main>

        {/* Status indicator footer bar */}
        <footer className="border-t border-white/5 py-6 px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-gray-600 bg-[#030304]">
          <span>© 2026 URH LABS Neural Voice Platform All Rights Reserved.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-400 cursor-pointer">Terms of System Use</span>
            <span>•</span>
            <span className="hover:text-gray-400 cursor-pointer">Biometric Protection Guideline</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
