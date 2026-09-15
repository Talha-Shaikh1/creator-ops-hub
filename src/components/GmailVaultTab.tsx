"use client";

import { useState } from "react";
import {
  Bot,
  Search,
  Plus,
  Edit2,
  Trash2,
  Laptop,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { GmailModal, GmailFormData } from "./GmailModal";

interface Persona {
  id: string;
  name: string;
}

interface GmailAccount {
  id: string;
  email: string;
  subscription: string;
  renewalDate?: Date | string | null;
  browserProfile?: string | null;
  notes?: string | null;
  personas: Persona[];
}

interface GmailVaultTabProps {
  gmailAccounts: GmailAccount[];
  onRefresh: () => void;
}

export function GmailVaultTab({
  gmailAccounts,
  onRefresh,
}: GmailVaultTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<GmailFormData | null>(
    null
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (acc: GmailAccount) => {
    setEditingAccount({
      id: acc.id,
      email: acc.email,
      subscription: acc.subscription,
      renewalDate: acc.renewalDate
        ? new Date(acc.renewalDate).toISOString().split("T")[0]
        : null,
      browserProfile: acc.browserProfile,
      notes: acc.notes,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/gmail/${id}`, { method: "DELETE" });
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete gmail account", err);
    }
  };

  // Helper to calculate days remaining
  const getRenewalStatus = (renewalDate?: Date | string | null) => {
    if (!renewalDate) return null;
    const now = new Date().getTime();
    const renewal = new Date(renewalDate).getTime();
    const diffDays = Math.ceil((renewal - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Expired ${Math.abs(diffDays)}d ago`,
        type: "expired",
        badgeClass: "bg-red-500/20 text-red-300 border-red-500/40",
      };
    } else if (diffDays <= 7) {
      return {
        label: `Renews in ${diffDays}d (Urgent)`,
        type: "urgent",
        badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      };
    } else {
      return {
        label: `Renews in ${diffDays} days`,
        type: "active",
        badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      };
    }
  };

  // Filter accounts
  const filteredAccounts = gmailAccounts.filter((acc) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      acc.email.toLowerCase().includes(q) ||
      acc.subscription.toLowerCase().includes(q) ||
      acc.browserProfile?.toLowerCase().includes(q) ||
      acc.notes?.toLowerCase().includes(q) ||
      acc.personas.some((p) => p.name.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterType === "gemini") {
      return acc.subscription.toLowerCase().includes("gemini");
    }
    if (filterType === "chatgpt") {
      return acc.subscription.toLowerCase().includes("chatgpt");
    }
    if (filterType === "urgent") {
      const status = getRenewalStatus(acc.renewalDate);
      return status?.type === "urgent" || status?.type === "expired";
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            <span>Gmail & AI Tool Subscription Vault</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage Gmail profiles, browser profiles, Gemini Pro / ChatGPT accounts, and renewal alerts
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Gmail Account</span>
        </button>
      </div>

      {/* Search & Quick Filter Bar */}
      <div className="rounded-2xl border border-[#1e2333] bg-[#10121a] p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search by 'Gemini Pro', 'Profile 2', email, or persona..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141724] border border-[#242b3d] text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Accounts" },
              { id: "gemini", label: "Gemini Pro" },
              { id: "chatgpt", label: "ChatGPT Plus" },
              { id: "urgent", label: "Expiring / Urgent" },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setFilterType(chip.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  filterType === chip.id
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "bg-[#161926] text-neutral-400 hover:text-white border border-[#22273b]"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Gmail Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          const renewalStatus = getRenewalStatus(acc.renewalDate);
          const isGemini = acc.subscription.toLowerCase().includes("gemini");
          const isChatGPT = acc.subscription.toLowerCase().includes("chatgpt");

          return (
            <div
              key={acc.id}
              className="rounded-xl border border-[#1e2333] bg-[#11131c] hover:border-[#2a3147] p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs text-neutral-400 font-mono block">
                      {acc.email}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                          isGemini
                            ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30"
                            : isChatGPT
                            ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-300 border-neutral-700"
                        }`}
                      >
                        {acc.subscription}
                      </span>

                      {acc.browserProfile && (
                        <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#171b29] border border-[#273046] text-neutral-300">
                          <Laptop className="w-3 h-3 text-neutral-400" />
                          {acc.browserProfile}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(acc)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a1e2d] transition-colors cursor-pointer"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirmId === acc.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 border border-red-500 text-red-300 hover:bg-red-500/30 cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 rounded text-[10px] text-neutral-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(acc.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-[#1a1e2d] transition-colors cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Renewal Date Badge */}
                {renewalStatus ? (
                  <div className="flex items-center gap-1.5 my-2.5">
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 ${renewalStatus.badgeClass}`}
                    >
                      {renewalStatus.type === "urgent" ? (
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{renewalStatus.label}</span>
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-neutral-500 block my-2">
                    No renewal date specified
                  </span>
                )}

                {/* Notes */}
                {acc.notes && (
                  <p className="text-xs text-neutral-400 mt-2 bg-[#161926] p-2.5 rounded-lg border border-[#22273a] line-clamp-2">
                    {acc.notes}
                  </p>
                )}
              </div>

              {/* Linked Personas */}
              <div className="mt-4 pt-3 border-t border-[#1d2232]">
                <span className="text-[11px] text-neutral-500 block mb-1.5 font-medium">
                  Linked Creator Personas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {acc.personas && acc.personas.length > 0 ? (
                    acc.personas.map((p) => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded bg-[#171b29] border border-[#273046] text-xs font-semibold text-neutral-300"
                      >
                        @{p.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-neutral-600 italic">
                      None assigned
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <GmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={onRefresh}
        accountToEdit={editingAccount}
      />
    </div>
  );
}
