"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Save,
  Clock,
  Send,
  CheckCheck,
  FileText,
  Link2,
  Bot,
  Laptop,
} from "lucide-react";
import {
  YouTubeIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
} from "./SocialIcons";

interface Persona {
  id: string;
  name: string;
  assignedDay: number | null;
  youtubeHandle?: string | null;
  youtubeUrl?: string | null;
  instaHandle?: string | null;
  instaUrl?: string | null;
  tiktokHandle?: string | null;
  tiktokUrl?: string | null;
  facebookHandle?: string | null;
  facebookUrl?: string | null;
  gmailAccount?: {
    email: string;
    subscription: string;
    browserProfile?: string | null;
  } | null;
}

interface DailyUpload {
  id: string;
  date: string;
  personaId: string;
  videoTitle?: string | null;
  notes?: string | null;
  youtubeDone: boolean;
  instaDone: boolean;
  tiktokDone: boolean;
  facebookDone: boolean;
  youtubeUrl?: string | null;
  instaUrl?: string | null;
  tiktokUrl?: string | null;
  facebookUrl?: string | null;
  allCompleted: boolean;
  persona: Persona;
}

interface MissionTabProps {
  todayUpload: DailyUpload | null;
  scheduledPersona: Persona | null;
  currentDateStr: string;
  onRefresh: () => void;
}

