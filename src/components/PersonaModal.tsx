"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Save, AlertCircle, Sparkles } from "lucide-react";

interface GmailAccount {
  id: string;
  email: string;
  subscription: string;
  browserProfile?: string | null;
}

export interface PersonaFormData {
  id?: string;
  name: string;
  assignedDay: number | null;
  gmailAccountId?: string | null;
  niche?: string | null;
  language?: string | null;
  targetAudience?: string | null;
  visualStyle?: string | null;
  framePrompt?: string | null;
  masterVideoPrompt?: string | null;
  weeklyReelsTarget?: number;
  weeklyFeedTarget?: number;
  dailyStoriesTarget?: number;
  youtubeHandle?: string | null;
  youtubeUrl?: string | null;
  instaHandle?: string | null;
  instaUrl?: string | null;
  tiktokHandle?: string | null;
  tiktokUrl?: string | null;
  facebookHandle?: string | null;
  facebookUrl?: string | null;
}

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  personaToEdit?: PersonaFormData | null;
  gmailAccounts: GmailAccount[];
}

export function PersonaModal({
  isOpen,
  onClose,
  onSaved,
  personaToEdit,
  gmailAccounts,
}: PersonaModalProps) {
  const [name, setName] = useState("");
  const [assignedDay, setAssignedDay] = useState<string>("0");
  const [gmailAccountId, setGmailAccountId] = useState<string>("");
  const [niche, setNiche] = useState("");
  const [language, setLanguage] = useState("English");
  const [targetAudience, setTargetAudience] = useState("");
  const [visualStyle, setVisualStyle] = useState("");
  const [framePrompt, setFramePrompt] = useState("");
  const [masterVideoPrompt, setMasterVideoPrompt] = useState("");
  const [weeklyReelsTarget, setWeeklyReelsTarget] = useState(3);
  const [weeklyFeedTarget, setWeeklyFeedTarget] = useState(4);
  const [dailyStoriesTarget, setDailyStoriesTarget] = useState(5);

  const [ytHandle, setYtHandle] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [igHandle, setIgHandle] = useState("");
  const [igUrl, setIgUrl] = useState("");
  const [ttHandle, setTtHandle] = useState("");
  const [ttUrl, setTtUrl] = useState("");
  const [fbHandle, setFbHandle] = useState("");
  const [fbUrl, setFbUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (personaToEdit) {
      setName(personaToEdit.name || "");
      setAssignedDay(
        personaToEdit.assignedDay !== null && personaToEdit.assignedDay !== undefined
          ? String(personaToEdit.assignedDay)
          : ""
      );
      setGmailAccountId(personaToEdit.gmailAccountId || "");
      setNiche(personaToEdit.niche || "");
      setLanguage(personaToEdit.language || "English");
      setTargetAudience(personaToEdit.targetAudience || "");
      setVisualStyle(personaToEdit.visualStyle || "");
      setFramePrompt(personaToEdit.framePrompt || "");
      setMasterVideoPrompt(personaToEdit.masterVideoPrompt || "");
      setWeeklyReelsTarget(personaToEdit.weeklyReelsTarget || 3);
      setWeeklyFeedTarget(personaToEdit.weeklyFeedTarget || 4);
      setDailyStoriesTarget(personaToEdit.dailyStoriesTarget || 5);

      setYtHandle(personaToEdit.youtubeHandle || "");
      setYtUrl(personaToEdit.youtubeUrl || "");
      setIgHandle(personaToEdit.instaHandle || "");
      setIgUrl(personaToEdit.instaUrl || "");
      setTtHandle(personaToEdit.tiktokHandle || "");
      setTtUrl(personaToEdit.tiktokUrl || "");
      setFbHandle(personaToEdit.facebookHandle || "");
      setFbUrl(personaToEdit.facebookUrl || "");
    } else {
      setName("");
      setAssignedDay("1");
      setGmailAccountId("");
      setNiche("");
      setLanguage("English");
      setTargetAudience("");
      setVisualStyle("");
      setFramePrompt("");
      setMasterVideoPrompt("");
      setWeeklyReelsTarget(3);
      setWeeklyFeedTarget(4);
      setDailyStoriesTarget(5);

      setYtHandle("");
      setYtUrl("");
      setIgHandle("");
      setIgUrl("");
      setTtHandle("");
      setTtUrl("");
      setFbHandle("");
      setFbUrl("");
    }
    setError(null);
  }, [personaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Persona name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim().toLowerCase(),
      assignedDay: assignedDay !== "" ? parseInt(assignedDay, 10) : null,
      gmailAccountId: gmailAccountId || null,
      niche: niche.trim() || null,
      language: language.trim() || "English",
      targetAudience: targetAudience.trim() || null,
      visualStyle: visualStyle.trim() || null,
      framePrompt: framePrompt.trim() || null,
      masterVideoPrompt: masterVideoPrompt.trim() || null,
      weeklyReelsTarget: Number(weeklyReelsTarget) || 3,
      weeklyFeedTarget: Number(weeklyFeedTarget) || 4,
      dailyStoriesTarget: Number(dailyStoriesTarget) || 5,
      youtubeHandle: ytHandle.trim() || null,
      youtubeUrl: ytUrl.trim() || null,
      instaHandle: igHandle.trim() || null,
      instaUrl: igUrl.trim() || null,
      tiktokHandle: ttHandle.trim() || null,
      tiktokUrl: ttUrl.trim() || null,
      facebookHandle: fbHandle.trim() || null,
      facebookUrl: fbUrl.trim() || null,
    };

    try {
      const url = personaToEdit?.id
        ? `/api/personas/${personaToEdit.id}`
        : "/api/personas";
      const method = personaToEdit?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save persona");
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

  const dayOptions = [
    { val: "1", label: "Monday" },
    { val: "2", label: "Tuesday" },
    { val: "3", label: "Wednesday" },
    { val: "4", label: "Thursday" },
    { val: "5", label: "Friday" },
    { val: "6", label: "Saturday" },
    { val: "0", label: "Sunday" },
    { val: "", label: "Unassigned / Standby" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#11131c] border border-[#23283a] shadow-2xl p-6 sm:p-7 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2436]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {personaToEdit ? "Edit AI Influencer Persona" : "Add New AI Persona / Creator"}
              </h3>
              <p className="text-xs text-neutral-400">
                Configure brand rotation, niche language, AI prompt templates, and social channels
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
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Persona Name / Handle <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. aayla.khan.pak, objitoon"
                className="w-full px-3.5 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Assigned Rotation Day
              </label>
              <select
                value={assignedDay}
                onChange={(e) => setAssignedDay(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {dayOptions.map((opt) => (
                  <option key={opt.val} value={opt.val} className="bg-[#11131c]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Niche & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Primary Language / Dialect
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="English" className="bg-[#11131c]">English (UK / Global)</option>
                <option value="Roman Urdu / Hinglish" className="bg-[#11131c]">Roman Urdu / Hinglish (Pakistan / India)</option>
                <option value="Urdu" className="bg-[#11131c]">Urdu Script</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Linked Gmail Profile
              </label>
              <select
                value={gmailAccountId}
                onChange={(e) => setGmailAccountId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="" className="bg-[#11131c]">-- None / Standalone --</option>
                {gmailAccounts.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#11131c]">
                    {g.email} ({g.subscription}) {g.browserProfile ? `[${g.browserProfile}]` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Content Niche &amp; Focus Area
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. relationships + mindset, UK/Europe audience"
              className="w-full px-3.5 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Target Audience Demographic
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. UK/Europe 18-35 females, high-earners, students"
              className="w-full px-3.5 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Visual Style &amp; Lighting Aesthetic
            </label>
            <input
              type="text"
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              placeholder="e.g. Warm cinematic lighting, soft brown tones, minimal aesthetic"
              className="w-full px-3.5 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* AI Prompts */}
          <div className="pt-2 border-t border-[#1f2436] space-y-3">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Saved AI Generation Prompt Templates
            </span>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                Saved Frame Image Generation Prompt
              </label>
              <textarea
                rows={2}
                value={framePrompt}
                onChange={(e) => setFramePrompt(e.target.value)}
                placeholder="e.g. Photorealistic 8k vertical portrait of Aayla Khan in modern silk outfit, 85mm lens --ar 9:16"
                className="w-full px-3 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                Master Video Generation Prompt
              </label>
              <textarea
                rows={2}
                value={masterVideoPrompt}
                onChange={(e) => setMasterVideoPrompt(e.target.value)}
                placeholder="e.g. Cinematic vertical video, subtle speaking movement, micro-expressions, 4k ultra-realistic"
                className="w-full px-3 py-2 rounded-lg bg-[#161926] border border-[#252c3f] text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Targets */}
          <div className="pt-2 border-t border-[#1f2436]">
            <span className="text-xs font-semibold text-neutral-400 block mb-2">
              Weekly &amp; Daily Content Targets:
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Weekly Reels Target</label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={weeklyReelsTarget}
                  onChange={(e) => setWeeklyReelsTarget(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#161926] border border-[#252c3f] text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Weekly Feed Posts</label>
                <input
                  type="number"
                  min={1}
                  max={21}
                  value={weeklyFeedTarget}
                  onChange={(e) => setWeeklyFeedTarget(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#161926] border border-[#252c3f] text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Daily Stories Target</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={dailyStoriesTarget}
                  onChange={(e) => setDailyStoriesTarget(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#161926] border border-[#252c3f] text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Social Channels */}
          <div className="pt-2 border-t border-[#1f2436]">
            <span className="text-xs font-semibold text-neutral-400 block mb-2">
              4 Sub-Channel Handles &amp; URLs:
            </span>

            <div className="space-y-2.5">
              {/* YouTube */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={ytHandle}
                  onChange={(e) => setYtHandle(e.target.value)}
                  placeholder="YouTube Handle (e.g. @Objitoon)"
                  className="w-full px-3 py-1.5 rounded-md bg-[#161926] border border-[#252c3f] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/60"
                />
                <input
                  type="url"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  placeholder="YouTube URL (https://youtube.com/...)"
                  className="w-full px-3 py-1.5 rounded-md bg-[#161926] border border-[#252c3f] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/60"
                />
              </div>

              {/* Instagram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={igHandle}
                  onChange={(e) => setIgHandle(e.target.value)}
                  placeholder="Instagram Handle (e.g. @aayla.khan.uk)"
                  className="w-full px-3 py-1.5 rounded-md bg-[#161926] border border-[#252c3f] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500/60"
                />
                <input
                  type="url"
                  value={igUrl}
                  onChange={(e) => setIgUrl(e.target.value)}
                  placeholder="Instagram URL (https://instagram.com/...)"
                  className="w-full px-3 py-1.5 rounded-md bg-[#161926] border border-[#252c3f] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500/60"
                />
              </div>

              {/* TikTok */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={ttHandle}
                  onChange={(e) => setTtHandle(e.target.value)}
                  placeholder="TikTok Handle (e.g. @aayla.khan.uk)"
                  className="w-full px-3 py-1.5 rounded-md bg-[#161926] border border-[#252c3f] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/60"
                />
                <input
                  type="url"
                  value={ttUrl}
                  onChange={(e) => setTtUrl(e.target.value)}
                  placeholder="TikTok URL (https://tiktok.com/@...)"
                  className="w-full px-3 py-1.5 rounded-md bg-[#161926] border border-[#252c3f] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              {/* Facebook */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={fbHandle}
                  onChange={(e) => setFbHandle(e.target.value)}
                  placeholder="Facebook Page (e.g. Aayla Khan Official)"
                  className="w-full px-3 py-1.5 rounded-md bg-[#161926] border border-[#252c3f] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500/60"
                />
                <input
                  type="url"
                  value={fbUrl}
                  onChange={(e) => setFbUrl(e.target.value)}
                  placeholder="Facebook URL (https://facebook.com/...)"
                  className="w-full px-3 py-1.5 rounded-md bg-[#161926] border border-[#252c3f] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500/60"
                />
              </div>
            </div>
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Saving..." : "Save Persona"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
