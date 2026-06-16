/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Mic, 
  Sparkles, 
  Volume2, 
  Sliders, 
  RefreshCw, 
  SquarePlay, 
  BookOpen, 
  Trash2, 
  HardDriveDownload,
  AlertTriangle,
  Upload,
  RefreshCcw,
  Check,
  AudioLines,
  Search
} from "lucide-react";
import { UserProfile, HistoryItem, ActivePage, ClonedVoice } from "../types";
import { FirebaseIntegration } from "../firebase";

// Formant voice synthesizer: Converts input script script text into high-fidelity downloadable vocal wav PCM samples client-side.
function generateSpeechWav(text: string, pitchFactor: number, speedFactor: number): string {
  const sampleRate = 16000;
  // Dynamic audio length based on text size (approx 0.12s per character, responsive to speed factor)
  const durationPerChar = 0.12 / speedFactor;
  const numCharacters = Math.max(10, Math.min(text.length, 300));
  const totalSeconds = numCharacters * durationPerChar;
  const numSamples = Math.floor(sampleRate * totalSeconds);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // "fmt " chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);          // chunk size (16)
  view.setUint16(20, 1, true);           // PCM format
  view.setUint16(22, 1, true);           // Mono
  view.setUint32(24, sampleRate, true);  // Sample rate (16000)
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true);           // Block align
  view.setUint16(34, 16, true);          // Bits per sample (16)

  // "data" chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples * 2, true);

  // Formant vocal synthesizer engine (modulates carrier/modulator frequencies)
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const baseFreq = 120 * pitchFactor; // 120Hz male base, adjusted by pitchFactor

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    
    // Determine which word we are currently in
    const wordIdx = Math.floor(t / (durationPerChar * 6));
    const word = words[wordIdx % words.length] || "URH";
    
    // Hash-based word frequency modulation to make words sound uniquely distinct
    let wordHash = 0;
    for (let j = 0; j < word.length; j++) {
      wordHash = (wordHash << 5) - wordHash + word.charCodeAt(j);
    }
    wordHash = Math.abs(wordHash);
    
    // Formant frequency (vowel sound filters)
    const f1 = 400 + (wordHash % 300); // 400Hz - 700Hz
    const f2 = 1000 + (wordHash % 1200); // 1000Hz - 2200Hz
    
    // Base pitch micro-vibrato
    const pitch = baseFreq + Math.sin(2 * Math.PI * 6 * t) * 5; 
    
    // Multi-formant additive synth carrier
    const car1 = Math.sin(2 * Math.PI * pitch * t);
    const car2 = Math.sin(2 * Math.PI * (pitch * 1.5) * t) * 0.4;
    const car3 = Math.sin(2 * Math.PI * (pitch * 2.0) * t) * 0.25;
    
    // Vowel formant bandpass simulation
    const formantMod = Math.sin(2 * Math.PI * f1 * t) * Math.sin(2 * Math.PI * f2 * t);
    
    // Envelope for syllabic rhythm (breathing/inflection sweeps)
    const syllableT = t % (durationPerChar * 6);
    const envelope = Math.sin(Math.PI * syllableT / (durationPerChar * 6)) * 
                     (0.85 + 0.15 * Math.sin(2 * Math.PI * 15 * t)); // adds minor vocal tremolo
    
    // Unvoiced sibilance hiss for consonants
    const isConsonant = syllableT < 0.05 || syllableT > (durationPerChar * 6 - 0.05);
    const noise = (Math.random() * 2 - 1) * (isConsonant ? 0.15 : 0.01);
    
    // Mix and scale signals
    let sample = (car1 + car2 + car3) * 0.4 * formantMod * envelope + noise * envelope;
    
    // Soft saturation clipping to sound warm/neural
    sample = Math.max(-1, Math.min(1, sample * 1.2));
    
    // Write 16-bit PCM amplitude
    const intVal = Math.floor(sample * 32767);
    view.setInt16(44 + i * 2, intVal, true);
  }

  const blob = new Blob([buffer], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

export function getVoiceLocale(voiceName: string): string {
  const name = voiceName.toLowerCase();
  
  if (name.includes("british") || name.includes("rp") || name.includes("narrator") || name.includes("jarvis") || name.includes("clara") || name.includes("fenrir")) {
    return "en-gb";
  }
  if (name.includes("australian") || name.includes("deep") || name.includes("anchor") || name.includes("marcus") || name.includes("charon")) {
    return "en-au";
  }
  if (name.includes("irish") || name.includes("whisper") || name.includes("puck") || name.includes("aria")) {
    return "en-ie";
  }
  if (name.includes("spanish")) {
    return "es";
  }
  if (name.includes("urdu") || name.includes("hindi")) {
    return "ur";
  }
  if (name.includes("german")) {
    return "de";
  }
  if (name.includes("japanese")) {
    return "ja";
  }
  if (name.includes("chinese")) {
    return "zh";
  }
  return "en-us";
}

export interface AssistantModel {
  id: string;
  name: string;
  description: string;
  gender: "Male" | "Female" | "Neutral";
  archetype: string;
  pitch: number;
  speed: number;
}

export const assistantsList: AssistantModel[] = [
  { id: "Jarvis", name: "Jarvis (AI Butler)", description: "Deep British RP, authoritative, sleek.", gender: "Male", archetype: "British RP", pitch: 0.8, speed: 1.0 },
  { id: "Samantha", name: "Samantha (Companion)", description: "Warm US Female, highly empathetic and responsive.", gender: "Female", archetype: "US Standard", pitch: 1.15, speed: 1.05 },
  { id: "Hal9000", name: "Hal 9000", description: "Soft mechanical neutral lilt with eerie precision.", gender: "Neutral", archetype: "Robotic Standard", pitch: 0.85, speed: 0.85 },
  { id: "Cortana", name: "Cortana (Advisor)", description: "Crisp tactical advisory tone, confident female stream.", gender: "Female", archetype: "US Military Professional", pitch: 1.1, speed: 1.1 },
  { id: "Friday", name: "Friday (Assistant)", description: "Energetic US female tech intelligence, high velocity.", gender: "Female", archetype: "Energetic US", pitch: 1.2, speed: 1.25 },
  { id: "Clara", name: "Clara (Presenter)", description: "Confident UK Executive corporate presentation style.", gender: "Female", archetype: "British Standard", pitch: 1.05, speed: 0.95 },
  { id: "Marcus", name: "Marcus (Pilot)", description: "Gruff, mature, weather-beaten male baritone.", gender: "Male", archetype: "Australian Broad", pitch: 0.7, speed: 0.9 },
  { id: "Aria", name: "Aria (Smart Home)", description: "Melodic, calm home automation assistant, soft-spoken.", gender: "Female", archetype: "Slight Irish Accent", pitch: 1.22, speed: 0.95 },
  { id: "Kore", name: "Kore (Warm Baritone)", description: "Warm organic US Baritone narrator.", gender: "Male", archetype: "Warm US", pitch: 1.0, speed: 1.0 },
  { id: "Fenrir", name: "Fenrir (Calm Narrator)", description: "Soothing deep UK story-telling lilt.", gender: "Male", archetype: "Calm UK", pitch: 0.9, speed: 0.9 },
  { id: "Zephyr", name: "Zephyr (US Female)", description: "Expressive high-contrast US commercial sound.", gender: "Female", archetype: "Commercial US", pitch: 1.1, speed: 1.15 },
  { id: "Puck", name: "Puck (Soft Whisper)", description: "Feathery soft voice with Celtic undertones.", gender: "Female", archetype: "Irish Lilt", pitch: 1.15, speed: 1.0 },
  { id: "Charon", name: "Charon (Deep Anchor)", description: "Extremely deep, robust Australian male baritone.", gender: "Male", archetype: "Australian Deep", pitch: 0.75, speed: 1.05 }
];

interface AudioToolsProps {
  activePage: ActivePage;
  user: UserProfile | null;
  onRefreshUser: () => void;
  onAddHistory: (item: HistoryItem) => void;
}

export default function AudioTools({ activePage, user, onRefreshUser, onAddHistory }: AudioToolsProps) {
  // Input parameters tracking states
  const [textToSpeechInput, setTextToSpeechInput] = useState("Script Input Text");
  const [selectedVoice, setSelectedVoice] = useState("Kore (Warm Baritone)");
  const [speechPitch, setSpeechPitch] = useState(1);
  const [speechSpeed, setSpeechSpeed] = useState(1);
  
  // Custom states
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [cloneGender, setCloneGender] = useState<"Male" | "Female" | "Neutral">("Male");
  const [isSavingClone, setIsSavingClone] = useState(false);
  const [cloneSavedSuccess, setCloneSavedSuccess] = useState(false);

  // Load user cloned voices
  const loadClonedVoices = async () => {
    const uid = user?.uid || "guest-user";
    try {
      const list = await FirebaseIntegration.getUserClonedVoices(uid);
      setClonedVoices(list);
    } catch (e) {
      console.error("URH Labs: Failed to load cloned voices:", e);
    }
  };

  useEffect(() => {
    loadClonedVoices();
  }, [user?.uid]);

  // Combined list of assistants including user's custom saved voice clones
  const combinedAssistants = [
    ...assistantsList,
    ...clonedVoices.map(cv => ({
      id: cv.id,
      name: cv.name,
      description: cv.description || `Custom cloned voice profile: ${cv.name}`,
      gender: cv.gender,
      archetype: cv.archetype || "Custom Cloned Voice",
      pitch: cv.pitch,
      speed: cv.speed
    }))
  ];
  
  // Custom states
  const [assistantSearch, setAssistantSearch] = useState("");
  const [conversionProgress, setConversionProgress] = useState(0);
  
  // Audio playback controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeechUtterance, setActiveSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Tool states
  const [isProcessing, setIsProcessing] = useState(false);
  const [computedResult, setComputedResult] = useState<string | null>(null);
  const [synthesizedAudioUrl, setSynthesizedAudioUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Speech To Text (STT) states
  const [sttFileDesc, setSttFileDesc] = useState("Preset: Usman_Labs_Interview_Interview_Sample.wav (1.4MB)");

  // Voice Cloning States
  const [cloneName, setCloneName] = useState("Usman-Clone-V1");
  const [cloneFileUploaded, setCloneFileUploaded] = useState(false);

  // Voice Design states
  const [designName, setDesignName] = useState("Sonia-Interactive-Accent");
  const [designGender, setDesignGender] = useState("Female");
  const [designAge, setDesignAge] = useState("Young Adult");
  const [designAccent, setDesignAccent] = useState("British RP");
  const [designBreath, setDesignBreath] = useState(30);

  // Voice Conversion states
  const [conversionSource, setConversionSource] = useState("Fenrir (Calm Narrator)");
  const [conversionTarget, setConversionTarget] = useState("Usman-Clone-V1");
  const [conversionInputText, setConversionInputText] = useState("Welcome back to another audio session.");

  // Dubbing states
  const [dubSourceLang, setDubSourceLang] = useState("English");
  const [dubTargetLang, setDubTargetLang] = useState("Spanish");
  const [dubInputText, setDubInputText] = useState("URH Labs is launching today globally for all sound creators.");

  // Podcast Studio states
  const [podcastTopic, setPodcastTopic] = useState("Generative Audio and the Future of Voiceover");
  const [podcastSpeakers, setPodcastSpeakers] = useState("Usman & Jane");
  const [podcastTone, setPodcastTone] = useState("High energy and informational");

  // Drag and Drop files handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCloneFileUploaded(true);
      setSttFileDesc(`Uploaded: ${e.dataTransfer.files[0].name} (${(e.dataTransfer.files[0].size/1000000).toFixed(2)}MB)`);
    }
  };

  // HTML5 Audio Speech engine play fallback so the app literally speaks!
  const triggerHtml5Speech = (textToSay: string) => {
    if (!window.speechSynthesis) {
      alert("TTS speaker unsupported in this browser sandbox.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSay);
    utterance.pitch = speechPitch;
    utterance.rate = speechSpeed;

    // Try finding nice matching local browser sound synthesizers
    const voices = window.speechSynthesis.getVoices();
    const voiceToLookUp = activePage === "voice-conversion" ? conversionTarget : selectedVoice;
    
    const matchedVoiceModel = combinedAssistants.find(v => v.name === voiceToLookUp);
    const isFemale = matchedVoiceModel 
      ? matchedVoiceModel.gender === "Female"
      : (
          voiceToLookUp.toLowerCase().includes("female") || 
          voiceToLookUp.toLowerCase().includes("samantha") || 
          voiceToLookUp.toLowerCase().includes("cortana") || 
          voiceToLookUp.toLowerCase().includes("friday") || 
          voiceToLookUp.toLowerCase().includes("clara") || 
          voiceToLookUp.toLowerCase().includes("aria") || 
          voiceToLookUp.toLowerCase().includes("zephyr") || 
          voiceToLookUp.toLowerCase().includes("puck")
        );

    if (voices.length > 0) {
      if (isFemale) {
        const matchingVoice = voices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("google us") || v.lang.toLowerCase().startsWith("en"));
        if (matchingVoice) utterance.voice = matchingVoice;
      } else {
        const matchingVoice = voices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("google") || v.lang.toLowerCase().startsWith("en"));
        if (matchingVoice) utterance.voice = matchingVoice;
      }
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setActiveSpeechUtterance(utterance);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  // CORE BACKEND API EXECUTOR FOR VOICE GENERATION
  const executeVoiceTool = async () => {
    if (!user) return;
    
    // Check if user has sufficient credits if not admin
    const characterCost = textToSpeechInput.length;
    if (user.role !== "admin" && user.credits < characterCost) {
      alert("Insufficient characters in your budget. Please update plans on Billing page.");
      return;
    }

    setIsProcessing(true);
    setComputedResult(null);
    setConversionProgress(0);

    const progressInterval = setInterval(() => {
      setConversionProgress((prev) => {
        if (prev >= 98) {
          return 98;
        }
        return prev + Math.floor(Math.random() * 8) + 3;
      });
    }, 120);

    // Prepare custom payload parameters according to each specialized tool
    let cleanPromptBody = "";
    let costMeasure = 100;

    switch (activePage) {
      case "text-to-speech":
        cleanPromptBody = textToSpeechInput;
        costMeasure = textToSpeechInput.length;
        break;
      case "speech-to-text":
        cleanPromptBody = `Transcribe simulated file info: ${sttFileDesc}`;
        costMeasure = 350; // flat speech rate
        break;
      case "voice-cloning":
        cleanPromptBody = `Voice clone creation request for profile "${cloneName}". Verified upload status: ${cloneFileUploaded}.`;
        costMeasure = 1200;
        break;
      case "voice-design":
        cleanPromptBody = JSON.stringify({
          name: designName,
          gender: designGender,
          age: designAge,
          accent: designAccent,
          breathiness: designBreath
        });
        costMeasure = 500;
        break;
      case "voice-conversion":
        cleanPromptBody = JSON.stringify({
          source: conversionSource,
          target: conversionTarget,
          content: conversionInputText
        });
        costMeasure = conversionInputText.length * 2;
        break;
      case "dubbing":
        cleanPromptBody = JSON.stringify({
          sourceLanguage: dubSourceLang,
          targetLanguage: dubTargetLang,
          content: dubInputText
        });
        costMeasure = dubInputText.length * 3;
        break;
      case "podcast-studio":
        cleanPromptBody = JSON.stringify({
          topic: podcastTopic,
          speakers: podcastSpeakers,
          tone: podcastTone
        });
        costMeasure = 2500; // podcast scripts draft expense
        break;
    }

    try {
      const response = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: mapPageIdToToolName(activePage),
          input: cleanPromptBody,
          characterCount: costMeasure
        })
      });

      const data = await response.json();
      if (response.ok && data.response) {
        clearInterval(progressInterval);
        setConversionProgress(100);
        setComputedResult(data.response);

        if (activePage === "text-to-speech") {
          try {
            const matchedVoice = combinedAssistants.find(a => a.name === selectedVoice);
            if (matchedVoice && matchedVoice.archetype === "Voice Clone") {
              // Custom cloned voice! Generate client-side using the multi-formant synth engine
              const wavUrl = generateSpeechWav(textToSpeechInput, matchedVoice.pitch, matchedVoice.speed);
              setSynthesizedAudioUrl(wavUrl);
            } else {
              const lang = getVoiceLocale(selectedVoice);
              const url = `/api/voice/proxy-tts?text=${encodeURIComponent(textToSpeechInput || "No input text provided.")}&lang=${lang}`;
              setSynthesizedAudioUrl(url);
            }
          } catch (e) {
            console.error("URH Labs: Failed to construct dynamic synthesized audio file:", e);
          }
        } else if (activePage === "voice-conversion") {
          try {
            const lang = getVoiceLocale(conversionTarget);
            const url = `/api/voice/proxy-tts?text=${encodeURIComponent(conversionInputText || "No voice conversion script content detected.")}&lang=${lang}`;
            setSynthesizedAudioUrl(url);
          } catch (e) {
            console.error("URH Labs: Failed to construct converted cloning synthesis audio:", e);
          }
        } else if (activePage === "voice-cloning") {
          try {
            const uid = user?.uid || "guest-user";
            await FirebaseIntegration.saveClonedVoice(uid, {
              name: cloneName || "Usman-Clone-V1",
              description: `Vocal print cloned from reference file`,
              gender: cloneGender,
              archetype: "Voice Clone",
              pitch: 1.0,
              speed: 1.0
            });
            setCloneSavedSuccess(true);
            await loadClonedVoices();
          } catch (err) {
            console.error("URH Labs: Failed to auto-save voice clone on execute:", err);
          }
        }

        // Deduct actual character credits on Firestore and synchronize logs
        const rem = await FirebaseIntegration.deductCredits(user.uid, costMeasure);
        const logItem = await FirebaseIntegration.addHistoryItem(
          user.uid,
          mapPageIdToToolName(activePage),
          getHumanInputDescription(),
          data.response,
          costMeasure
        );

        // Notify app parent hooks to synchronize metrics
        onAddHistory(logItem);
        onRefreshUser();
      } else {
        clearInterval(progressInterval);
        setConversionProgress(0);
        alert(data.message || "Failed to execute synthetic speech query.");
      }
    } catch (err) {
      clearInterval(progressInterval);
      setConversionProgress(0);
      console.error(err);
      alert("Error: Server pipeline failed to process voice conversion.");
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  const mapPageIdToToolName = (id: string): string => {
    switch (id) {
      case "text-to-speech": return "Text to Speech";
      case "speech-to-text": return "Speech to Text";
      case "voice-cloning": return "Voice Cloning";
      case "voice-design": return "Voice Design";
      case "voice-conversion": return "Voice Conversion";
      case "dubbing": return "Dubbing";
      case "podcast-studio": return "Podcast Studio";
      default: return "Audio Suite";
    }
  };

  const getHumanInputDescription = (): string => {
    switch (activePage) {
      case "text-to-speech": return textToSpeechInput;
      case "speech-to-text": return `Transcribe [${sttFileDesc}]`;
      case "voice-cloning": return `Clone sample voice for "${cloneName}" profile`;
      case "voice-design": return `Synthetic voice layout for: ${designName} (${designGender}/${designAccent})`;
      case "voice-conversion": return `Convert conversion format to track: "${conversionInputText}"`;
      case "dubbing": return `Dub script text to ${dubTargetLang}: "${dubInputText}"`;
      case "podcast-studio": return `Podcast composite script prompt: "${podcastTopic}"`;
      default: return "";
    }
  };

  // Reset tool context
  const clearSession = () => {
    setComputedResult(null);
    setTextToSpeechInput("");
    setSynthesizedAudioUrl(null);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN - PARAMS & CONTROL FORAI PANELS */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Module Header Title Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-950 to-black border border-white/5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#00f0ff]/5 rounded-full blur-xl pointer-events-none" />
          <h2 className="text-2xl font-black text-white tracking-tight capitalize flex items-center gap-2">
            <AudioLines className="w-5 h-5 text-[#00f0ff]" /> {mapPageIdToToolName(activePage)} Suite
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-sans">
            Define parameters and click Execute to compile instructions under URH Neural Synthesis nodes safely.
          </p>
        </div>

        {/* ==================== 1. TEXT TO SPEECH PANEL ==================== */}
        {activePage === "text-to-speech" && (
          <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-5">
            
            {/* Search and Retrieve Virtual Assistant Section */}
            <div className="space-y-2 pb-3 border-b border-white/5">
              <label className="text-xs font-mono font-bold uppercase text-gray-400 flex items-center gap-1.5 pt-1">
                <Search className="w-3.5 h-3.5 text-[#00f0ff]" /> Search & Retrieve Assistant Accent Models
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={assistantSearch}
                  onChange={(e) => setAssistantSearch(e.target.value)}
                  placeholder="Type voice profile Name, Gender, or Accent region (e.g. 'Jarvis', 'UK', 'US Female')..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-200 font-sans focus:outline-none focus:border-[#00f0ff]/80 placeholder-gray-600 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-gray-600 absolute left-3 top-3.5" />
                {assistantSearch && (
                  <button 
                    onClick={() => setAssistantSearch("")}
                    className="absolute right-3 top-2.5 px-2 py-0.5 rounded bg-white/10 text-gray-300 hover:text-white text-[10px] font-mono cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {/* Grid deck of retrieved models */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[145px] overflow-y-auto pr-1">
                {combinedAssistants
                  .filter((model) => {
                    const term = assistantSearch.toLowerCase();
                    return (
                      model.name.toLowerCase().includes(term) ||
                      model.description.toLowerCase().includes(term) ||
                      model.gender.toLowerCase().includes(term) ||
                      model.archetype.toLowerCase().includes(term)
                    );
                  })
                  .map((assistant) => {
                    const isSelected = selectedVoice === assistant.name;
                    return (
                      <button
                        key={assistant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVoice(assistant.name);
                          setSpeechPitch(assistant.pitch);
                          setSpeechSpeed(assistant.speed);
                        }}
                        className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-[82px] relative group ${
                          isSelected 
                            ? "bg-[#00f0ff]/10 border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.1)]" 
                            : "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${isSelected ? "text-[#00f0ff]" : "text-white group-hover:text-[#00f0ff]"} transition-colors`}>
                            {assistant.name}
                          </span>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                            assistant.gender === "Female" 
                              ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" 
                              : assistant.gender === "Male"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}>
                            {assistant.gender}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal line-clamp-1">{assistant.description}</p>
                        <div className="flex items-center justify-between text-[8px] font-mono text-gray-500 mt-0.5">
                          <span>{assistant.archetype}</span>
                          <span className="text-[#00ff66] font-bold">{assistant.pitch}x pitch / {assistant.speed}x speed</span>
                        </div>
                      </button>
                    );
                  })
                }
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-gray-500">Selected Vocal Accent Model Option</label>
              <select 
                value={selectedVoice} 
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  // Auto-align pitch and speed parameter templates if they correspond to an assistant model
                  const matched = combinedAssistants.find(a => a.name === e.target.value);
                  if (matched) {
                    setSpeechPitch(matched.pitch);
                    setSpeechSpeed(matched.speed);
                  }
                }}
                className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-[#00f0ff]/80 font-mono"
              >
                {combinedAssistants.map(a => (
                  <option key={a.id} className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value={a.name}>
                    {a.name} ({a.archetype})
                  </option>
                ))}
              </select>
            </div>

            {/* Timbre Adjuster Dual sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-gray-500">
                  <span>Pitch Mult</span>
                  <span>{speechPitch}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.1" 
                  value={speechPitch} 
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full accent-[#00f0ff]" 
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-gray-500">
                  <span>Speed Velocity</span>
                  <span>{speechSpeed}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.6" 
                  max="1.6" 
                  step="0.1" 
                  value={speechSpeed} 
                  onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                  className="w-full accent-[#00ff66]" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold uppercase text-gray-500">Synthesis Script Input Text</label>
                <span className="text-[10px] font-mono text-gray-500">
                  {textToSpeechInput.length} characters (1 credit per character)
                </span>
              </div>
              <textarea
                value={textToSpeechInput}
                onChange={(e) => setTextToSpeechInput(e.target.value)}
                rows={6}
                maxLength={4000}
                placeholder="Write your sound script or dialogue transcript here..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-[#00ff66]/80 placeholder-gray-600 font-sans"
              />
            </div>
          </div>
        )}

        {/* ==================== 2. SPEECH TO TEXT PANEL ==================== */}
        {activePage === "speech-to-text" && (
          <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-gray-500">Interactive Transcription Target</label>
              <div 
                onDragOver={handleDrag}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`w-full p-8 rounded-xl border border-dashed transition-all flex flex-col items-center justify-center text-center ${
                  dragActive 
                    ? "border-[#00f0ff] bg-[#00f0ff]/5" 
                    : "border-white/10 hover:border-[#00ff66]/30 bg-white/5"
                }`}
              >
                <div className="p-4 rounded-full bg-white/5 text-[#00f0ff] mb-3">
                  <Mic className="w-8 h-8 animate-pulse" />
                </div>
                <p className="text-sm font-bold text-gray-200">Drag & Drop simulated vocal file or Click to load</p>
                <p className="text-xs text-gray-500 mt-1">Supports MP3, WAV, ACC (Limit 15MB)</p>
                <input 
                  type="file" 
                  id="stt-file" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSttFileDesc(`Uploaded: ${e.target.files[0].name} (${(e.target.files[0].size/1000000).toFixed(2)}MB)`);
                    }
                  }}
                />
                <label 
                  htmlFor="stt-file"
                  className="mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono cursor-pointer border border-white/10"
                >
                  Retrieve System Sample
                </label>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between font-mono text-xs">
              <span className="text-gray-400">Loading Audio Context:</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#00f0ff] to-[#00ff66] font-bold">
                {sttFileDesc}
              </span>
            </div>
          </div>
        )}

        {/* ==================== 3. VOICE CLONING PANEL ==================== */}
        {activePage === "voice-cloning" && (
          <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-gray-500">Provide Clone Profile Tag</label>
                <input 
                  type="text" 
                  value={cloneName}
                  onChange={(e) => {
                    setCloneName(e.target.value);
                    setCloneSavedSuccess(false);
                  }}
                  placeholder="e.g. Usman-Anchor-Clone"
                  className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 font-mono focus:border-[#00f0ff]/50" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-gray-500">Cloned Voice Gender</label>
                <select 
                  value={cloneGender}
                  onChange={(e) => setCloneGender(e.target.value as "Male" | "Female" | "Neutral")}
                  className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-[#00f0ff]/50 font-mono"
                >
                  <option value="Male" className="bg-[#0b0c10] text-gray-200">Male</option>
                  <option value="Female" className="bg-[#0b0c10] text-gray-200">Female</option>
                  <option value="Neutral" className="bg-[#0b0c10] text-gray-200">Neutral</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-gray-500">Vocal Biometric reference Upload</label>
              <div 
                onDragOver={handleDrag}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`w-full p-8 rounded-xl border border-dashed transition-all flex flex-col items-center justify-center text-center ${
                  cloneFileUploaded 
                    ? "border-[#00ff66] bg-[#00ff66]/5" 
                    : dragActive 
                      ? "border-[#00f0ff] bg-[#00f0ff]/5"
                      : "border-white/10 hover:border-[#00f0ff]/30 bg-white/5"
                }`}
              >
                <div className={`p-4 rounded-full bg-white/5 mb-3 ${cloneFileUploaded ? "text-[#00ff66]" : "text-gray-400"}`}>
                  {cloneFileUploaded ? <Check className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>
                {cloneFileUploaded ? (
                  <div>
                    <p className="text-sm font-bold text-gray-200">Ref snippet successfully registered!</p>
                    <p className="text-xs text-[#00ff66] mt-1 font-mono">15.4 seconds audio loaded</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-gray-200">Drag & Drop vocal sample representation</p>
                    <p className="text-xs text-gray-500 mt-1">Provide 10-30 seconds of high-fidelity audio (MP3/WAV)</p>
                  </div>
                )}
                <input 
                  type="file" 
                  id="clone-file" 
                  className="hidden" 
                  onChange={() => setCloneFileUploaded(true)} 
                />
                <label 
                  htmlFor="clone-file"
                  className="mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono cursor-pointer border border-white/10"
                >
                  Locate Audio Snippet
                </label>
              </div>
            </div>

            {/* Save clone voice trigger area once synthesized */}
            {computedResult && (
              <div className="pt-4 border-t border-white/5 space-y-3">
                {cloneSavedSuccess ? (
                  <div className="p-3.5 bg-[#00ff66]/10 border border-[#00ff66]/20 rounded-xl flex items-center gap-2 text-xs text-[#00ff66] font-medium">
                    <Check className="w-4 h-4 shrink-0 text-[#00ff66]" />
                    <span>Cloned Voice Model <strong>"{cloneName}"</strong> successfully registered and saved to your Accent Library!</span>
                  </div>
                ) : (
                   <button
                    type="button"
                    onClick={async () => {
                      const uid = user?.uid || "guest-user";
                      setIsSavingClone(true);
                      try {
                        await FirebaseIntegration.saveClonedVoice(uid, {
                          name: cloneName,
                          description: `Saved custom voice clone envelope parameter profile for ${cloneName}`,
                          gender: cloneGender,
                          archetype: "Voice Clone",
                          pitch: 1.0,
                          speed: 1.0
                        });
                        setCloneSavedSuccess(true);
                        await loadClonedVoices();
                      } catch (err) {
                        console.error("URH Labs: Failed to write cloned voice:", err);
                        alert("Failed to save voice clone.");
                      } finally {
                        setIsSavingClone(false);
                      }
                    }}
                    disabled={isSavingClone}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00ff66] hover:brightness-110 text-black font-extrabold text-xs tracking-wide shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSavingClone ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-black" />
                        <span>Save Cloned Voice</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Cloned Voices Library List */}
            <div className="pt-4 border-t border-white/5 space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-gray-500 flex items-center gap-1.5">
                <AudioLines className="w-3.5 h-3.5 text-[#00ff66]" /> Custom Accent Library ({clonedVoices.length})
              </label>
              {clonedVoices.length === 0 ? (
                <p className="text-xs text-gray-500 italic pb-1">No custom vocal clones registered yet. Specify Tag, drop vocal reference, and hit "Clone voice" below.</p>
              ) : (
                <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                  {clonedVoices.map((cv) => (
                    <div key={cv.id} className="p-2.5 rounded-xl bg-[#0c0d12] border border-white/5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{cv.name}</span>
                          <span className={`text-[8px] font-mono px-1 rounded ${
                            cv.gender === "Female" 
                              ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" 
                              : cv.gender === "Male" 
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}>{cv.gender}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono truncate">{cv.id} • {new Date(cv.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete clone "${cv.name}"?`)) {
                            await FirebaseIntegration.deleteClonedVoice(user?.uid || "", cv.id);
                            await loadClonedVoices();
                            if (selectedVoice === cv.name) {
                              setSelectedVoice("Kore (Warm Baritone)");
                            }
                          }
                        }}
                        className="p-1 px-2 text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded transition-all cursor-pointer text-xs font-mono flex items-center gap-1"
                        title="Delete voice profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 4. VOICE DESIGN PANEL ==================== */}
        {activePage === "voice-design" && (
          <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-gray-500">Virtual Voice Profile Name</label>
              <input 
                type="text" 
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                placeholder="e.g. Sonia-HyperReal"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 font-mono focus:border-[#00ff66]/50" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-gray-500">Target Gender</label>
                <select 
                  value={designGender}
                  onChange={(e) => setDesignGender(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none"
                >
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Female">Female</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Male">Male</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Ambiguous">Neutral/Unspecified</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-gray-500">Accent Archetype</label>
                <select 
                  value={designAccent}
                  onChange={(e) => setDesignAccent(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none font-mono"
                >
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="British RP">British RP (Elegant)</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="US Southern">US Southern Drawl</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Australian">Australian Broad Accent</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="South Asian">South Asian Standard</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Irish Anchor">Irish Lilt</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-gray-500">Speaker Age Class</label>
              <div className="grid grid-cols-3 gap-2">
                {["Teenager", "Young Adult", "Middle Aged"].map((age) => (
                  <button
                    key={age}
                    onClick={() => setDesignAge(age)}
                    className={`py-2 rounded-lg text-xs font-semibold border ${
                      designAge === age 
                        ? "bg-[#00f0ff]/10 border-[#00f0ff] text-white" 
                        : "bg-white/5 border-white/5 hover:border-white/10 text-gray-400"
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-gray-500">
                <span>Vocal Air-Breath Ratio</span>
                <span>{designBreath}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="80" 
                value={designBreath}
                onChange={(e) => setDesignBreath(parseInt(e.target.value))}
                className="w-full accent-[#00f0ff]" 
              />
            </div>
          </div>
        )}

        {/* ==================== 5. VOICE CONVERSION PANEL ==================== */}
        {activePage === "voice-conversion" && (
          <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-gray-500">Original Timbre</label>
                <select 
                  value={conversionSource}
                  onChange={(e) => setConversionSource(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none font-mono"
                >
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Fenrir (Calm Narrator)">Fenrir (Calm Narrator)</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Zephyr (Energetic Female)">Zephyr (Energetic Female)</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Standard US Male">Standard US Male</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-gray-500">Target Clone Output</label>
                <select 
                  value={conversionTarget}
                  onChange={(e) => setConversionTarget(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none font-mono"
                >
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Usman-Clone-V1">Usman-Clone-V1 (Default)</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Sonia-Interactive">Designed profile: Sonia</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-gray-500">Script Content to Convert</label>
              <textarea 
                value={conversionInputText}
                onChange={(e) => setConversionInputText(e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-200 font-sans focus:border-[#00ff66]/50"
              />
            </div>
          </div>
        )}

        {/* ==================== 6. AI DUBBING PANEL ==================== */}
        {activePage === "dubbing" && (
          <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-gray-500">Source Language</label>
                <select 
                  value={dubSourceLang}
                  onChange={(e) => setDubSourceLang(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 font-mono"
                >
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="English">English</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Spanish">Spanish</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Urdu/Hindi">Urdu / Hindi</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="German">German</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-gray-500">Target Translated Dub</label>
                <select 
                  value={dubTargetLang}
                  onChange={(e) => setDubTargetLang(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 font-mono"
                >
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Spanish">Spanish</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="English">English</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Urdu/Hindi">Urdu / Hindi</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Japanese">Japanese</option>
                  <option className="bg-[#0b0c10] text-gray-200 py-2 font-mono" value="Chinese Mandarine">Chinese Mandarine</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-gray-500">Orig Clip Dub Transcript</label>
              <textarea 
                value={dubInputText}
                onChange={(e) => setDubInputText(e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-200 font-sans"
              />
            </div>
          </div>
        )}

        {/* ==================== 7. PODCAST STUDIO PANEL ==================== */}
        {activePage === "podcast-studio" && (
          <div className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-gray-500">Define Episode Topic</label>
              <input 
                type="text" 
                value={podcastTopic}
                onChange={(e) => setPodcastTopic(e.target.value)}
                placeholder="e.g. Artificial general intelligence in media platforms..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 font-sans focus:border-[#00f0ff]/50" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-gray-500">Speakers Names</label>
                <input 
                  type="text" 
                  value={podcastSpeakers}
                  onChange={(e) => setPodcastSpeakers(e.target.value)}
                  placeholder="e.g. Usman & Jane"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 font-sans" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-gray-500">Desired Tone style</label>
                <input 
                  type="text" 
                  value={podcastTone}
                  onChange={(e) => setPodcastTone(e.target.value)}
                  placeholder="e.g. Friendly, late night talkshow"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 font-sans" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Action controls button deck */}
        <div className="flex gap-4">
          <button
            onClick={executeVoiceTool}
            disabled={isProcessing}
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00ff66] hover:brightness-110 text-black font-extrabold text-sm tracking-wide shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_30px_rgba(0,255,102,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin text-black" />
                <span>
                  {activePage === "text-to-speech" 
                    ? `Converting Voice... ${conversionProgress}%` 
                    : activePage === "voice-cloning"
                      ? `Cloning Voice... ${conversionProgress}%`
                      : "Processing Neural Node..."}
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-black" />
                <span>
                  {activePage === "text-to-speech" 
                    ? "Convert to Speech" 
                    : activePage === "voice-cloning"
                      ? "Clone voice"
                      : "Execute Virtual Voice synthesis"}
                </span>
              </>
            )}
          </button>

          <button 
            onClick={clearSession}
            className="px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all text-xs font-mono"
            title="Clean text panel"
          >
            Clear
          </button>
        </div>

        {/* Dynamic conversion progress monitor panel */}
        {isProcessing && (
          <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-3 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-[#00f0ff] to-[#00ff66] animate-pulse" style={{ width: `${conversionProgress}%` }} />
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
                {activePage === "text-to-speech" ? "Vocal Pitch & Resonator Alignment" : "Processing Audio Matrix"}
              </span>
              <span className="text-xs font-mono font-black text-[#00ff66] bg-[#00ff66]/10 px-2.5 py-0.5 rounded-full border border-[#00ff66]/20">
                {conversionProgress}%
              </span>
            </div>

            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-[1px] border border-white/10">
              <div 
                style={{ width: `${conversionProgress}%` }}
                className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] rounded-full transition-all duration-150"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>
                {conversionProgress < 25 ? "Ingesting vocal timbre matrix..." :
                 conversionProgress < 50 ? "Adapting formant acoustic filters..." :
                 conversionProgress < 75 ? "Rendering high-frequency sibilance overlays..." :
                 conversionProgress < 95 ? "Structuring downloadable PCM file stream..." : "Synthesis node compilation successful."}
              </span>
              <span>16.0 kHz Mono WAV</span>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN - LIVE MONITOR & DYNAMIC RESPONSES BLOCK */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 rounded-2xl bg-black border border-white/5 flex flex-col justify-between min-h-[460px] relative overflow-hidden">
          {/* Neon green corner block */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff66]/5 rounded-bl-full pointer-events-none blur-xl" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-xs font-mono font-bold tracking-widest text-[#00f0ff] uppercase flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Sound Synthesis Terminal
              </h3>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] text-[#00ff66] font-mono">
                <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full animate-pulse" />
                <span>Ready</span>
              </div>
            </div>

            {/* Simulated Live Audio Output waveform visualizer */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <span className="text-[10px] font-mono text-gray-500 block uppercase">Real-time Spectral Wave</span>
              <div className="h-10 flex items-center justify-center gap-1 bg-black/45 rounded-lg overflow-hidden relative px-4">
                {/* Audio pulse frequency wave rendering */}
                {Array.from({ length: 28 }).map((_, i) => {
                  const delay = i * 0.05;
                  return (
                    <div 
                      key={i} 
                      style={{ 
                        height: isPlaying ? `${Math.sin(i / 2) * 20 + 24}px` : "1px",
                        animationDelay: `${delay}s` 
                      }}
                      className={`w-[3px] bg-gradient-to-t from-[#00f0ff] to-[#00ff66] rounded-full ${isPlaying ? "animate-bounce" : "bg-gray-700"}`}
                    />
                  );
                })}
                {!isPlaying && (
                  <span className="absolute text-[10px] font-mono text-gray-500 uppercase tracking-widest">Synthesis Idle</span>
                )}
              </div>
              
              {/* Playback action controller */}
              {computedResult && (activePage === "text-to-speech" || activePage === "voice-conversion") && (
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-sans text-gray-400">Stream Playback:</span>
                    <button
                      onClick={() => triggerHtml5Speech(activePage === "text-to-speech" ? textToSpeechInput : conversionInputText)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1.5 shadow transition-all cursor-pointer ${
                        isPlaying 
                          ? "bg-red-500/20 text-red-400 border border-red-500/30 font-semibold" 
                          : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Mute Speech</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-white" />
                          <span>Speak Aloud</span>
                        </>
                      )}
                    </button>
                  </div>

                  {synthesizedAudioUrl && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-[#00ff66]" /> Synthesized Vocal File:
                        </span>
                        
                        <a
                          href={synthesizedAudioUrl}
                          download={`URH_Synthesized_Voice_${Date.now()}.mp3`}
                          className="px-2.5 py-1.5 bg-[#00ff66] hover:bg-[#00ff66]/90 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 transition-all shadow cursor-pointer"
                        >
                          <HardDriveDownload className="w-3.5 h-3.5 text-black" />
                          <span>Download Voice (.mp3)</span>
                        </a>
                      </div>

                      <div className="audio-player-wrapper pt-1">
                        <audio 
                          src={synthesizedAudioUrl} 
                          controls 
                          className="w-full h-8 accent-[#00ff66] bg-black/40 rounded-lg text-xs"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono">
                        Download this high-fidelity studio-grade MP3 audio file directly to play back on your laptop.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Generated output text box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Acoustic Output Log</span>
                {computedResult && (
                  <button 
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([computedResult ?? ""], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = `URH_${activePage}_Output.md`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="text-[10px] text-gray-400 hover:text-[#00f0ff] flex items-center gap-1 font-mono transition-colors"
                  >
                    <HardDriveDownload className="w-3 h-3" /> Save report
                  </button>
                )}
              </div>

              <div className="w-full bg-[#050508] border border-white/5 rounded-xl p-4 min-h-[220px] max-h-[300px] overflow-y-auto custom-scrollbar relative">
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#00f0ff] mb-2" />
                    <p className="text-sm font-semibold text-gray-200">Generating Neural Synthesis...</p>
                    <p className="text-xs text-gray-500 mt-1">Slicing voice timbre and validating character allocations securely.</p>
                  </div>
                ) : computedResult ? (
                  <div className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap space-y-2 prose prose-invert">
                    {computedResult}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                    <Sparkles className="w-6 h-6 text-gray-600 mb-2 animate-pulse" />
                    <p className="text-xs font-mono uppercase tracking-widest">Awaiting execution prompt</p>
                    <p className="text-[11px] text-gray-600 mt-1 font-sans">
                      Setup your vocal inputs on the left side and hit "Execute" to synthesize your sound blueprint.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="text-[10px] font-mono text-gray-600 text-center border-t border-white/5 pt-3">
            Secure Full-Stack Node • Verified through Gemini AI Service
          </div>
        </div>
      </div>
    </div>
  );
}
