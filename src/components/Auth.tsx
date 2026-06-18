/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Check, 
  Play, 
  ShieldAlert, 
  Sparkles,
  RefreshCcw,
  UserCheck,
  Zap
} from "lucide-react";
import { FirebaseIntegration } from "../firebase";
import { UserProfile } from "../types";

interface AuthProps {
  onAuthSuccess: (user: UserProfile) => void;
  initialForm?: "login" | "signup" | "forgot";
  onBackToLanding?: () => void;
}

export default function Auth({ onAuthSuccess, initialForm = "login", onBackToLanding }: AuthProps) {
  const [activeForm, setActiveForm] = useState<"login" | "signup" | "forgot">(initialForm);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<"user" | "admin">("user"); // Custom setup override

  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Sync state if initialForm prop changes
  useEffect(() => {
    setActiveForm(initialForm);
  }, [initialForm]);

  // Submit Sign In or Register Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeForm === "login") {
        const profile = await FirebaseIntegration.login(email, password);
        onAuthSuccess(profile);
      } else if (activeForm === "signup") {
        const profile = await FirebaseIntegration.register(name, email, password, userRole === "admin");
        onAuthSuccess(profile);
      } else {
        // Forgot password simulation
        setForgotSent(true);
      }
    } catch (err: any) {
      let friendlyMessage = err.message || "Credential verification failed. Please check your credentials and try again.";
      try {
        // If it's a Firestore/Auth JSON structured exception, extract details
        const parsed = JSON.parse(err.message);
        if (parsed && typeof parsed === "object") {
          friendlyMessage = `Firebase System Alert:\n\n[Code]: ${parsed.operationType?.toUpperCase()} on ${parsed.path || "unknown"}\n[Issue]: ${parsed.error}\n\nTip: If you recently linked your own Firebase project, make sure Cloud Firestore is enabled and rule deployment completed.`;
        }
      } catch {
        // Not a JSON string error, keep default
      }
      alert(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Auto Login helper for sandbox evaluation
  const handleAutoLogin = async (role: "user" | "admin") => {
    setIsSubmitting(true);
    try {
      const emailTarget = role === "admin" ? "usmankhalid619131@gmail.com" : "john@example.com";
      const passwordTarget = role === "admin" ? "619131" : "password123";
      const profile = await FirebaseIntegration.login(emailTarget, passwordTarget);
      onAuthSuccess(profile);
    } catch (err) {
      // If profile missing, register automatically
      try {
        const dummyName = role === "admin" ? "Usman Khalid (Admin)" : "Mock Tester";
        const dummyMail = role === "admin" ? "usmankhalid619131@gmail.com" : "john@example.com";
        const passwordTarget = role === "admin" ? "619131" : "password123";
        const profile = await FirebaseIntegration.register(dummyName, dummyMail, passwordTarget, role === "admin");
        onAuthSuccess(profile);
      } catch (nestedErr: any) {
        alert(nestedErr.message || "Failed sandbox auto registration.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google SSO authentication handler
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const profile = await FirebaseIntegration.loginWithGoogle();
      onAuthSuccess(profile);
    } catch (err: any) {
      let friendlyMessage = err.message || "Google single sign-on verification failed. Please try again.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed && typeof parsed === "object") {
          friendlyMessage = `Google Account Auth Alert:\n\n[Code]: ${parsed.operationType?.toUpperCase()} on ${parsed.path || "unknown"}\n[Issue]: ${parsed.error}\n\nTip: Make sure Google Sign-In is enabled in your Firebase Authentication settings page.`;
        }
      } catch {
        // Keeps standard text
      }
      alert(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background neon glows */}
      <div className="absolute left-[-10%] top-[-10%] w-[50%] h-[50%] bg-[#00f0ff]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[50%] h-[50%] bg-[#00ff66]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 relative z-15">
        
        {/* LEFT COLUMN: Visual Portal branding */}
        <div className="md:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-[#030305]/60 border border-white/5 backdrop-blur-md relative min-h-[300px]">
          <div>
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="mb-6 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-gray-500 hover:text-[#00f0ff] transition-colors cursor-pointer uppercase tracking-wider"
              >
                ← Back to Home
              </button>
            )}

            {/* Inline Branded Sound Vector */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#00ff66] p-[1.5px] shadow-[0_0_20px_rgba(0,240,255,0.4)] mb-6">
              <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-9 h-9 text-[#00f0ff]" fill="none" stroke="currentColor" strokeWidth="5">
                  <path d="M25 75V25C25 45 40 55 50 55C60 55 75 45 75 25V75" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M50 55V85" stroke="#00ff66" strokeLinecap="round" />
                  <circle cx="50" cy="55" r="5" fill="#00ff66" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-black text-white tracking-tight">
                URH <span className="text-[#00f0ff]">LABS</span>
              </h1>
              <p className="text-gray-400 text-xs leading-relaxed">
                Unlock studio-grade Text to Speech, vocal clone mapping, neural translation, lip-sync dubbing, and interactive podcast compositions.
              </p>
            </div>
          </div>

          {/* Secure System Access */}
          <div className="space-y-2 border-t border-white/5 pt-6 mt-6">
            <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase block font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#00f0ff]" /> Access Control Enabled
            </span>
            <p className="text-[10px] text-gray-400 font-sans leading-normal">
              Unauthorized access attempt logs are audited live. Registered system administrators must authenticate using secure credentials.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Formal logins Inputs */}
        <div className="md:col-span-7 p-8 rounded-2xl bg-[#060608] border border-white/5 shadow-2xl relative">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#00f0ff]/5 rounded-bl-full pointer-events-none" />

          {activeForm === "forgot" ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Retrieve Sandbox Passwords</h3>
                <p className="text-gray-400 text-xs mt-1">
                  Submit your registration email to record a simulated pass recovery link.
                </p>
              </div>

              {forgotSent ? (
                <div className="p-4 bg-[#00ff66]/5 border border-[#00ff66]/20 rounded-xl space-y-3">
                  <span className="text-xs text-[#00ff66] font-mono block font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Link transmitted!
                  </span>
                  <p className="text-[11px] text-gray-400 font-sans">
                    Password recovery simulation message dispatched to <b>{email}</b>. In sandbox presets, you can always reload using 'Sandbox Login' widgets on the left.
                  </p>
                  <button 
                    onClick={() => { setActiveForm("login"); setForgotSent(false); }}
                    className="text-white hover:text-[#00f0ff] text-xs underline font-bold"
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Your Account Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. support@urhlabs.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono"
                        required 
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black font-extrabold text-sm tracking-wide shadow uppercase"
                  >
                    Send Recovery Blueprint
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Form title */}
              <div>
                {activeForm === "signup" ? (
                  <h3 className="text-3xl font-black text-white tracking-tight mb-1">
                    Account
                  </h3>
                ) : (
                  <>
                    <h3 className="text-xl font-black text-white tracking-tight">
                      {activeForm === "login" ? "Welcome back to URH LABS Node" : "Instantiate custom voice account"}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 font-sans">
                      {activeForm === "login" ? "Sign in using credentials or activate quick sandbox access." : "Initialize a brand developer node in seconds."}
                    </p>
                  </>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
                
                {/* Name Input ONLY on sign up */}
                {activeForm === "signup" && (
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">User</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-sans"
                        required 
                      />
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">User Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. user@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono"
                      required 
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Password</label>
                    {activeForm === "login" && (
                      <button 
                        type="button"
                        onClick={() => setActiveForm("forgot")}
                        className="text-[10px] text-[#00f0ff] hover:underline hover:text-[#00ff66] transition-colors cursor-pointer"
                      >
                        Reset pass?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white text-sans"
                      required 
                    />
                  </div>
                </div>

                {/* Admin Select override for easy onboarding */}
                {activeForm === "signup" && (
                  <div className="space-y-1 pt-1">
                    <label className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Onboarding Authorization Rank</label>
                    <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-sans">
                      <button
                        type="button"
                        onClick={() => setUserRole("user")}
                        className={`py-2 rounded-lg border font-semibold ${
                          userRole === "user" 
                            ? "bg-[#00f0ff]/10 border-[#00f0ff] text-white" 
                            : "bg-white/5 border-white/5 hover:border-white/10 text-gray-400"
                        }`}
                      >
                        Client
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserRole("admin")}
                        className={`py-2 rounded-lg border font-semibold ${
                          userRole === "admin" 
                            ? "bg-[#00ff66]/10 border-[#00ff66] text-white" 
                            : "bg-white/5 border-white/5 hover:border-white/10 text-gray-400"
                        }`}
                      >
                        Systems Admin Node
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00ff66] hover:brightness-105 text-black font-extrabold text-sm tracking-wide shadow flex items-center justify-center gap-2 cursor-pointer uppercase"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin text-black" />
                      <span>Transmitting secure session...</span>
                    </>
                  ) : (
                    <>
                      <span>{activeForm === "login" ? "Sign in" : "Sign up"}</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </>
                  )}
                </button>

                {/* Google Sign-In Option */}
                <div className="relative my-4 flex py-1 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-gray-500 text-[10px] uppercase font-bold tracking-wider">or continue with</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 rounded-xl bg-white hover:bg-gray-100 text-black font-extrabold text-sm tracking-wide shadow flex items-center justify-center gap-2 cursor-pointer uppercase transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-2.47-.81-5.16 0-7.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62-.03 3.17.58 4.32 1.69l3.23-3.23C17.56 1.83 14.88 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>Google</span>
                </button>
              </form>

              {/* Form switcher options */}
              <div className="text-center font-sans text-xs text-gray-400 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5">
                <span>
                  {activeForm === "login" ? "New to URH LABS Platform?" : "Returning developer credentials?"}
                </span>
                <button
                  onClick={() => setActiveForm(activeForm === "login" ? "signup" : "login")}
                  className="text-[#00ff66] hover:text-[#00f0ff] font-bold underline transition-colors cursor-pointer"
                >
                  {activeForm === "login" ? "Create an account" : "Log in node"}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
