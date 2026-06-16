/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  CreditCard, 
  Check, 
  X, 
  TrendingUp, 
  ShieldAlert, 
  Search,
  ExternalLink,
  PlusCircle,
  Database,
  Lock,
  Eye,
  AudioLines
} from "lucide-react";
import { UserProfile, PaymentRequest } from "../types";
import { FirebaseIntegration } from "../firebase";

interface AdminPanelProps {
  currentUser: UserProfile | null;
  onRefreshUser: () => void;
}

export default function AdminPanel({ currentUser, onRefreshUser }: AdminPanelProps) {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Searching/Filtering states
  const [userSearch, setUserSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Selection state for screenshot viewer
  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState<string | null>(null);

  // Manual Credit adjustment inline forms
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [adjustedCredits, setAdjustedCredits] = useState<number>(100000);
  const [adjustedPlan, setAdjustedPlan] = useState<string>("1M Characters");

  // Data prefetcher
  const syncAdministrativeState = async () => {
    setLoading(true);
    try {
      const uList = await FirebaseIntegration.getAllUsers();
      const pList = await FirebaseIntegration.getPaymentRequests();
      setUsersList(uList);
      setPaymentsList(pList);
    } catch (err) {
      console.error("Failed to prefetch admin details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncAdministrativeState();
  }, []);

  // Handle Approving a Receipt
  const approveReceipt = async (requestId: string) => {
    try {
      await FirebaseIntegration.updatePaymentRequestStatus(requestId, "approved");
      alert("Billing receipt approved. Character credits and subscription plan successfully updated!");
      await syncAdministrativeState();
      onRefreshUser();
    } catch (err) {
      console.error(err);
      alert("Error: Core database write failed during receipt approval.");
    }
  };

  // Handle Rejecting a Receipt
  const rejectReceipt = async (requestId: string) => {
    try {
      await FirebaseIntegration.updatePaymentRequestStatus(requestId, "rejected");
      alert("Transaction receipt declined. Request catalog state changed to rejected.");
      await syncAdministrativeState();
    } catch (err) {
      console.error(err);
      alert("Error cancelling payment ticket");
    }
  };

  // Manual arbitrary credits allocations
  const allocateManualCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    try {
      await FirebaseIntegration.manuallyAdjustUserCredits(
        selectedUserForEdit.uid,
        adjustedCredits,
        adjustedPlan
      );
      alert(`Manual override success: Allocated ${adjustedCredits.toLocaleString()} characters under plan ${adjustedPlan}!`);
      setSelectedUserForEdit(null);
      await syncAdministrativeState();
      onRefreshUser();
    } catch (err) {
      console.error(err);
      alert("Failed manual adjustment overwrite.");
    }
  };

  // Computed summary metrics
  const totalUsers = usersList.length;
  const pendingRequests = paymentsList.filter(p => p.status === "pending");
  const pendingRequestsTotalValue = pendingRequests.reduce((sum, current) => sum + current.amount, 0);
  const totalCreditsDistributed = usersList.reduce((sum, u) => sum + (u.role === "admin" ? 0 : u.credits), 0);

  // Filters output
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredPayments = paymentsList.filter(p => 
    paymentFilter === "all" ? true : p.status === paymentFilter
  );

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh] bg-black border border-red-500/10 rounded-2xl">
        <Lock className="w-12 h-12 text-red-500 mb-3 animate-pulse" />
        <h3 className="text-xl font-bold text-white uppercase tracking-wider font-mono">Access Denied</h3>
        <p className="text-gray-400 text-xs mt-2 max-w-sm font-sans">
          Your current security authorization role is not administrative. Toggle "Role: ADMIN" in the bottom sidebar node to evaluate this screen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Upper stats banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-gradient-to-b from-gray-950 to-black border border-white/5 space-y-1">
          <span className="text-[10px] font-mono tracking-wider font-bold text-gray-500 block uppercase">Total SaaS Registrations</span>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-2xl font-black text-white font-mono">{totalUsers}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-b from-gray-950 to-black border border-white/5 space-y-1">
          <span className="text-[10px] font-mono tracking-wider font-bold text-gray-500 block uppercase">Pending Receipts Queue</span>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#00ff66]" />
            <span className="text-2xl font-black text-[#00ff66] font-mono">{pendingRequests.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-b from-gray-950 to-black border border-white/5 space-y-1">
          <span className="text-[10px] font-mono tracking-wider font-bold text-gray-500 block uppercase">Pending Transfers Total</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-2xl font-black text-white font-mono">PKR {pendingRequestsTotalValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-b from-gray-950 to-black border border-white/5 space-y-1">
          <span className="text-[10px] font-mono tracking-wider font-bold text-gray-500 block uppercase">Total Distributed Character Load</span>
          <div className="flex items-center gap-2">
            <AudioLines className="w-4 h-4 text-indigo-400" />
            <span className="text-2xl font-black text-white font-mono">{totalCreditsDistributed.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* Main Core section split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Payment Requests Receipts List (7 Cols) */}
        <div className="xl:col-span-7 p-6 rounded-2xl bg-black border border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-gray-300">
                Billing Requests Verification Queue
              </h3>
              <p className="text-[10px] text-gray-500 font-sans mt-0.5">
                Audit uploaded deposit receipts to unlock character credits securely.
              </p>
            </div>
            
            {/* Payment state filter controls */}
            <div className="flex rounded-lg bg-white/5 p-1 font-mono text-[10px]">
              {["all", "pending", "approved", "rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => setPaymentFilter(st as any)}
                  className={`px-2.5 py-1 rounded capitalize ${
                    paymentFilter === st 
                      ? "bg-gradient-to-r from-[#00f0ff]/15 to-[#00ff66]/15 text-white border border-[#00f0ff]/20 font-bold" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-gray-500">
              Synchronizing billing catalogs...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-20 text-center text-gray-500 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center p-6">
              <Check className="w-8 h-8 text-[#00ff66] mb-2 animate-bounce" />
              <p className="text-sm font-semibold text-gray-300">Queue is Clear</p>
              <p className="text-xs text-gray-500">No payment receipts found matching request status.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {filteredPayments.map((pay) => (
                <div 
                  key={pay.id}
                  className="p-4 rounded-xl bg-gradient-to-b from-gray-950 to-black border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#00ff66] text-black text-xs font-bold flex items-center justify-center">
                        {pay.userName.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white block">{pay.userName}</span>
                        <span className="text-[10px] text-gray-400 block font-mono">{pay.userEmail}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-[11px] font-mono">
                      <span className="text-gray-500">Paid: <b className="text-white">PKR {pay.amount.toLocaleString()}</b></span>
                      <span className="text-gray-500">Date: <b className="text-[#00f0ff]">{new Date(pay.createdAt).toLocaleDateString()}</b></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View screenshot modal button */}
                    <button 
                      onClick={() => setSelectedScreenshotUrl(pay.screenshotUrl)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-[#00f0ff]/30 text-xs flex items-center gap-1 cursor-pointer font-mono"
                      title="Inspect screenshot receipt"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#00f0ff]" /> View Receipt
                    </button>

                    {pay.status === "pending" && (
                      <>
                        {/* Approve receipt */}
                        <button
                          onClick={() => approveReceipt(pay.id)}
                          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-[#00ff66] hover:text-black hover:shadow-[0_0_10px_rgba(0,255,102,0.3)] transition-all font-mono text-xs flex items-center gap-1 cursor-pointer"
                          title="Accept and allocate character allowance"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>

                        {/* Reject receipt */}
                        <button
                          onClick={() => rejectReceipt(pay.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black transition-all font-mono text-xs flex items-center gap-1 cursor-pointer"
                          title="Decline deposit"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}

                    {pay.status !== "pending" && (
                      <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                        pay.status === "approved" ? "bg-emerald-950/40 text-[#00ff66]" : "bg-red-950/40 text-red-400"
                      }`}>
                        {pay.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Users Listing & manual Credit additions (5 Cols) */}
        <div className="xl:col-span-5 p-6 rounded-2xl bg-black border border-white/5 space-y-4">
          <div className="border-b border-white/5 pb-4 space-y-2">
            <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-gray-300">
              Users Character Credit allocations
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
              <input 
                type="text" 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search email/name..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
            {filteredUsers.map((user) => (
              <div 
                key={user.uid}
                className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h5 className="font-bold text-white">{user.name}</h5>
                  <span className="text-[10px] text-gray-400 block truncate max-w-xs font-mono">{user.email}</span>
                  <div className="flex gap-2 text-[9px] font-mono text-gray-500 mt-1">
                    <span>Credits: <b className="text-[#00f0ff]">{user.role === "admin" ? "∞" : user.credits.toLocaleString()}</b></span>
                    <span>•</span>
                    <span>Role: <b className="capitalize text-white">{user.role}</b></span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedUserForEdit(user);
                    setAdjustedCredits(user.credits);
                    setAdjustedPlan(user.plan);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white hover:text-[#00ff66] border border-white/10 hover:border-[#00ff66]/20 text-[10px] font-mono transition-colors cursor-pointer"
                >
                  Adjust credits
                </button>
              </div>
            ))}
          </div>

          {/* Form container for adjusting credits of selected user */}
          {selectedUserForEdit && (
            <form onSubmit={allocateManualCredits} className="p-4 rounded-xl bg-gradient-to-b from-gray-950 to-black border border-[#00f0ff]/20 space-y-3 block text-xs font-mono">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-extrabold text-[#00f0ff] uppercase text-[10px]">Manual credits Override</span>
                <button type="button" onClick={() => setSelectedUserForEdit(null)} className="text-gray-400 hover:text-white">
                  Cancel
                </button>
              </div>
              
              <div className="space-y-1">
                <span className="text-gray-400">Target User:</span>
                <span className="text-white font-bold ml-1">{selectedUserForEdit.name}</span>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 block uppercase font-bold text-[10px]">Override Character Total</label>
                <input 
                  type="number" 
                  value={adjustedCredits}
                  onChange={(e) => setAdjustedCredits(parseInt(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded px-3 py-1.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 block uppercase font-bold text-[10px]">Map Plan Tier</label>
                <select 
                  value={adjustedPlan}
                  onChange={(e) => setAdjustedPlan(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded px-3 py-1.5 text-white"
                >
                  <option value="Free Plan">Free Plan</option>
                  <option value="1M Characters">1M Characters</option>
                  <option value="3M Characters">3M Characters</option>
                  <option value="5M Characters">5M Characters</option>
                  <option value="11M Characters">11M Characters</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-[#00f0ff] to-[#00ff66] hover:brightness-105 text-black font-extrabold text-xs uppercase tracking-wider rounded cursor-pointer"
              >
                Perform Credits adjustment
              </button>
            </form>
          )}

        </div>

      </div>

      {/* Floating Screenshot expansion receipt viewer Modal */}
      {selectedScreenshotUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="p-6 rounded-2xl bg-black border border-[#00f0ff]/30 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h5 className="font-mono text-xs font-bold text-gray-300">Transaction Screenshot receipt audit</h5>
              <button 
                onClick={() => setSelectedScreenshotUrl(null)}
                className="p-1 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-center bg-white/5 rounded-xl border border-white/5 overflow-hidden max-h-[360px]">
              <img 
                src={selectedScreenshotUrl} 
                alt="Deposited manual payout screenshot receipt reference" 
                className="object-contain max-h-[340px]"
              />
            </div>

            <div className="text-center">
              <button
                onClick={() => setSelectedScreenshotUrl(null)}
                className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono border border-white/10"
              >
                Dismiss Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
