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
  AudioLines,
  Terminal,
  Table,
  Play
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

  // SQL Console states
  const [activeSqlTab, setActiveSqlTab] = useState<"schema" | "console">("console");
  const [selectedSqlTable, setSelectedSqlTable] = useState<"users" | "history" | "payments" | "cloned_voices">("users");
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM users;");
  const [sqlResult, setSqlResult] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState<boolean>(false);
  const [fullHistoryLogs, setFullHistoryLogs] = useState<any[]>([]);
  const [allClonedVoices, setAllClonedVoices] = useState<any[]>([]);

  // Data prefetcher
  const syncAdministrativeState = async () => {
    setLoading(true);
    try {
      const uList = await FirebaseIntegration.getAllUsers();
      const pList = await FirebaseIntegration.getPaymentRequests();
      setUsersList(uList);
      setPaymentsList(pList);

      // Fetch history and cloned voices for the SQL Console
      const hList = await FirebaseIntegration.getAllHistory();
      setFullHistoryLogs(hList);

      const voicesPromises = uList.map(async (u) => {
        try {
          const v = await FirebaseIntegration.getUserClonedVoices(u.uid);
          return v.map((item: any) => ({ ...item, userEmail: u.email, userName: u.name }));
        } catch {
          return [];
        }
      });
      const resolvedVoices = await Promise.all(voicesPromises);
      setAllClonedVoices(resolvedVoices.flat());
    } catch (err) {
      console.error("Failed to prefetch admin details:", err);
    } finally {
      setLoading(false);
    }
  };

  const executeSqlQuery = () => {
    setIsExecutingSql(true);
    setSqlError(null);
    setSqlResult(null);
    
    setTimeout(() => {
      try {
        const cleanQuery = sqlQuery.trim().replace(/;$/, "").replace(/\s+/g, " ");
        const selectMatch = cleanQuery.match(/^SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*?))?(?:\s+ORDER\s+BY\s+(.*?))?$/i);
        
        if (!selectMatch) {
          throw new Error("Syntax Error: Only SELECT queries are permitted in this Read-Only SQL Console. E.g., 'SELECT * FROM users;'");
        }
        
        const [, columnsStr, tableName, whereStr, orderByStr] = selectMatch;
        const normalizedTableName = tableName.toLowerCase();
        
        // Match table
        let sourceData: any[] = [];
        if (normalizedTableName === "users") {
          sourceData = usersList;
        } else if (normalizedTableName === "history") {
          sourceData = fullHistoryLogs;
        } else if (normalizedTableName === "payments" || normalizedTableName === "payment_requests") {
          sourceData = paymentsList;
        } else if (normalizedTableName === "cloned_voices" || normalizedTableName === "voices") {
          sourceData = allClonedVoices;
        } else {
          throw new Error(`Table '${tableName}' does not exist. Available tables: users, history, payments, cloned_voices`);
        }
        
        // Filter rows (where clause)
        let filteredRows = [...sourceData];
        if (whereStr) {
          const whereParts = whereStr.split(/\s+AND\s+/i);
          whereParts.forEach(part => {
            const eqMatch = part.match(/(\w+)\s*=\s*'([^']*)'/i);
            const numMatch = part.match(/(\w+)\s*=\s*(\d+)/i);
            const likeMatch = part.match(/(\w+)\s+LIKE\s+'%([^%]*)%'/i);
            
            if (eqMatch) {
              const [, field, val] = eqMatch;
              filteredRows = filteredRows.filter(row => String(row[field] || "").toLowerCase() === val.toLowerCase());
            } else if (numMatch) {
              const [, field, val] = numMatch;
              filteredRows = filteredRows.filter(row => Number(row[field]) === Number(val));
            } else if (likeMatch) {
              const [, field, val] = likeMatch;
              filteredRows = filteredRows.filter(row => String(row[field] || "").toLowerCase().includes(val.toLowerCase()));
            } else {
              throw new Error(`Unsupported SQL Filter syntax in WHERE clause: '${part}'. Supported: field = 'val', field = 123, field LIKE '%val%'`);
            }
          });
        }
        
        // Sort rows (order by clause)
        if (orderByStr) {
          const orderMatch = orderByStr.match(/(\w+)(?:\s+(ASC|DESC))?/i);
          if (orderMatch) {
            const [, field, direction] = orderMatch;
            const isDesc = direction && direction.toUpperCase() === "DESC";
            filteredRows.sort((a, b) => {
              const valA = a[field];
              const valB = b[field];
              if (typeof valA === "number" && typeof valB === "number") {
                return isDesc ? valB - valA : valA - valB;
              }
              const strA = String(valA || "").toLowerCase();
              const strB = String(valB || "").toLowerCase();
              return isDesc 
                ? (strA < strB ? 1 : strA > strB ? -1 : 0)
                : (strA > strB ? 1 : strA < strB ? -1 : 0);
            });
          }
        }
        
        // Group query check (e.g. SUM aggregation)
        const isAggregate = columnsStr.toUpperCase().includes("SUM(") || columnsStr.toUpperCase().includes("COUNT(");
        
        if (isAggregate) {
          if (normalizedTableName === "history") {
            const sumCredits = filteredRows.reduce((sum, h) => sum + (h.creditsUsed || 0), 0);
            setSqlResult({
              columns: ["total_records", "total_characters_used"],
              rows: [{ total_records: filteredRows.length, total_characters_used: sumCredits }]
            });
            return;
          } else {
            throw new Error("Aggregation logic is supported for the 'history' table (e.g., SELECT SUM(creditsUsed) FROM history).");
          }
        }
        
        // Select specific columns
        let finalColumns: string[] = [];
        if (columnsStr === "*") {
          if (normalizedTableName === "users") {
            finalColumns = ["uid", "name", "email", "credits", "plan", "role", "createdAt", "status"];
          } else if (normalizedTableName === "history") {
            finalColumns = ["id", "userId", "tool", "request", "response", "creditsUsed", "createdAt"];
          } else if (normalizedTableName === "payments") {
            finalColumns = ["id", "userId", "userEmail", "userName", "amount", "status", "createdAt"];
          } else if (normalizedTableName === "cloned_voices") {
            finalColumns = ["id", "userId", "name", "description", "gender", "archetype", "pitch", "speed", "createdAt"];
          }
        } else {
          finalColumns = columnsStr.split(",").map(c => c.trim());
        }
        
        const finalRows = filteredRows.map(row => {
          const selectedRow: any = {};
          finalColumns.forEach(col => {
            selectedRow[col] = row[col];
          });
          return selectedRow;
        });
        
        setSqlResult({
          columns: finalColumns,
          rows: finalRows
        });
      } catch (err: any) {
        setSqlError(err.message || "An error occurred executing the query.");
      } finally {
        setIsExecutingSql(false);
      }
    }, 400);
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

  // Grant instant premium access to a user (shortcut)
  const grantInstantPremiumAccess = async (user: UserProfile) => {
    const confirmation = window.confirm(`Are you sure you want to manually grant premium subscription access (11M Characters plan) to ${user.name} immediately?`);
    if (!confirmation) return;
    try {
      await FirebaseIntegration.manuallyAdjustUserCredits(user.uid, 11000000, "11M Characters");
      alert(`Access Override Success! ${user.name} has been upgraded to the Premium 11M Characters plan regardless of their payment trace.`);
      await syncAdministrativeState();
      onRefreshUser();
    } catch (err) {
      console.error(err);
      alert("Error: Failed to register manual grant override in the database.");
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
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h5 className="font-bold text-white leading-tight">{user.name}</h5>
                    
                    {/* Real-time Status Badge */}
                    <div className="flex items-center gap-1 bg-white/[0.03] border border-white/5 px-1.5 py-0.5 rounded">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.status === "online" 
                          ? "bg-[#00ff66] animate-pulse shadow-[0_0_6px_#00ff66]" 
                          : "bg-gray-500"
                      }`}></span>
                      <span className={`text-[8px] uppercase tracking-wider font-mono font-bold ${
                        user.status === "online" ? "text-[#00ff66]" : "text-gray-400"
                      }`}>
                        {user.status === "online" ? "Online" : "Offline"}
                      </span>
                    </div>

                    {/* New User Check & Badge */}
                    {(() => {
                      if (!user.createdAt) return null;
                      const diffDays = Math.abs(new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                      if (diffDays <= 2.5) {
                        return (
                          <span className="bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20 text-[8px] px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                            New User
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  
                  <span className="text-[10px] text-gray-400 block truncate max-w-[200px] font-mono">{user.email}</span>
                  
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono text-gray-500">
                    <span>Credits: <b className="text-[#00f0ff]">{user.role === "admin" ? "∞" : user.credits.toLocaleString()} Ch</b></span>
                    <span>•</span>
                    <span>Role: <b className="capitalize text-white">{user.role}</b></span>
                    {user.plan && (
                      <>
                        <span>•</span>
                        <span>Plan: <b className="text-gray-300">{user.plan}</b></span>
                      </>
                    )}
                    <span>•</span>
                    <span>Joined: <b className="text-gray-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Legacy"}</b></span>
                  </div>

                  {user.offeredPlans && user.offeredPlans.length > 0 && (
                    <div className="text-[9px] font-mono text-amber-400 bg-amber-950/20 border border-amber-500/10 px-1.5 py-0.5 rounded inline-block">
                      Promotional Offers: <b className="text-amber-300">{user.offeredPlans.join(", ")}</b>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 shrink-0 items-end">
                  {/* Offer Plan drop selector */}
                  {user.role !== "admin" && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] uppercase tracking-wide text-gray-500 font-mono text-right">Offer Plan</span>
                      <select
                        onChange={async (e) => {
                          const planName = e.target.value;
                          if (!planName) return;
                          try {
                            await FirebaseIntegration.offerPlanToUser(user.uid, planName);
                            alert(`Promotional offer for "${planName}" successfully pitched to ${user.name}!`);
                            await syncAdministrativeState();
                          } catch (err) {
                            console.error(err);
                            alert("Failed to register plan offer.");
                          }
                          e.target.value = "";
                        }}
                        className="bg-black border border-white/10 hover:border-[#00f0ff]/40 rounded px-1.5 py-0.5 text-[9px] font-mono text-gray-300 focus:outline-none"
                      >
                        <option value="">Select Tier...</option>
                        <option value="1M Characters">1M Characters</option>
                        <option value="3M Characters">3M Characters</option>
                        <option value="5M Characters">5M Characters</option>
                        <option value="11M Characters">11M Characters</option>
                      </select>
                    </div>
                  )}

                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => {
                        setSelectedUserForEdit(user);
                        setAdjustedCredits(user.credits);
                        setAdjustedPlan(user.plan);
                      }}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white hover:text-[#00f0ff] border border-white/10 text-[9px] font-mono transition-colors cursor-pointer"
                    >
                      Adjust
                    </button>

                    {user.role !== "admin" && (
                      <button 
                        onClick={() => grantInstantPremiumAccess(user)}
                        className="px-2 py-0.5 rounded bg-emerald-500/5 hover:bg-emerald-500 text-[#00ff66] hover:text-black hover:shadow-[0_0_8px_rgba(0,255,102,0.2)] text-[9px] font-sans font-bold transition-all cursor-pointer"
                      >
                        Premium
                      </button>
                    )}
                  </div>
                </div>
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

      {/* Relational SQL Database Console */}
      <div className="p-6 rounded-2xl bg-[#090a0f] border border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-gray-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00f0ff]" /> Relational SQL Console & Schema Registry
            </h3>
            <p className="text-[10px] text-gray-500 font-sans">
              Connected to Cloud SQL / Firestore database. Run standard SELECT queries to audit users, history logs, payments, and custom cloned voice records.
            </p>
          </div>
          
          <div className="flex rounded-lg bg-black p-1 font-mono text-[10px] border border-white/5 self-start">
            <button
              onClick={() => {
                setActiveSqlTab("console");
                setSqlQuery("SELECT * FROM users;");
                setSqlResult(null);
                setSqlError(null);
              }}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeSqlTab === "console" 
                  ? "bg-gradient-to-r from-[#00f0ff]/15 to-[#00ff66]/15 text-white border border-[#00f0ff]/20 font-bold" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              SQL Query Console
            </button>
            <button
              onClick={() => setActiveSqlTab("schema")}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                activeSqlTab === "schema" 
                  ? "bg-gradient-to-r from-[#00f0ff]/15 to-[#00ff66]/15 text-white border border-[#00f0ff]/20 font-bold" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Schema Registry
            </button>
          </div>
        </div>

        {activeSqlTab === "schema" ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Table list */}
            <div className="md:col-span-4 space-y-2">
              <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-gray-500 block">Available Tables</span>
              <div className="flex flex-col gap-1">
                {(["users", "history", "payments", "cloned_voices"] as const).map((tbl) => (
                  <button
                    key={tbl}
                    onClick={() => setSelectedSqlTable(tbl)}
                    className={`p-3 rounded-xl border text-left font-mono text-xs transition-all cursor-pointer ${
                      selectedSqlTable === tbl 
                        ? "bg-white/5 border-[#00f0ff]/30 text-white font-bold" 
                        : "bg-black/40 border-white/5 text-gray-400 hover:bg-white/[0.02] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table className="w-3.5 h-3.5 text-[#00f0ff]" />
                      <span>{tbl}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Schema detail */}
            <div className="md:col-span-8 p-4 bg-black/60 border border-white/5 rounded-xl space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs text-white border-b border-white/5 pb-2">
                <span className="text-gray-500">TABLE:</span>
                <span className="text-[#00ff66] font-bold">{selectedSqlTable}</span>
                <span className="text-[9px] text-gray-500 ml-auto uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  Firestore Relational Mirror
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px] font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="pb-2 font-bold">Column Name</th>
                      <th className="pb-2 font-bold">SQL Type</th>
                      <th className="pb-2 font-bold">Constraint</th>
                      <th className="pb-2 font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {selectedSqlTable === "users" && (
                      <>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">uid</td>
                          <td className="py-2 text-indigo-400 font-bold">VARCHAR(128)</td>
                          <td className="py-2 text-amber-500 font-bold">PRIMARY KEY</td>
                          <td className="py-2 text-gray-400">Unique identifier matching Firebase Auth uid.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">name</td>
                          <td className="py-2 text-indigo-400 font-bold">VARCHAR(255)</td>
                          <td className="py-2">NOT NULL</td>
                          <td className="py-2 text-gray-400 font-bold">Full name of the user.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">email</td>
                          <td className="py-2 text-indigo-400">VARCHAR(255)</td>
                          <td className="py-2">UNIQUE, NOT NULL</td>
                          <td className="py-2 text-gray-400">Email address of the user (all lowercase).</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">credits</td>
                          <td className="py-2 text-indigo-400">INTEGER</td>
                          <td className="py-2">DEFAULT 50000</td>
                          <td className="py-2 text-gray-400">Character credit balance for voice synthesis.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">plan</td>
                          <td className="py-2 text-indigo-400">VARCHAR(64)</td>
                          <td className="py-2">DEFAULT 'Free Plan'</td>
                          <td className="py-2 text-gray-400">Current subscription tier name.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">role</td>
                          <td className="py-2 text-indigo-400 font-bold">VARCHAR(32)</td>
                          <td className="py-2">DEFAULT 'user'</td>
                          <td className="py-2 text-gray-400">Access authority level ('user' | 'admin').</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">createdAt</td>
                          <td className="py-2 text-indigo-400 font-bold">TIMESTAMP</td>
                          <td className="py-2">DEFAULT CURRENT_TIMESTAMP</td>
                          <td className="py-2 text-gray-400 font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#00ff66]">The UTC registration date and time.</td>
                        </tr>
                      </>
                    )}
                    {selectedSqlTable === "history" && (
                      <>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">id</td>
                          <td className="py-2 text-indigo-400">VARCHAR(128)</td>
                          <td className="py-2 text-amber-500 font-bold">PRIMARY KEY</td>
                          <td className="py-2 text-gray-400">Unique log record key.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">userId</td>
                          <td className="py-2 text-indigo-400">VARCHAR(128)</td>
                          <td className="py-2 text-blue-400 font-bold">FOREIGN KEY (users.uid)</td>
                          <td className="py-2 text-gray-400 font-bold text-indigo-400">Reference of user who executed the voice tool.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">tool</td>
                          <td className="py-2 text-indigo-400">VARCHAR(128)</td>
                          <td className="py-2">NOT NULL</td>
                          <td className="py-2 text-gray-400 font-bold text-indigo-400">The specific AI voice module used.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">request</td>
                          <td className="py-2 text-indigo-400">TEXT</td>
                          <td className="py-2">NOT NULL</td>
                          <td className="py-2 text-gray-400">The input query prompt or characters submitted.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">response</td>
                          <td className="py-2 text-indigo-400 font-bold">TEXT</td>
                          <td className="py-2">NOT NULL</td>
                          <td className="py-2 text-gray-400">The resulting transcript summary or vocal report metadata.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">creditsUsed</td>
                          <td className="py-2 text-indigo-400 font-bold text-[#00f0ff]">INTEGER</td>
                          <td className="py-2">NOT NULL</td>
                          <td className="py-2 text-gray-400 font-bold text-[#00ff66]">How many character credits were deducted/used for this query.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">createdAt</td>
                          <td className="py-2 text-indigo-400 font-bold text-indigo-400">TIMESTAMP</td>
                          <td className="py-2">DEFAULT CURRENT_TIMESTAMP</td>
                          <td className="py-2 text-gray-400">Acoustic request timestamp.</td>
                        </tr>
                      </>
                    )}
                    {selectedSqlTable === "payments" && (
                      <>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">id</td>
                          <td className="py-2 text-indigo-400">VARCHAR(128)</td>
                          <td className="py-2 text-amber-500 font-bold font-bold">PRIMARY KEY</td>
                          <td className="py-2 text-gray-400">Unique transaction ticket key.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">userId</td>
                          <td className="py-2 text-indigo-400">VARCHAR(128)</td>
                          <td className="py-2 text-blue-400 font-bold">FOREIGN KEY (users.uid)</td>
                          <td className="py-2 text-gray-400">Submitter reference.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">userName</td>
                          <td className="py-2 text-indigo-400 font-bold">VARCHAR(255)</td>
                          <td className="py-2">NOT NULL</td>
                          <td className="py-2 text-gray-400">The sender display name.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">userEmail</td>
                          <td className="py-2 text-indigo-400">VARCHAR(255)</td>
                          <td className="py-2">NOT NULL</td>
                          <td className="py-2 text-gray-400 font-mono text-gray-500">The sender email address.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">amount</td>
                          <td className="py-2 text-indigo-400 font-bold">NUMERIC(10, 2)</td>
                          <td className="py-2">NOT NULL</td>
                          <td className="py-2 text-gray-400">The deposited amount (in PKR).</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">status</td>
                          <td className="py-2 text-indigo-400">VARCHAR(32)</td>
                          <td className="py-2">DEFAULT 'pending'</td>
                          <td className="py-2 text-gray-400">Manual verification state ('pending' | 'approved' | 'rejected').</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">createdAt</td>
                          <td className="py-2 text-indigo-400">TIMESTAMP</td>
                          <td className="py-2">DEFAULT CURRENT_TIMESTAMP</td>
                          <td className="py-2 text-gray-400">Payment receipt submit timestamp.</td>
                        </tr>
                      </>
                    )}
                    {selectedSqlTable === "cloned_voices" && (
                      <>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">id</td>
                          <td className="py-2 text-indigo-400">VARCHAR(128)</td>
                          <td className="py-2 text-amber-500 font-bold">PRIMARY KEY</td>
                          <td className="py-2 text-gray-400">Unique vocal blueprint ID.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">userId</td>
                          <td className="py-2 text-indigo-400">VARCHAR(128)</td>
                          <td className="py-2 text-blue-400 font-bold">FOREIGN KEY (users.uid)</td>
                          <td className="py-2 text-gray-400">The voice clone owner's user key.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">name</td>
                          <td className="py-2 text-indigo-400">VARCHAR(255)</td>
                          <td className="py-2">NOT NULL</td>
                          <td className="py-2 text-gray-400">The custom clone display label.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">description</td>
                          <td className="py-2 text-indigo-400 font-bold">TEXT</td>
                          <td className="py-2">NOT NULL</td>
                          <td className="py-2 text-gray-400">The vocal archetype context.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">gender</td>
                          <td className="py-2 text-indigo-400">VARCHAR(32)</td>
                          <td className="py-2">NOT NULL</td>
                          <td className="py-2 text-gray-400">Gender classification ('Male' | 'Female' | 'Neutral').</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">pitch</td>
                          <td className="py-2 text-indigo-400">FLOAT</td>
                          <td className="py-2">DEFAULT 1.0</td>
                          <td className="py-2 text-gray-400 font-bold">Pitch adjustment factor.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">speed</td>
                          <td className="py-2 text-indigo-400 font-bold">FLOAT</td>
                          <td className="py-2">DEFAULT 1.0</td>
                          <td className="py-2 text-gray-400">Speed multiplier level.</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#00f0ff]">createdAt</td>
                          <td className="py-2 text-indigo-400">TIMESTAMP</td>
                          <td className="py-2">DEFAULT CURRENT_TIMESTAMP</td>
                          <td className="py-2 text-gray-400">The registration date of the clone template.</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Presets and Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-2">
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-gray-500 block">SQL Command Prompt</span>
                <div className="relative">
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="SELECT * FROM users;"
                    className="w-full h-28 bg-black border border-white/10 rounded-xl p-4 font-mono text-xs text-white focus:border-[#00f0ff]/40 focus:outline-none"
                  />
                  <button
                    onClick={executeSqlQuery}
                    disabled={isExecutingSql || !sqlQuery}
                    className="absolute right-3 bottom-3 px-3 py-1.5 rounded bg-[#00ff66]/10 border border-[#00ff66]/30 hover:bg-[#00ff66] hover:text-black text-xs font-mono font-bold text-[#00ff66] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {isExecutingSql ? "Running..." : "Run Query"}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-2">
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-gray-500 block">Quick Queries Presets</span>
                <div className="grid grid-cols-1 gap-1.5 font-mono">
                  {[
                    { label: "Fetch all users", query: "SELECT * FROM users;" },
                    { label: "Fetch history logs", query: "SELECT * FROM history ORDER BY createdAt DESC;" },
                    { label: "Fetch pending payments", query: "SELECT * FROM payments WHERE status = 'pending';" },
                    { label: "Total Characters Used summary", query: "SELECT SUM(creditsUsed) FROM history;" },
                    { label: "Fetch active cloned voices", query: "SELECT * FROM cloned_voices;" }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSqlQuery(preset.query);
                        setSqlError(null);
                        setSqlResult(null);
                      }}
                      className="p-2 rounded bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-white/10 text-left text-[10px] font-mono text-gray-400 hover:text-[#00f0ff] truncate transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error state */}
            {sqlError && (
              <div className="p-3 bg-red-950/20 border border-red-500/10 text-red-400 rounded-xl font-mono text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{sqlError}</span>
              </div>
            )}

            {/* Query result placeholder */}
            {!sqlResult && !sqlError && !isExecutingSql && (
              <div className="p-12 text-center bg-black/40 border border-white/5 rounded-xl flex flex-col items-center justify-center text-gray-500">
                <Terminal className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-xs font-mono text-gray-400">Terminal Idle.</p>
                <p className="text-[10px] text-gray-500">Choose a query preset or write custom SELECT SQL above and run execution.</p>
              </div>
            )}

            {/* Loading state */}
            {isExecutingSql && (
              <div className="p-12 text-center bg-black/40 border border-white/5 rounded-xl flex flex-col items-center justify-center text-[#00f0ff] font-mono text-xs gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Running transaction audit on Cloud SQL indexes...</span>
              </div>
            )}

            {/* Result table data */}
            {sqlResult && (
              <div className="space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    Query completed successfully: <b className="text-[#00ff66]">{sqlResult.rows.length}</b> rows returned.
                  </span>
                  <button
                    onClick={() => {
                      setSqlResult(null);
                      setSqlQuery("");
                    }}
                    className="text-[9px] text-gray-500 hover:text-white cursor-pointer"
                  >
                    Clear Results
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/5 bg-black custom-scrollbar">
                  <table className="w-full text-left border-collapse text-[10px] font-mono">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/10 text-gray-400 uppercase text-[9px] tracking-wider">
                        {sqlResult.columns.map((col) => (
                          <th key={col} className="p-3 font-extrabold">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                      {sqlResult.rows.length === 0 ? (
                        <tr>
                          <td colSpan={sqlResult.columns.length} className="p-8 text-center text-gray-500 italic">
                            Empty result set (0 rows returned).
                          </td>
                        </tr>
                      ) : (
                        sqlResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                            {sqlResult.columns.map((col) => {
                              const value = row[col];
                              let formattedValue = String(value ?? "NULL");
                              
                              const isCredits = col === "creditsUsed" || col === "credits" || col === "total_characters_used";
                              const isAmount = col === "amount";
                              const isEmail = col === "email" || col === "userEmail";
                              
                              return (
                                <td key={col} className="p-3 font-mono">
                                  {isCredits ? (
                                    <span className="text-[#00f0ff] font-extrabold font-mono">
                                      {typeof value === "number" ? value.toLocaleString() : value} Chars
                                    </span>
                                  ) : isAmount ? (
                                    <span className="text-amber-400 font-extrabold">
                                      PKR {typeof value === "number" ? value.toLocaleString() : value}
                                    </span>
                                  ) : isEmail ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-white">{formattedValue}</span>
                                      {(() => {
                                        const dateVal = row.createdAt || row.lastActiveAt;
                                        if (dateVal) {
                                          const diffDays = Math.abs(new Date().getTime() - new Date(dateVal).getTime()) / (1000 * 60 * 60 * 24);
                                          if (diffDays <= 2.5) {
                                            return (
                                              <span className="bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20 text-[7px] px-1 rounded uppercase font-bold">
                                                New
                                              </span>
                                            );
                                          }
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  ) : (
                                    <span className="truncate max-w-xs block font-mono" title={formattedValue}>
                                      {formattedValue}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
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
