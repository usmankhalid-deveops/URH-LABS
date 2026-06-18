/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  History, 
  Code, 
  Settings, 
  Trash2, 
  Copy, 
  Check, 
  Sliders, 
  Key, 
  FolderSync, 
  Award,
  HardDriveDownload,
  Terminal,
  ShieldCheck,
  User,
  Volume2
} from "lucide-react";
import { UserProfile, HistoryItem, ActivePage } from "../types";
import { FirebaseIntegration } from "../firebase";

interface ExtraPagesProps {
  activePage: ActivePage;
  user: UserProfile | null;
  history: HistoryItem[];
  onRefreshUser: () => void;
  onClearHistory: () => void;
}

export default function ExtraPages({ activePage, user, history, onRefreshUser, onClearHistory }: ExtraPagesProps) {
  // Common states
  const [copiedKey, setCopiedKey] = useState(false);
  const [developerToken, setDeveloperToken] = useState(
    `urh_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`
  );
  
  // Settings forms states
  const [editedName, setEditedName] = useState(user?.name ?? "Usman Khalid");
  const [simulationDelay, setSimulationDelay] = useState(1);
  const [profileSuccessState, setProfileSuccessState] = useState(false);

  // Sync internal form field state when user prop updates
  React.useEffect(() => {
    if (user?.name) {
      setEditedName(user.name);
    }
  }, [user]);

  // Search filter for history log list
  const [historySearch, setHistorySearch] = useState("");
  const [historyCategory, setHistoryCategory] = useState("all");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await FirebaseIntegration.updateUserProfileName(user.uid, editedName.trim());
      setProfileSuccessState(true);
      onRefreshUser();
      setTimeout(() => setProfileSuccessState(false), 2000);
    } catch (err) {
      alert("Error: Settings write failure.");
    }
  };

  const codeSnippetCurl = `curl -X POST https://urh-labs.ai/api/voice/generate \\
  -H "Authorization: Bearer ${developerToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tool": "Text to Speech",
    "input": "This is synthetic audio computed securely on URH LABS Nodes",
    "voice": "Kore (Warm Baritone)"
  }'`;

  const codeSnippetNode = `const { GoogleGenAI } = require("@google/genai");

async function synthesizeVoiceScript() {
  const response = await fetch("https://urh-labs.ai/api/voice/generate", {
    method: "POST",
    headers: {
      "Authorization": "Bearer ${developerToken}",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tool: "Text to Speech",
      input: "Speech synthesis executed out-of-band and downloaded as MP3 format.",
      voice: "Fenrir (UK Narrator)"
    })
  });
  const data = await response.json();
  console.log("Audio generated securely:", data.response);
}`;

  // Filter out history entries
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.request.toLowerCase().includes(historySearch.toLowerCase()) || 
                          item.tool.toLowerCase().includes(historySearch.toLowerCase());
    const matchesCategory = historyCategory === "all" ? true : item.tool === historyCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in text-gray-300">
      
      {/* ========================================================== */}
      {/* 1. HISTORY PAGE VIEW                                       */}
      {/* ========================================================== */}
      {activePage === "history" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-950 to-black border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <History className="w-5 h-5 text-[#00f0ff]" /> Voice Synthesis History Logs
              </h2>
              <p className="text-xs text-gray-400">
                Audit, search, and download your past acoustic and transcription logs.
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-4 py-2 rounded-xl bg-red-950/20 hover:bg-red-950 text-red-400 hover:text-white border border-red-500/20 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge history logs
              </button>
            )}
          </div>

          {/* Filtering and Search controls row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <input 
                type="text" 
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Lookup search terms or request keywords..."
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
              />
            </div>

            <div className="md:col-span-4">
              <select 
                value={historyCategory}
                onChange={(e) => setHistoryCategory(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
              >
                <option value="all">Check all tools categories</option>
                <option value="Text to Speech">Text to Speech</option>
                <option value="Speech to Text">Speech to Text</option>
                <option value="Voice Cloning">Voice Cloning</option>
                <option value="Voice Design">Voice Design</option>
                <option value="Voice Conversion">Voice Conversion</option>
                <option value="Dubbing">Dubbing</option>
                <option value="Podcast Studio">Podcast Studio</option>
              </select>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="p-16 rounded-2xl bg-black border border-white/5 text-center flex flex-col items-center justify-center p-6 text-gray-500">
              <History className="w-10 h-10 text-gray-600 mb-2 animate-pulse" />
              <p className="text-sm font-semibold text-gray-300">No History Logs Found</p>
              <p className="text-xs text-gray-500 mt-1">Adjust search parameters or launch synthesis commands to generate logs.</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-white/5 rounded-2xl bg-[#060608] divide-y divide-white/5">
              {filteredHistory.map((item) => (
                <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-all">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded bg-[#00f0ff]/10 text-[#00f0ff] text-[10px] font-mono border border-[#00f0ff]/15">
                        {item.tool}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 font-sans leading-relaxed">
                      <b>Input query:</b> <span className="italic block mt-1 bg-black/60 p-2.5 rounded border border-white/5 font-mono text-[10px]">"{item.request}"</span>
                    </p>

                    <div className="text-xs text-gray-400 font-mono bg-[#050508] p-3 rounded-lg border border-white/5 whitespace-pre-wrap max-h-32 overflow-y-auto">
                      <b>Generated Output:</b>
                      <p className="text-[11px] text-gray-300 mt-1 font-sans">{item.response}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-transparent border-white/5 pt-3 md:pt-0">
                    <div className="text-right font-mono text-xs">
                      <span className="text-gray-500 block">Deducted cost:</span>
                      <span className="text-[#00ff66] font-bold">{item.creditsUsed.toLocaleString()} Chars</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        const file = new Blob([item.response], {type: 'text/plain'});
                        const element = document.createElement("a");
                        element.href = URL.createObjectURL(file);
                        element.download = `URH_${item.tool}_Report.txt`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#00f0ff]/30 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="Download text file"
                    >
                      <HardDriveDownload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* 2. DEVELOPERS API PAGE                                     */}
      {/* ========================================================== */}
      {activePage === "developers" && user?.role === "admin" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-950 to-black border border-white/5 space-y-1">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-[#00ff66]" /> Developer API Integration
            </h2>
            <p className="text-xs text-gray-400">
              Integrate URH LABS synthetic vocal wave generation directly into your third-party applications.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* API Key management panel (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-black border border-white/5 space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">API Access Tokens</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Treat your API credentials as passwords. Do not share tokens in client-side client implementations; run requests exclusively through server gateways.
                </p>
              </div>

              {/* Developer token container row */}
              <div className="p-4 rounded-xl bg-[#090a0f] border border-white/5 space-y-3">
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Active Production Secret Token</span>
                <div className="flex items-center gap-2 bg-black p-2.5 rounded border border-white/5">
                  <Key className="w-4 h-4 text-[#00f0ff] shrink-0" />
                  <span className="text-xs font-mono text-white truncate max-w-[180px]">
                    {developerToken}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(developerToken)}
                    className="ml-auto p-1 text-gray-400 hover:text-[#00ff66] transition-colors"
                    title="Copy secret key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-[#00ff66]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                
                <button
                  onClick={() => setDeveloperToken(`urh_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`)}
                  className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono tracking-wide text-gray-400 hover:text-white transition-all text-center uppercase"
                >
                  Regenerate active Bearer token
                </button>
              </div>

              {/* Developer stats */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between font-mono text-xs">
                <span className="text-gray-500">Node Status:</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#00ff66] font-bold">
                  Gateway API Online
                </span>
              </div>
            </div>

            {/* Code snippets preview panel (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-black border border-[#00ff66]/15 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-xs font-mono font-bold uppercase text-[#00ff66] flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" /> API Reference Terminal
                </h4>
                <span className="text-[9px] font-mono text-gray-500">Secure TLS HTTPS Encryption</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Bash Snippet box */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>1. Bash Terminal Request Protocol (cURL)</span>
                    <button 
                      onClick={() => copyToClipboard(codeSnippetCurl)} 
                      className="hover:text-white font-bold inline-flex items-center gap-1"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-[#030305] text-amber-400 overflow-x-auto text-[10px] leading-relaxed border border-white/5 custom-scrollbar font-mono">
                    {codeSnippetCurl}
                  </pre>
                </div>

                {/* Node JS snippet box */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>2. Node.js ESModule Async / Await integration</span>
                    <button 
                      onClick={() => copyToClipboard(codeSnippetNode)} 
                      className="hover:text-white font-bold inline-flex items-center gap-1"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-[#030305] text-cyan-300 overflow-x-auto text-[10px] leading-relaxed border border-white/5 custom-scrollbar font-mono">
                    {codeSnippetNode}
                  </pre>
                </div>
              </div>
            </div>

          </div>

          {/* 3. FIREBASE RULES DEPLOYMENT CONSOLE */}
          <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div className="space-y-1">
                <h4 className="text-sm font-mono font-bold uppercase text-[#00f0ff] flex items-center gap-1.5">
                  <FolderSync className="w-4 h-4" /> Firebase Console Rules Deployment Guide
                </h4>
                <p className="text-xs text-gray-400">
                  Since you are linked with your custom Firebase project <code className="bg-white/5 px-1.5 py-0.5 rounded text-white font-bold">{user?.uid ? "urh-labs" : "local"}</code>, run these terminal prompts to configure security and deploy rules.
                </p>
              </div>
              <span className="shrink-0 text-[10px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded">
                Custom GCP project
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
              
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-[#030305] border border-white/5 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">1. Install CLI</span>
                    <button 
                      onClick={() => copyToClipboard("npm install -g firebase-tools")} 
                      className="text-[10px] text-[#00f0ff] hover:text-white font-bold flex items-center gap-1.5"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-black/80 px-3 py-2.5 rounded border border-white/5 text-[#00ff66] truncate font-mono text-[11px]">
                    npm install -g firebase-tools
                  </div>
                  <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                    Installs the official Firebase CLI globally to manage credentials, initialize templates, and upload configurations.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-[#030305] border border-white/5 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">2. Authenticate</span>
                    <button 
                      onClick={() => copyToClipboard("firebase login")} 
                      className="text-[10px] text-[#00f0ff] hover:text-white font-bold flex items-center gap-1.5"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-black/80 px-3 py-2.5 rounded border border-white/5 text-[#00ff66] truncate font-mono text-[11px]">
                    firebase login
                  </div>
                  <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                    Opens a secure browser window to authenticate your local workstation terminal session with your Google Cloud account.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-[#030305] border border-white/5 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">3. Initialize</span>
                    <button 
                      onClick={() => copyToClipboard("firebase init")} 
                      className="text-[10px] text-[#00f0ff] hover:text-white font-bold flex items-center gap-1.5"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-black/80 px-3 py-2.5 rounded border border-white/5 text-[#00ff66] truncate font-mono text-[11px]">
                    firebase init
                  </div>
                  <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                    Connects your local workspace directory with the remote database instances, setup services (database, auth, hosting).
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-[#030305] border border-white/5 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">4. Deploy</span>
                    <button 
                      onClick={() => copyToClipboard("firebase deploy")} 
                      className="text-[10px] text-[#00f0ff] hover:text-white font-bold flex items-center gap-1.5"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-black/80 px-3 py-2.5 rounded border border-white/5 text-[#00ff66] truncate font-mono text-[11px]">
                    firebase deploy
                  </div>
                  <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                    Pushes files, static assets, database schemas, and zero-trust security rules from local configurations up to the active cloud container.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================== */}
      {/* 3. SETTINGS PAGE VIEW                                      */}
      {/* ========================================================== */}
      {activePage === "settings" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-950 to-black border border-white/5 space-y-1">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#00f0ff]" /> User & Node Configurations
            </h2>
            <p className="text-xs text-gray-400">
              Modify account attributes and override local development simulation delays.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Change Profile card */}
            <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 font-mono flex items-center gap-1.5 pb-2 border-b border-white/5">
                <User className="w-4 h-4 text-[#00f0ff]" /> Profile credentials
              </h4>

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-mono">
                {profileSuccessState && (
                  <div className="p-3.5 bg-[#00ff66]/10 border border-[#00ff66]/20 rounded-xl text-[#00ff66] font-bold">
                    Profile attributes modified successfully!
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-gray-500 font-bold uppercase text-[10px]">Display Name</label>
                  <input 
                    type="text" 
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-sans"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 font-bold uppercase text-[10px]">Registered Email</label>
                  <input 
                    type="text" 
                    value={user?.email ?? ""} 
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-500"
                    disabled
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-500 font-bold uppercase text-[10px]">Assigned plan token</label>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#00ff66]" /> {user?.plan}
                    </span>
                    <span className="text-[#00ff66]">{user?.role === "admin" ? "∞ (Standard Bypass)" : user?.credits.toLocaleString()} Chars Left</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Save Profile Info
                </button>
              </form>
            </div>

            {/* Simulation controls & development preferences override */}
            <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 font-mono flex items-center gap-1.5 pb-2 border-b border-white/5">
                <Sliders className="w-4 h-4 text-[#00ff66]" /> Node Synthesis Adjuster
              </h4>

              <div className="space-y-4 text-xs font-mono text-gray-400">
                <div className="space-y-1">
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Simulated API Delay Speed</span>
                    <span className="text-[#00ff66]">{simulationDelay} seconds</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="6" 
                    step="1"
                    value={simulationDelay}
                    onChange={(e) => setSimulationDelay(parseInt(e.target.value))}
                    className="w-full accent-[#00ff66]" 
                  />
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 font-sans">
                  <span className="font-bold text-white block">System diagnostics description:</span>
                  <p className="text-[11px] leading-relaxed">
                    This slider determines how long the app simulates server-side rendering processes for audio files before printing responses. Helps developers test front-end loading and skeleton frames.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Environment Node State:</span>
                  <span className="px-2.5 py-1 rounded bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/20 font-bold uppercase font-mono">
                    Node: Production_V2.0
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
