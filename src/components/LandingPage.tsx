/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Volume2, 
  Sparkles, 
  Layers, 
  Mic, 
  ArrowRight, 
  Brain, 
  ShieldCheck, 
  Globe2, 
  Play, 
  Pause, 
  HelpCircle, 
  CheckCircle2, 
  Database, 
  Terminal, 
  Check, 
  UserPlus, 
  Lock, 
  Radio,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onGetStarted: (formMode: "login" | "signup") => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  // TTS Playground State
  const [playgroundText, setPlaygroundText] = useState(
    "Experience the raw fidelity of our neural speech synthesis engine. Type anything here and listen to our models mapping deep vocal profiles instantly."
  );
  const [selectedVoice, setSelectedVoice] = useState("aria");
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [latencyTimer, setLatencyTimer] = useState<number>(0);
  const audioAnimationRef = useRef<number | null>(null);
  const [audioBars, setAudioBars] = useState<number[]>(new Array(18).fill(8));

  // Speech Models array
  const voiceModels = [
    { id: "aria", name: "Aria (Deep Resonance)", rate: 0.95, pitch: 1.0, gender: "female" },
    { id: "leo", name: "Leo (Tech Narrative)", rate: 1.05, pitch: 0.9, gender: "male" },
    { id: "sophia", name: "Sophia (Warm Editorial)", rate: 0.9, pitch: 1.05, gender: "female" },
    { id: "marcus", name: "Marcus (Cinematic Trailer)", rate: 0.85, pitch: 0.8, gender: "male" }
  ];

  // Simulated live system monitor metrics
  const serverMetrics = [
    { label: "Active Vocal Nodes", val: "148 / 150 Online", status: "Optimal" },
    { label: "Linguistic Accents", val: "15+ Synthesized", status: "Active" },
    { label: "Total Characters Rendered", val: "1,492,083,721", status: "+12.4k/s" },
    { label: "Neural Response Latency", val: "22ms - 38ms", status: "Real-time" }
  ];

  // Pricing Matrix (Matching user plan triggers in Firebase rules and functions)
  const billingPlans = [
    {
      id: "free",
      name: "Free Developer Desk",
      price: "₹0",
      subtext: "Best for direct custom code checks",
      credits: "50,000 Characters included",
      highlight: false,
      features: [
        "Full workspace TTS & Voice Conversion engines",
        "1 custom voice cloning biometric slot",
        "Comprehensive local memory logs preservation",
        "Standard latency queue placement",
        "Direct API token debugging tools"
      ],
      buttonText: "Register Free Account",
      mode: "signup" as const
    },
    {
      id: "1m",
      name: "1M Character Core",
      price: "₹4,000",
      subtext: "Perfect for independent developers",
      credits: "1,000,000 Premium Characters",
      highlight: false,
      features: [
        "Everything in Free Desk module",
        "Unlock 3 voice cloning slots",
        "Priority queue rendering tier",
        "No character output caps per generation",
        "Detailed billing and dashboard statistics"
      ],
      buttonText: "Secure 1M Credit Node",
      mode: "signup" as const
    },
    {
      id: "3m",
      name: "3M Creative Matrix",
      price: "₹9,000",
      subtext: "Designed for content platforms",
      credits: "3,000,000 Premium Characters",
      highlight: true,
      features: [
        "Everything in 1M Character tier",
        "Unlock 6 voice cloning biometric profiles",
        "Dedicated system analytics reports",
        "Ultra-low latency rendering streams",
        "Seamless screenshot billing approval pipeline"
      ],
      buttonText: "Establish 3M Studio Node",
      mode: "signup" as const
    },
    {
      id: "11m",
      name: "11M Studio Overlord",
      price: "₹29,000",
      subtext: "Unlimited production systems scaling",
      credits: "11,000,000 Massive Character Pool",
      highlight: false,
      features: [
        "All features and modules unlocked",
        "Unlimited voice design and speech generation",
        "Infinite voice cloning records",
        "Custom administrative roles overrides",
        "SLA guaranteed rendering channels"
      ],
      buttonText: "Deploy 11M Overlord Desk",
      mode: "signup" as const
    }
  ];

  // FAQs
  const faqList = [
    {
      q: "How does the voice cloning framework function inside URH Labs?",
      a: "Our biometric voice cloning tool analyzes short oral samples using deep acoustic neural transforms to create reusable spoken maps. These maps can instantly be mapped to arbitrary text input without needing full vocal studio re-records. Profile files are stored in strict compliance with biometric guidelines."
    },
    {
      q: "Can I connect my own custom Firebase project securely?",
      a: "Absolutely! We support zero-trust GCP synchronization. Under the Extra Pages - Settings workspace, you can inject your custom Firestore credentials. We also provide a direct CLI rules blueprint console to deploy rules straight inside your Firebase console using the firebase-tools CLI."
    },
    {
      q: "What measures protect my account character credits?",
      a: "All account credits are locked inside our Firebase billing models. Standard registrations are verified synchronously via auth credentials. Admins can verify payment screenshot submissions via our secure, server-side verified admin controls panel inside the dashboard."
    },
    {
      q: "How does the sound synthesis playground evaluate latency?",
      a: "When you type code or sentences and click play, our system measures the linguistic parsing intervals. Typical soundwaves are rendered in under 35 milliseconds, sending real-audio telemetry streams direct to the browser speakers."
    }
  ];

  // Web Speech API execution with animated waveform simulation
  const handlePlayPlayground = () => {
    if (!playgroundText.trim()) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const mockModel = voiceModels.find(m => m.id === selectedVoice) || voiceModels[0];
    const utterance = new SpeechSynthesisUtterance(playgroundText);
    
    // Choose voice based on system presets if available, or just fallback safely
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (mockModel.gender === "female") {
        const fVoices = voices.filter(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("google us english") || v.name.toLowerCase().includes("zira"));
        if (fVoices.length > 0) utterance.voice = fVoices[0];
      } else {
        const mVoices = voices.filter(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("microsoft david"));
        if (mVoices.length > 0) utterance.voice = mVoices[0];
      }
    }

    utterance.rate = mockModel.rate;
    utterance.pitch = mockModel.pitch;

    utterance.onstart = () => {
      setIsPlaying(true);
      setLatencyTimer(Math.floor(Math.random() * 15) + 18); // ~18-32ms simulated
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Soundwave animation frame loop when voice is playing
  useEffect(() => {
    if (isPlaying) {
      const animateWave = () => {
        setAudioBars(prev => prev.map(() => Math.floor(Math.random() * 40) + 6));
        audioAnimationRef.current = requestAnimationFrame(animateWave);
      };
      audioAnimationRef.current = requestAnimationFrame(animateWave);
    } else {
      if (audioAnimationRef.current) {
        cancelAnimationFrame(audioAnimationRef.current);
      }
      setAudioBars(new Array(18).fill(8));
    }

    return () => {
      if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans selection:bg-[#00f0ff] selection:text-black">
      
      {/* Cinematic grid overlay and nebula background glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[-250px] left-[15%] w-[800px] h-[600px] bg-gradient-to-br from-[#00f0ff]/10 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[400px] right-[-200px] w-[600px] h-[600px] bg-gradient-to-br from-[#00ff66]/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#00ff66] p-[1.5px] shadow-[0_0_15px_rgba(0,240,255,0.25)]">
              <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-7 h-7 text-[#00f0ff]" fill="none" stroke="currentColor" strokeWidth="6">
                  <path d="M25 75V25C25 45 40 55 50 55C60 55 75 45 75 25V75" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M50 55V85" stroke="#00ff66" strokeLinecap="round" />
                  <circle cx="50" cy="55" r="5" fill="#00ff66" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              URH <span className="text-[#00f0ff]">Labs</span>
            </span>
          </div>

          {/* Quick Menu */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest text-gray-400 capitalize">
            <a href="#features" className="hover:text-[#00f0ff] transition-colors">Neural Modules</a>
            <a href="#playground" className="hover:text-[#00f0ff] transition-colors">Acoustic Sandbox</a>
            <a href="#pricing" className="hover:text-[#00f0ff] transition-colors">Token Pricing</a>
            <a href="#faq" className="hover:text-[#00f0ff] transition-colors">Tech Specs</a>
          </nav>

          {/* Login Actions Button Frame */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onGetStarted("login")}
              className="text-xs font-mono font-bold text-gray-300 hover:text-[#00f0ff] px-4 py-2 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => onGetStarted("signup")}
              className="text-xs font-mono font-bold bg-white text-black hover:bg-gradient-to-r hover:from-[#00f0ff] hover:to-[#00ff66] hover:text-black px-4 py-2 rounded-xl border border-white/10 shadow-[0_4px_12px_rgba(255,255,255,0.06)] transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>

        </div>
      </header>

      {/* CORE WRAPPER */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24 space-y-32">
        
        {/* HERO INTRO BLOCK */}
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Status Capsule tag */}
          <div className="inline-flex items-center gap-2 bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20 py-1.5 px-3.5 rounded-full font-mono text-[10px] tracking-widest uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
            V3 Neural Synthesis Engine Live
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1] font-sans">
            Next Generation Spoken Accents <br />
            <span className="bg-gradient-to-r from-[#00f0ff] via-[#00ff66] to-[#00f0ff] bg-clip-text text-transparent bg-[size:300%_300%] animate-[shimmer_8s_infinite_linear]">
              Acoustic Synthesis Studio
            </span>
          </h2>

          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-sans">
            Deploy hyper-realistic Text to Speech rendering, create instantly mapped vocal biometric clones, automate real-time multi-track dubbing, and compose immersive podcasts on our lightning-fast cloud backend.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 font-mono text-xs">
            <button 
              onClick={() => onGetStarted("signup")}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black font-extrabold uppercase rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:brightness-110 tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Establish Custom Node <ArrowRight className="w-4 h-4 text-black" />
            </button>
            <a 
              href="#playground"
              className="w-full sm:w-auto px-8 py-4 bg-[#0e0e11] text-gray-300 hover:text-[#00f0ff] font-bold uppercase rounded-xl border border-white/5 hover:border-[#00f0ff]/20 tracking-wider flex items-center justify-center gap-1.5 transition-all"
            >
              Run Acoustic Playground
            </a>
          </div>

          {/* Quick Stats Overlay (No telemetry bloat, humble and elegant) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 border-t border-white/5 max-w-3xl mx-auto">
            {serverMetrics.map((me, i) => (
              <div key={i} className="text-left p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
                <span className="text-gray-500 block uppercase text-[9px] font-bold tracking-widest">{me.label}</span>
                <span className="text-white text-sm font-bold block mt-1">{me.val}</span>
                <span className="text-[#00ff66] text-[9px] mt-0.5 block font-bold">{me.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* INTERACTIVE PLAYGROUND WIDGET */}
        <section id="playground" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <Radio className="w-5 h-5 text-[#00f0ff] animate-pulse" /> Live Acoustic Sandbox
            </h3>
            <p className="text-gray-400 text-xs font-sans">
              Test drive the linguistic synthesis mapping instantly. Adjust the voice model and type custom text.
            </p>
          </div>

          <div className="bg-[#030305] border border-white/5 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl relative">
            <div className="absolute right-6 top-6 flex items-center gap-1.5 text-[10px] text-[#00ff66] font-mono bg-[#00ff66]/5 border border-[#00ff66]/10 py-1 px-2.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping" /> Real-time Synthesis Node
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
              
              {/* PLAYGROUND OPTIONS */}
              <div className="md:col-span-4 space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase font-bold text-[9px] tracking-widest">Selected Voice Model</label>
                  <div className="grid grid-cols-1 gap-2">
                    {voiceModels.map((vm) => (
                      <button
                        key={vm.id}
                        onClick={() => setSelectedVoice(vm.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          selectedVoice === vm.id 
                            ? "bg-[#00f0ff]/10 border-[#00f0ff] text-white" 
                            : "bg-black/50 border-white/5 text-gray-400 hover:border-white/10"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold block text-[11px]">{vm.name}</span>
                          <span className="text-[9px] text-gray-500 capitalize">{vm.gender} • rate {vm.rate}x</span>
                        </div>
                        {selectedVoice === vm.id && <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Synthesis Telemetry */}
                <div className="p-3.5 rounded-xl bg-black border border-white/5 text-[10px] space-y-1.5">
                  <span className="text-gray-500 uppercase font-bold text-[9px] tracking-widest block">Core Telemetry Specs</span>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Speed:</span>
                    <span className="text-[#00ff66] font-bold">16,201 Syllables/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Audio Cache:</span>
                    <span className="text-[#00f0ff]">32-bit Floating Wave</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Latency:</span>
                    <span>{isPlaying ? `${latencyTimer}ms` : "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* INPUT AND SOUNDWAVE DISPLAY */}
              <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-gray-500 uppercase font-bold tracking-widest">Input String Map</span>
                    <span className="text-gray-400">{playgroundText.length} / 250 characters used</span>
                  </div>
                  <textarea
                    value={playgroundText}
                    onChange={(e) => setPlaygroundText(e.target.value.substring(0, 250))}
                    placeholder="Type custom phrase here..."
                    className="w-full bg-black border border-white/5 rounded-xl p-4 text-xs h-32 focus:border-[#00f0ff]/20 text-white leading-relaxed resize-none font-sans"
                  />
                </div>

                {/* Simulated live visualizer blocks */}
                <div className="p-4 rounded-xl bg-[#030303] border border-white/5 flex items-center justify-between min-h-[64px]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePlayPlayground}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isPlaying 
                          ? "bg-red-500 text-white hover:bg-red-600" 
                          : "bg-gradient-to-tr from-[#00f0ff] to-[#00ff66] text-black hover:brightness-110 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current text-white" /> : <Play className="w-4 h-4 fill-current text-black pl-0.5" />}
                    </button>
                    <div className="font-mono text-xs">
                      <span className="text-white font-bold block">{isPlaying ? "Active Wave Streaming" : "Node Ready for Synthesis"}</span>
                      <span className="text-gray-500 text-[9px] block">Click to output preview standard audio conversion</span>
                    </div>
                  </div>

                  {/* Graphic Sound bars */}
                  <div className="flex items-end gap-1 h-8">
                    {audioBars.map((h, index) => (
                      <div
                        key={index}
                        style={{ height: `${h}px` }}
                        className={`w-1 rounded-sm transition-all duration-150 ${
                          isPlaying 
                            ? index % 2 === 0 ? "bg-[#00f0ff]" : "bg-[#00ff66]"
                            : "bg-white/10"
                        }`}
                        // index dummy calculation
                        ref={null}
                      />
                    ))}
                  </div>
                </div>

                {/* Prompt account sign up for long conversions */}
                <div className="text-center font-mono text-[10px] text-gray-500 flex items-center justify-between border-t border-white/5 pt-4">
                  <span>To record voice clones or synthesize entire books:</span>
                  <button
                    onClick={() => onGetStarted("signup")}
                    className="text-[#00ff66] font-bold hover:underline hover:text-[#00f0ff] cursor-pointer"
                  >
                    Instantiate Developer Desk <ChevronDown className="w-3.5 h-3.5 inline rotate-[-90deg]" />
                  </button>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* WORKSPACE TECHNOLOGY REVOLUTION PAGES */}
        <section id="features" className="space-y-16 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-[#00ff66] uppercase block font-bold">
              Cognitive Auditory Suite
            </span>
            <h3 className="text-3xl font-bold tracking-tight text-white leading-tight">
              SaaS Audio Tools Configured for Enterprise Precision
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm font-sans max-w-xl mx-auto leading-relaxed">
              We provide modular AI voice instruments natively integrated into the workspace dashboard. Start rendering immediately with responsive controls patterns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4 group hover:border-[#00f0ff]/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 flex items-center justify-center text-[#00f0ff] group-hover:bg-[#00f0ff]/20 transition-colors">
                <Volume2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
                High Fidelity Text-to-Speech
              </h4>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Parse arbitrary scripts with pristine emotional emphasis. Features rich output metrics to manage character credit spend accurately per conversion.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4 group hover:border-[#00ff66]/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#00ff66]/10 flex items-center justify-center text-[#00ff66] group-hover:bg-[#00ff66]/20 transition-colors">
                <Mic className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
                Biometric Voice Cloning
              </h4>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Initialize custom actor biometrics instantly. Save sample profiles to synthesize dedicated dialogue streams without repeating recording loops.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4 group hover:border-purple-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
                Interactive Podcast Studio
              </h4>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Formulate multi-voice conversation structures on single sheets. Generates dynamic scripts with alternating characters and smart background loops.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4 group hover:border-amber-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <Globe2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
                Accent/Language Synthesis
              </h4>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Translate rendering targets in real time. We support 15+ complex international vocal variations optimized for global developer output channels.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4 group hover:border-[#00ff66]/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
                Dynamic Voice Design
              </h4>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Tune age, pitch, rate, and linguistic emotional multipliers through a unified virtual dashboard. Formulate any targeted vocal profile on the fly.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4 group hover:border-[#00f0ff]/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
                Zero-Trust Security & DB Sync
              </h4>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                We integrate with standard Firebase Firestore. Your profile data, credit spends, and history logs are secured behind strict Zero-Trust ABAC security.
              </p>
            </div>

          </div>
        </section>

        {/* TICKET CHARACTERS CREDIT PLAN */}
        <section id="pricing" className="space-y-16 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase block font-bold">
              Affordable Credit Mapping
            </span>
            <h3 className="text-3xl font-bold tracking-tight text-white leading-tight">
              Flexible Credits Modules for Limitless Output
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm font-sans max-w-xl mx-auto leading-relaxed">
              Unlock higher limits and character allocations. Submit billing payment screenshots inside the application console to request custom character credits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {billingPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`p-6 rounded-2xl flex flex-col justify-between space-y-6 relative border transition-all ${
                  plan.highlight 
                    ? "bg-[#050510] border-[#00f0ff] shadow-[0_0_30px_rgba(0,240,255,0.06)]" 
                    : "bg-white/[0.01] border-white/5 hover:border-white/10"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute top-0 right-6 translate-y-[-50%] text-[8px] font-mono tracking-widest font-bold uppercase bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black px-2.5 py-1 rounded">
                    Popular Framework Choice
                  </span>
                )}

                <div className="space-y-4 font-mono text-xs">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{plan.name}</span>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                      <span className="text-[10px] text-gray-400 font-sans">/ lifetime map</span>
                    </div>
                    <span className="text-gray-400 text-[10px] italic block font-sans">{plan.subtext}</span>
                  </div>

                  {/* Character credits Highlight */}
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 font-bold font-mono text-[#00ff66] text-center text-[11px]">
                    {plan.credits}
                  </div>

                  <ul className="space-y-2 border-t border-white/5 pt-4 text-left font-sans text-gray-400 text-[11px]">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-tight">
                        <Check className="w-3.5 h-3.5 text-[#00f0ff] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onGetStarted(plan.mode)}
                  className={`w-full py-3 rounded-xl font-bold font-mono uppercase text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                    plan.highlight
                      ? "bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black hover:brightness-105"
                      : "bg-white/5 hover:bg-white/10 text-white"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* TECH SPECS AND FAQS */}
        <section id="faq" className="space-y-16 scroll-mt-24 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-[#00ff66] uppercase block font-bold">
              Workspace Blueprint Details
            </span>
            <h3 className="text-3xl font-bold tracking-tight text-white leading-tight">
              Frequently Queried Specifications
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm font-sans">
              Everything you need to know about setting up your URH Labs node.
            </p>
          </div>

          <div className="space-y-4 font-sans">
            {faqList.map((faq, index) => (
              <div 
                key={index} 
                className="rounded-2xl border border-white/5 bg-[#030305]/40 hover:border-white/10 transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-white select-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${activeFaq === index ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence initial={false}>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-5 pt-0 border-t border-white/5 text-xs text-gray-400 leading-relaxed bg-black/30">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#030305] py-16 px-6 font-mono text-[11px] text-gray-500 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/5">
          
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00f0ff] to-[#00ff66] p-[1.5px]">
                <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-5 h-5 text-[#00f0ff]" fill="none" stroke="currentColor" strokeWidth="6">
                    <path d="M25 75V25C25 45 40 55 50 55C60 55 75 45 75 25V75" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M50 55V85" stroke="#00ff66" strokeLinecap="round" />
                    <circle cx="50" cy="55" r="5" fill="#00ff66" />
                  </svg>
                </div>
              </div>
              <span className="text-base font-black tracking-tight text-white">
                URH <span className="text-[#00f0ff]">Labs</span>
              </span>
            </div>
            <p className="text-gray-400 font-sans text-xs">
              Studio-grade sound synthesis and voice profile design frameworks running synchronously on secure Firebase databases.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <span className="text-white font-bold uppercase tracking-wider text-[10px] block">Acoustic Suite</span>
            <ul className="space-y-1.5 font-sans">
              <li><button onClick={() => onGetStarted("signup")} className="hover:text-white transition-colors cursor-pointer">Text to Speech</button></li>
              <li><button onClick={() => onGetStarted("signup")} className="hover:text-white transition-colors cursor-pointer">Biometric Cloning</button></li>
              <li><button onClick={() => onGetStarted("signup")} className="hover:text-white transition-colors cursor-pointer">Podcast Workspace</button></li>
              <li><button onClick={() => onGetStarted("signup")} className="hover:text-white transition-colors cursor-pointer">Accent Conversion</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <span className="text-white font-bold uppercase tracking-wider text-[10px] block">Node Sync</span>
            <ul className="space-y-1.5 font-sans">
              <li><button onClick={() => onGetStarted("login")} className="hover:text-white transition-colors cursor-pointer">Admin Desk</button></li>
              <li><button onClick={() => onGetStarted("signup")} className="hover:text-white transition-colors cursor-pointer">Developer Settings</button></li>
              <li><button onClick={() => onGetStarted("login")} className="hover:text-white transition-colors cursor-pointer">Billing screenshots approval</button></li>
              <li><button onClick={() => onGetStarted("signup")} className="hover:text-white transition-colors cursor-pointer">System Logs</button></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <span className="text-white font-bold uppercase tracking-wider text-[10px] block">System Integrity</span>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-[9px] text-gray-500 leading-normal space-y-1">
              <span className="text-[#00ff66] font-bold">Node Version v3.45-R</span>
              <p>Biometric protection maps verified synchronously. Database queries are locked under strict cloud firestore authorization.</p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-gray-600">
          <span>© 2026 URH Labs Inc. Neural audio designs protected by localized system state keys.</span>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-gray-400">Terms of System Use</a>
            <a href="#faq" className="hover:text-gray-400">Biometric Protections Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
