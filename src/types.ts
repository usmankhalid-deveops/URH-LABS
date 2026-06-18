/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  credits: number; // characters or queries remaining
  plan: string; // "Free Plan", "1M Characters", "3M Characters", "5M Characters", "11M Characters"
  role: "user" | "admin";
  createdAt: string;
  status?: "online" | "offline";
  lastActiveAt?: string;
  offeredPlans?: string[]; // list of plans currently offered to the user
}

export interface HistoryItem {
  id: string;
  userId: string;
  tool: string; // e.g. "Text to Speech", "Speech to Text"
  request: string; // The user input prompt/text
  response: string; // The generated result text or audio metadata description
  creditsUsed: number;
  createdAt: string;
  audioUrl?: string; // If generated audio exists
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  plan: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  screenshotUrl: string; // Data URL or storage URI of payment screenshot
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface ClonedVoice {
  id: string;
  userId: string;
  name: string;
  description: string;
  gender: "Male" | "Female" | "Neutral";
  archetype: string;
  pitch: number;
  speed: number;
  createdAt: string;
}

export interface SaaSPlan {
  id: string;
  name: string;
  credits: number; // absolute characters/queries
  creditsDisplay: string; // e.g., "1,000,000 Characters"
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isPopular?: boolean;
}

export type ActivePage =
  | "dashboard"
  | "text-to-speech"
  | "speech-to-text"
  | "voice-cloning"
  | "voice-design"
  | "voice-conversion"
  | "dubbing"
  | "podcast-studio"
  | "history"
  | "billing"
  | "developers"
  | "settings"
  | "admin";
