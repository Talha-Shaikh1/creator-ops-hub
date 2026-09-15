"use client";

import { useState, useEffect } from "react";
import { X, Mail, Save, AlertCircle } from "lucide-react";

export interface GmailFormData {
  id?: string;
  email: string;
  subscription: string;
  renewalDate?: string | null;
  browserProfile?: string | null;
  notes?: string | null;
}

interface GmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  accountToEdit?: GmailFormData | null;
}

export function GmailModal({
  isOpen,
  onClose,
  onSaved,
  accountToEdit,
}: GmailModalProps) {
  const [email, setEmail] = useState("");
  const [subscription, setSubscription] = useState("Gemini Pro");
  const [renewalDate, setRenewalDate] = useState("");
  const [browserProfile, setBrowserProfile] = useState("Profile 1");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accountToEdit) {
      setEmail(accountToEdit.email || "");
      setSubscription(accountToEdit.subscription || "Gemini Pro");
      setRenewalDate(
        accountToEdit.renewalDate
          ? new Date(accountToEdit.renewalDate).toISOString().split("T")[0]
          : ""
      );
      setBrowserProfile(accountToEdit.browserProfile || "Profile 1");
      setNotes(accountToEdit.notes || "");
    } else {
      setEmail("");
      setSubscription("Gemini Pro");
      // Default renewal date in 30 days
      const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      setRenewalDate(d.toISOString().split("T")[0]);
      setBrowserProfile("Profile 1");
      setNotes("");
    }
    setError(null);
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      email: email.trim().toLowerCase(),
      subscription: subscription.trim(),
      renewalDate: renewalDate ? new Date(renewalDate).toISOString() : null,
      browserProfile: browserProfile.trim() || null,
      notes: notes.trim() || null,
    };

    try {
      const url = accountToEdit?.id
        ? `/api/gmail/${accountToEdit.id}`
        : "/api/gmail";
      const method = accountToEdit?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save account");
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const subscriptionOptions = [
    "Gemini Pro",
    "ChatGPT Plus",
    "Claude Pro",
    "Midjourney",
    "Canva Pro",
    "Free Tier",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#11131c] border border-[#23283a] shadow-2xl p-6 sm:p-7 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2436]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {accountToEdit ? "Edit Gmail Profile" : "Add Gmail & AI Profile"}
              </h3>
              <p className="text-xs text-neutral-400">
                Manage browser profiles, AI tool subscriptions, and renewals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a1e2d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Gmail Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. talha.work@gmail.com"
              className="w-full px-3.5 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Active AI Subscription
              </label>
              <select
                value={subscription}
                onChange={(e) => setSubscription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {subscriptionOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#11131c]">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Chrome Browser Profile
              </label>
              <input
                type="text"
                value={browserProfile}
                onChange={(e) => setBrowserProfile(e.target.value)}
                placeholder="e.g. Profile 1, Profile 2"
                className="w-full px-3.5 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Renewal / Expiry Date
            </label>
            <input
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Notes & Workflow Details
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Primary account for video prompt generation & YouTube channel dashboard"
              className="w-full px-3.5 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-[#1f2436] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-[#1a1e2d] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Saving..." : "Save Account"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