export function MissionTab({
  todayUpload,
  scheduledPersona,
  currentDateStr,
  onRefresh,
}: MissionTabProps) {
  const activePersona = todayUpload?.persona || scheduledPersona;

  // Local state for forms
  const [videoTitle, setVideoTitle] = useState(todayUpload?.videoTitle || "");
  const [notes, setNotes] = useState(todayUpload?.notes || "");
  const [ytUrl, setYtUrl] = useState(todayUpload?.youtubeUrl || "");
  const [igUrl, setIgUrl] = useState(todayUpload?.instaUrl || "");
  const [ttUrl, setTtUrl] = useState(todayUpload?.tiktokUrl || "");
  const [fbUrl, setFbUrl] = useState(todayUpload?.facebookUrl || "");

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderFeedback, setReminderFeedback] = useState<string | null>(null);

  // Sync state if todayUpload changes
  const [lastUploadId, setLastUploadId] = useState(todayUpload?.id);
  if (todayUpload && todayUpload.id !== lastUploadId) {
    setLastUploadId(todayUpload.id);
    setVideoTitle(todayUpload.videoTitle || "");
    setNotes(todayUpload.notes || "");
    setYtUrl(todayUpload.youtubeUrl || "");
    setIgUrl(todayUpload.instaUrl || "");
    setTtUrl(todayUpload.tiktokUrl || "");
    setFbUrl(todayUpload.facebookUrl || "");
  }

  // Calculate completed count
  const completedCount =
    (todayUpload?.youtubeDone ? 1 : 0) +
    (todayUpload?.instaDone ? 1 : 0) +
    (todayUpload?.tiktokDone ? 1 : 0) +
    (todayUpload?.facebookDone ? 1 : 0);

  const percentage = Math.round((completedCount / 4) * 100);
  const isFullyCompleted = todayUpload?.allCompleted || completedCount === 4;

  const handleTogglePlatform = async (platform: string, currentVal: boolean) => {
    if (!activePersona) return;
    try {
      await fetch("/api/uploads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: todayUpload?.id,
          personaId: activePersona.id,
          date: currentDateStr,
          platform,
          value: !currentVal,
        }),
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to toggle platform", err);
    }
  };

  const handleMarkAll = async (targetVal: boolean) => {
    if (!activePersona) return;
    try {
      await fetch("/api/uploads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: todayUpload?.id,
          personaId: activePersona.id,
          date: currentDateStr,
          markAll: targetVal,
        }),
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to mark all", err);
    }
  };

  const handleSaveDetails = async () => {
    if (!activePersona) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/uploads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: todayUpload?.id,
          personaId: activePersona.id,
          date: currentDateStr,
          videoTitle,
          notes,
          youtubeUrl: ytUrl,
          instaUrl: igUrl,
          tiktokUrl: ttUrl,
          facebookUrl: fbUrl,
        }),
      });
      if (res.ok) {
        setSaveMessage("Saved successfully! Links and notes updated.");
        onRefresh();
        setTimeout(() => setSaveMessage(null), 3500);
      } else {
        setSaveMessage("Failed to save. Please try again.");
      }
    } catch (err) {
      console.error("Failed to save post details", err);
      setSaveMessage("Error saving details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerWhatsApp = async () => {
    setIsSendingReminder(true);
    setReminderFeedback(null);
    try {
      const res = await fetch("/api/cron/remind?force=true", {
        method: "POST",
        headers: {
          Authorization: "Bearer creatorops_super_secret_cron_token_2025",
        },
      });
      const data = await res.json();
      if (res.ok) {
        if (data.status === "completed") {
          setReminderFeedback("All uploads finished! No reminder needed.");
        } else if (data.status === "sent") {
          setReminderFeedback(`WhatsApp reminder sent to ${data.sent_to}!`);
        } else {
          setReminderFeedback(data.message || "Reminder processed.");
        }
      } else {
        setReminderFeedback(data.error || "Failed to trigger reminder.");
      }
    } catch (err) {
      setReminderFeedback("Network error triggering WhatsApp reminder.");
    } finally {
      setIsSendingReminder(false);
      setTimeout(() => setReminderFeedback(null), 5000);
    }
  };

  const platforms = [
    {
      id: "youtube",
      name: "YouTube Shorts / Video",
      handle: activePersona?.youtubeHandle || "@creator",
      url: activePersona?.youtubeUrl,
      postUrl: ytUrl,
      setPostUrl: setYtUrl,
      done: Boolean(todayUpload?.youtubeDone),
      icon: YouTubeIcon,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
    },
    {
      id: "insta",
      name: "Instagram Reel",
      handle: activePersona?.instaHandle || "@creator",
      url: activePersona?.instaUrl,
      postUrl: igUrl,
      setPostUrl: setIgUrl,
      done: Boolean(todayUpload?.instaDone),
      icon: InstagramIcon,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30",
    },
    {
      id: "tiktok",
      name: "TikTok Video",
      handle: activePersona?.tiktokHandle || "@creator",
      url: activePersona?.tiktokUrl,
      postUrl: ttUrl,
      setPostUrl: setTtUrl,
      done: Boolean(todayUpload?.tiktokDone),
      icon: TikTokIcon,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
    },
    {
      id: "facebook",
      name: "Facebook Page Video",
      handle: activePersona?.facebookHandle || "Creator Page",
      url: activePersona?.facebookUrl,
      postUrl: fbUrl,
      setPostUrl: setFbUrl,
      done: Boolean(todayUpload?.facebookDone),
      icon: FacebookIcon,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Card: Today's Active Brand */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121522] via-[#0e101a] to-[#090a0f] border border-[#202538] p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Today&apos;s Active Rotation
              </span>
              <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" /> PKT Date: {currentDateStr}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>{activePersona?.name || "No Brand Assigned"}</span>
            </h1>

            {/* Sub-channel Handle Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {activePersona?.youtubeUrl && (
                <a
                  href={activePersona.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161926] border border-[#272e42] text-xs text-neutral-300 hover:text-red-400 hover:border-red-500/40 transition-colors"
                >
                  <YouTubeIcon className="w-3.5 h-3.5 text-red-400" />
                  <span>{activePersona.youtubeHandle || "YouTube"}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
              {activePersona?.instaUrl && (
                <a
                  href={activePersona.instaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161926] border border-[#272e42] text-xs text-neutral-300 hover:text-pink-400 hover:border-pink-500/40 transition-colors"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                  <span>{activePersona.instaHandle || "Instagram"}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
              {activePersona?.tiktokUrl && (
                <a
                  href={activePersona.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161926] border border-[#272e42] text-xs text-neutral-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
                >
                  <TikTokIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activePersona.tiktokHandle || "TikTok"}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
              {activePersona?.facebookUrl && (
                <a
                  href={activePersona.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161926] border border-[#272e42] text-xs text-neutral-300 hover:text-blue-400 hover:border-blue-500/40 transition-colors"
                >
                  <FacebookIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>{activePersona.facebookHandle || "Facebook"}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
            </div>

            {/* Linked Gmail & Chrome Profile */}
            {activePersona?.gmailAccount && (
              <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5 bg-[#141724] px-2.5 py-1 rounded-md border border-[#202638]">
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-purple-300 font-medium">
                    {activePersona.gmailAccount.subscription}
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span>{activePersona.gmailAccount.email}</span>
                  {activePersona.gmailAccount.browserProfile && (
                    <>
                      <span className="text-neutral-500">•</span>
                      <span className="flex items-center gap-1 text-neutral-300">
                        <Laptop className="w-3 h-3 text-neutral-400" />
                        {activePersona.gmailAccount.browserProfile}
                      </span>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions / Status Block */}
          <div className="flex flex-col sm:items-end gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMarkAll(!isFullyCompleted)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md cursor-pointer ${
                  isFullyCompleted
                    ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 text-neutral-950 font-bold hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20"
                }`}
              >
                {isFullyCompleted ? (
                  <>
                    <Circle className="w-4 h-4" /> Reset All Checkboxes
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-4 h-4" /> Mark All Done (4/4)
                  </>
                )}
              </button>

              <button
                onClick={handleTriggerWhatsApp}
                disabled={isSendingReminder}
                title="Dispatch WhatsApp Alert to your phone immediately"
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#171b29] hover:bg-[#20263a] border border-[#283149] text-xs font-medium text-neutral-200 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSendingReminder ? "Sending..." : "Test Ping"}</span>
              </button>
            </div>

            {reminderFeedback && (
              <span className="text-xs px-2.5 py-1 rounded bg-neutral-900 border border-neutral-700 text-emerald-300">
                {reminderFeedback}
              </span>
            )}

            {/* Progress Counter */}
            <div className="w-full sm:w-52 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-neutral-400">Daily Mission Progress</span>
                <span
                  className={
                    isFullyCompleted ? "text-emerald-400 font-bold" : "text-amber-400"
                  }
                >
                  {completedCount} of 4 ({percentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#171a26] rounded-full overflow-hidden border border-[#22273b]">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFullyCompleted
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/30"
                      : "bg-gradient-to-r from-amber-500 to-emerald-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Platform Checklist Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              className={`relative rounded-xl border p-5 transition-all flex flex-col justify-between ${
                p.done
                  ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm"
                  : "bg-[#11131c] border-[#1e2333] hover:border-[#2b3248]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${p.bgColor} border ${p.borderColor}`}>
                    <Icon className={`w-5 h-5 ${p.color}`} />
                  </div>
                  <button
                    onClick={() => handleTogglePlatform(p.id, p.done)}
                    className="cursor-pointer transition-transform active:scale-95"
                    title={p.done ? "Mark pending" : "Mark completed"}
                  >
                    {p.done ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-neutral-600 hover:text-neutral-400" />
                    )}
                  </button>
                </div>

                <h3 className="font-semibold text-sm text-white">{p.name}</h3>
                <span className="text-xs text-neutral-400 block mt-0.5 truncate">
                  {p.handle}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1d2232]">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      p.done
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {p.done ? "Uploaded & Done" : "Upload Pending"}
                  </span>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Content, Script Notes & Proof Archive Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Post Title & Script Notes */}
        <div className="lg:col-span-7 space-y-4 rounded-xl border border-[#1e2333] bg-[#10121a] p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c2130]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">
                Today&apos;s Creative Content & Script
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              Date: {currentDateStr}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Video Title / Hook Topic
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g. 3 Secrets Nobody Tells You About AI Agents..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141724] border border-[#242b3d] text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Script Notes / Hashtags / Call To Action
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste key talking points, viral hook timestamp, first comment link, hashtags #creatorops #daily..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141724] border border-[#242b3d] text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Uploaded Video Links (Proof / Archive) */}
        <div className="lg:col-span-5 space-y-4 rounded-xl border border-[#1e2333] bg-[#10121a] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2130]">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-semibold text-white">
                  Post URLs (Proof / Archive)
                </h2>
              </div>
            </div>

            <div className="space-y-2.5 mt-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-0.5">
                  YouTube Video Link
                </label>
                <input
                  type="url"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  placeholder="https://youtube.com/shorts/..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141724] border border-[#242b3d] text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-red-500/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-0.5">
                  Instagram Reel Link
                </label>
                <input
                  type="url"
                  value={igUrl}
                  onChange={(e) => setIgUrl(e.target.value)}
                  placeholder="https://instagram.com/reel/..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141724] border border-[#242b3d] text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-pink-500/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-0.5">
                  TikTok Video Link
                </label>
                <input
                  type="url"
                  value={ttUrl}
                  onChange={(e) => setTtUrl(e.target.value)}
                  placeholder="https://tiktok.com/@creator/video/..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141724] border border-[#242b3d] text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-0.5">
                  Facebook Video Link
                </label>
                <input
                  type="url"
                  value={fbUrl}
                  onChange={(e) => setFbUrl(e.target.value)}
                  placeholder="https://facebook.com/watch/..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141724] border border-[#242b3d] text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-blue-500/60"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1c2130] flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {saveMessage ? (
                <span className="text-emerald-400 font-medium">
                  {saveMessage}
                </span>
              ) : (
                "Save metadata & proof links"
              )}
            </span>
            <button
              onClick={handleSaveDetails}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Details"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
