"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Film,
  Image as ImageIcon,
  MessageSquare,
  Radio,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Tv,
  Layers,
  HelpCircle,
  TrendingUp,
  Music,
  Share2,
  CheckCircle2,
  Calendar,
  Zap,
  Tag,
  Save,
} from "lucide-react";
import { SocialIcon } from "@/components/SocialIcons";

interface Persona {
  id: string;
  name: string;
  assignedDay?: number | null;
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

interface CarouselSlide {
  slide: number;
  title: string;
  text: string;
  visual: string;
}

interface StoryItem {
  storyNumber: number;
  type: string;
  caption: string;
  sticker: string;
}

interface AIContentStudioTabProps {
  personas: Persona[];
  currentDateStr: string;
  currentPKTDayOfWeek: number;
  onRefreshAll?: () => void;
}

export function AIContentStudioTab({
  personas,
  currentDateStr,
  currentPKTDayOfWeek,
  onRefreshAll,
}: AIContentStudioTabProps) {
  // Active Persona State
  const defaultPersona =
    personas.find((p) => p.assignedDay === currentPKTDayOfWeek) ||
    personas[0] ||
    null;

  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(
    defaultPersona?.id || ""
  );
  const [selectedDate, setSelectedDate] = useState<string>(currentDateStr);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [customTopic, setCustomTopic] = useState<string>("");
  const [selectedPostType, setSelectedPostType] = useState<string>(
    "carousel (3-5 slides, 4:5 vertical)"
  );

  // Loaded Content Plan State
  const [planData, setPlanData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Progress Tracker State
  const [progress, setProgress] = useState<{
    targets: { weeklyReelsTarget: number; weeklyFeedTarget: number; dailyStoriesTarget: number };
    actuals: { completedReelsThisWeek: number; totalFeedPostsThisWeek: number; todayStories: number; todayFeedPosts: number };
  } | null>(null);

  const selectedPersona = personas.find((p) => p.id === selectedPersonaId) || defaultPersona;

  // Fetch saved plan and progress
  const fetchPlanAndProgress = useCallback(async () => {
    if (!selectedPersonaId) return;
    setIsLoading(true);
    try {
      const [planRes, progRes] = await Promise.all([
        fetch(`/api/content?personaId=${selectedPersonaId}&date=${selectedDate}`),
        fetch(`/api/content/progress?personaId=${selectedPersonaId}&date=${selectedDate}`),
      ]);

      if (planRes.ok) {
        const data = await planRes.json();
        setPlanData(data);
        if (data?.imagePostType) {
          setSelectedPostType(data.imagePostType);
        }
      }
      if (progRes.ok) {
        const pData = await progRes.json();
        setProgress(pData);
      }
    } catch (err) {
      console.error("Error fetching content plan:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPersonaId, selectedDate]);

  useEffect(() => {
    if (selectedPersonaId) {
      fetchPlanAndProgress();
    }
  }, [selectedPersonaId, selectedDate, fetchPlanAndProgress]);

  // Handle Generate with AI
  const handleGenerate = async () => {
    if (!selectedPersonaId) return;
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: selectedPersonaId,
          date: selectedDate,
          customTopic: customTopic.trim() || undefined,
          postType: selectedPostType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const result = await res.json();
      setPlanData(result.plan);
      setStatusMessage("✨ Daily Operations Pack generated successfully!");
      setTimeout(() => setStatusMessage(null), 4000);
      fetchPlanAndProgress();
      if (onRefreshAll) onRefreshAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`❌ ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Save edits
  const handleSavePlan = async () => {
    if (!selectedPersonaId || !planData) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: selectedPersonaId,
          date: selectedDate,
          ...planData,
        }),
      });
      if (res.ok) {
        setStatusMessage("💾 Changes saved to Neon database!");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Update progress delta (+/- stories, +/- feed posts)
  const updateProgressDelta = async (field: "feed" | "stories", delta: number) => {
    if (!selectedPersonaId) return;
    try {
      const payload =
        field === "feed"
          ? { feedPostsCountDelta: delta, personaId: selectedPersonaId, date: selectedDate }
          : { storiesCountDelta: delta, personaId: selectedPersonaId, date: selectedDate };

      const res = await fetch("/api/content/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        fetchPlanAndProgress();
        if (onRefreshAll) onRefreshAll();
      }
    } catch (err) {
      console.error("Failed to update progress delta", err);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Parse parsed JSON fields safely
  const parsedCarousel: CarouselSlide[] = planData?.carouselSlides
    ? typeof planData.carouselSlides === "string"
      ? JSON.parse(planData.carouselSlides)
      : planData.carouselSlides
    : [];

  const parsedStories: StoryItem[] = planData?.storiesPlan
    ? typeof planData.storiesPlan === "string"
      ? JSON.parse(planData.storiesPlan)
      : planData.storiesPlan
    : [];

  const postTypesList = [
    { id: "carousel (3-5 slides, 4:5 vertical)", label: "4:5 Vertical Carousel (3-5 slides)" },
    { id: "casual candid", label: "Casual Candid Street/Cafe" },
    { id: "OOTD / mirror photo", label: "OOTD / Full-length Mirror" },
    { id: "podcast host / BTS", label: "Podcast Host / Studio BTS" },
    { id: "aesthetic flatlay / coffee shop", label: "Aesthetic Flatlay / Desk" },
    { id: "quote-over-photo", label: "Quote-Over-Photo Typography" },
    { id: "photo dump", label: "Multi-Image Photo Dump" },
  ];

  return (
    <div className="space-y-6">
      {/* TOP CONTROLS & PERSONA SELECTOR */}
      <div className="rounded-2xl bg-gradient-to-b from-[#161926] to-[#0f111a] border border-[#23283a] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Persona Picker */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-black shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Daily AI Content Operations Studio
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  7-Step Workflow
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Automated multi-platform prompts, scripts, carousels, and 1-click copy metadata
              </p>
            </div>
          </div>

          {/* Selector & Generator Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedPersonaId}
              onChange={(e) => setSelectedPersonaId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#12141e] border border-[#252c3f] text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              {personas.map((p) => {
                const isScheduledToday = p.assignedDay === currentPKTDayOfWeek;
                return (
                  <option key={p.id} value={p.id} className="bg-[#11131c]">
                    @{p.name} {isScheduledToday ? "⭐ (Today's Turn)" : ""} - {p.language || "EN"}
                  </option>
                );
              })}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#12141e] border border-[#252c3f] text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Generating Operations Pack..." : "⚡ Generate Daily Pack"}</span>
            </button>

            {planData && (
              <button
                onClick={handleSavePlan}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1c2130] hover:bg-[#252c3f] text-neutral-200 text-xs font-semibold border border-[#2e374f] transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSaving ? "Saving..." : "Save Plan"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom Topic & Post Type Quick Filter */}
        <div className="mt-4 pt-4 border-t border-[#1f2436] flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#10121a] px-3 py-1.5 rounded-lg border border-[#202538]">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Optional: Specific angle or viral debate topic (e.g. 'Why apologizing too much ruins respect')"
              className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 whitespace-nowrap">Image Post Type:</span>
            <select
              value={selectedPostType}
              onChange={(e) => setSelectedPostType(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#10121a] border border-[#202538] text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
            >
              {postTypesList.map((pt) => (
                <option key={pt.id} value={pt.id} className="bg-[#11131c]">
                  {pt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between">
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* STEP 7 / METRICS BAR: WEEKLY TARGET TRACKER */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weekly Reels */}
          <div className="rounded-xl bg-[#11131c] border border-[#1f2436] p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-red-400" />
                Weekly Reels (All 4 Platforms)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {progress.actuals.completedReelsThisWeek}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  / {progress.targets.weeklyReelsTarget} Target
                </span>
              </div>
              <div className="w-36 h-1.5 bg-[#1a1e2b] rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (progress.actuals.completedReelsThisWeek /
                        (progress.targets.weeklyReelsTarget || 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  progress.actuals.completedReelsThisWeek >= progress.targets.weeklyReelsTarget
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {progress.actuals.completedReelsThisWeek >= progress.targets.weeklyReelsTarget
                  ? "Target Reached 🎉"
                  : `${progress.targets.weeklyReelsTarget - progress.actuals.completedReelsThisWeek} Left`}
              </span>
            </div>
          </div>

          {/* Weekly Feed Posts */}
          <div className="rounded-xl bg-[#11131c] border border-[#1f2436] p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                Weekly Feed / Image Posts
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {progress.actuals.totalFeedPostsThisWeek}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  / {progress.targets.weeklyFeedTarget} Target
                </span>
              </div>
              <div className="w-36 h-1.5 bg-[#1a1e2b] rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (progress.actuals.totalFeedPostsThisWeek /
                        (progress.targets.weeklyFeedTarget || 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#161926] p-1 rounded-lg border border-[#252c3f]">
              <button
                onClick={() => updateProgressDelta("feed", -1)}
                className="w-6 h-6 rounded bg-[#1f2436] hover:bg-red-500/20 text-neutral-300 hover:text-red-300 text-xs font-bold transition-all cursor-pointer"
              >
                -
              </button>
              <span className="text-xs font-mono font-bold px-1.5 text-white">
                {progress.actuals.todayFeedPosts} Today
              </span>
              <button
                onClick={() => updateProgressDelta("feed", 1)}
                className="w-6 h-6 rounded bg-[#1f2436] hover:bg-emerald-500/20 text-neutral-300 hover:text-emerald-300 text-xs font-bold transition-all cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Daily Stories Tracker */}
          <div className="rounded-xl bg-[#11131c] border border-[#1f2436] p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                Today&apos;s Stories (IG &amp; FB)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {progress.actuals.todayStories}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  / {progress.targets.dailyStoriesTarget} Daily Target
                </span>
              </div>
              <div className="w-36 h-1.5 bg-[#1a1e2b] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (progress.actuals.todayStories /
                        (progress.targets.dailyStoriesTarget || 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#161926] p-1 rounded-lg border border-[#252c3f]">
              <button
                onClick={() => updateProgressDelta("stories", -1)}
                className="w-6 h-6 rounded bg-[#1f2436] hover:bg-red-500/20 text-neutral-300 hover:text-red-300 text-xs font-bold transition-all cursor-pointer"
              >
                -
              </button>
              <span className="text-xs font-mono font-bold px-1.5 text-white">
                {progress.actuals.todayStories}
              </span>
              <button
                onClick={() => updateProgressDelta("stories", 1)}
                className="w-6 h-6 rounded bg-[#1f2436] hover:bg-emerald-500/20 text-neutral-300 hover:text-emerald-300 text-xs font-bold transition-all cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7-STEP WORKFLOW TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1f2436]">
        {[
          { num: 1, label: "Persona Specs" },
          { num: 2, label: "Trend Radar" },
          { num: 3, label: "Reel Script & Audio" },
          { num: 4, label: "Feed Post / Carousel" },
          { num: 5, label: "Daily 5-Story Pack" },
          { num: 6, label: "1-Click Copy Vault" },
        ].map((step) => (
          <button
            key={step.num}
            onClick={() => setActiveStep(step.num)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeStep === step.num
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "bg-[#11131c] text-neutral-400 hover:text-white hover:bg-[#161926] border border-[#1f2436]"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                activeStep === step.num ? "bg-black text-emerald-400" : "bg-[#1f2436] text-neutral-300"
              }`}
            >
              {step.num}
            </span>
            <span>{step.label}</span>
          </button>
        ))}
      </div>

      {/* MAIN STEP CONTENT PANELS */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#11131c] rounded-2xl border border-[#1f2436]">
          <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mb-3" />
          <p className="text-xs text-neutral-400 font-medium">Loading content operations pack...</p>
        </div>
      ) : !planData ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[#11131c] rounded-2xl border border-[#1f2436] text-center p-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            No Daily Operations Plan Generated Yet for @{selectedPersona?.name}
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mb-5">
            Click &quot;⚡ Generate Daily Pack&quot; above to instantly produce the 3s Hook, 35-45s timed spoken script, 4:5 Carousel breakdown, 5-Story pack, and 1-click platform metadata.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
            <span>Generate Today&apos;s Pack</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* STEP 1: PERSONA SPECS & BLUEPRINT */}
          {activeStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Persona Profile Card */}
              <div className="rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2e]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                      @{selectedPersona?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">@{selectedPersona?.name}</h4>
                      <p className="text-[11px] text-neutral-400">{selectedPersona?.language || "English"}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#171b28] border border-[#252c3f] text-neutral-300 font-mono">
                    Rotation Day: {selectedPersona?.assignedDay !== null ? `Day ${selectedPersona?.assignedDay}` : "Standby"}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-neutral-500 font-semibold block mb-0.5">Content Niche:</span>
                    <p className="text-neutral-200 bg-[#141722] p-2.5 rounded-lg border border-[#1e2333]">
                      {selectedPersona?.niche || "Lifestyle, relationships, mindset and high-value personal growth"}
                    </p>
                  </div>

                  <div>
                    <span className="text-neutral-500 font-semibold block mb-0.5">Target Audience Demographic:</span>
                    <p className="text-neutral-200 bg-[#141722] p-2.5 rounded-lg border border-[#1e2333]">
                      {selectedPersona?.targetAudience || "18-35 young adults, modern professionals & students"}
                    </p>
                  </div>

                  <div>
                    <span className="text-neutral-500 font-semibold block mb-0.5">Visual Style & Aesthetic:</span>
                    <p className="text-neutral-200 bg-[#141722] p-2.5 rounded-lg border border-[#1e2333]">
                      {selectedPersona?.visualStyle || "Warm cinematic tones, natural 85mm portrait bokeh, high-fashion modern minimalism"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Master Prompts Card */}
              <div className="rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2e]">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tv className="w-4 h-4 text-indigo-400" />
                    Master AI Generation Prompts
                  </h4>
                  <span className="text-[10px] text-neutral-400">1-Click Copy</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-neutral-400">Saved Frame Image Prompt:</span>
                      <button
                        onClick={() =>
                          handleCopy(
                            selectedPersona?.framePrompt ||
                              `Photorealistic 8k vertical portrait of ${selectedPersona?.name}, natural soft light, cinematic photography --ar 9:16`,
                            "framePrompt"
                          )
                        }
                        className="text-[10px] flex items-center gap-1 text-emerald-400 hover:underline cursor-pointer"
                      >
                        {copiedKey === "framePrompt" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "framePrompt" ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={3}
                      value={
                        selectedPersona?.framePrompt ||
                        `Photorealistic 8k vertical portrait of ${selectedPersona?.name}, natural soft light, cinematic photography --ar 9:16`
                      }
                      className="w-full text-xs p-2.5 rounded-lg bg-[#141722] border border-[#1e2333] text-neutral-300 font-mono resize-none focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-neutral-400">Master Video Prompt:</span>
                      <button
                        onClick={() =>
                          handleCopy(
                            selectedPersona?.masterVideoPrompt ||
                              `Cinematic vertical video, subtle breathing movement, micro-expressions, 4k ultra-realistic`,
                            "videoPrompt"
                          )
                        }
                        className="text-[10px] flex items-center gap-1 text-emerald-400 hover:underline cursor-pointer"
                      >
                        {copiedKey === "videoPrompt" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "videoPrompt" ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={3}
                      value={
                        selectedPersona?.masterVideoPrompt ||
                        `Cinematic vertical video, subtle breathing movement, micro-expressions, 4k ultra-realistic`
                      }
                      className="w-full text-xs p-2.5 rounded-lg bg-[#141722] border border-[#1e2333] text-neutral-300 font-mono resize-none focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TREND RADAR */}
          {activeStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2e]">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Daily Viral Trend Radar</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                    Matched to Niche
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-neutral-400 block mb-1">
                      Active Viral Conversation Angle:
                    </span>
                    <div className="p-3 rounded-xl bg-[#141722] border border-[#202538] text-sm font-semibold text-emerald-300">
                      &ldquo;{planData.trendingTopic}&rdquo;
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-neutral-400 block mb-1">
                      Relatable Relationship &amp; Cultural Dynamics:
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed bg-[#141722] p-3 rounded-xl border border-[#202538]">
                      Audience hook focusing on unspoken boundaries, personal peace vs societal approval, and emotional leverage in modern dating and family dynamics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trending Audio Card */}
              <div className="rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2e]">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-bold text-white">Trending Audio Recommendation</h4>
                  </div>
                  <button
                    onClick={() => handleCopy(planData.trendingAudio || "", "audio")}
                    className="text-[10px] flex items-center gap-1 text-purple-400 hover:underline cursor-pointer"
                  >
                    {copiedKey === "audio" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "audio" ? "Copied" : "Copy Name"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-mono font-bold text-purple-300">
                    <Music className="w-4 h-4 animate-bounce" />
                    <span>{planData.trendingAudio || "Cinematic Lofi Ambient Slowed"}</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Pair this reel with low ambient audio (set track volume to 10-15% behind voice dialogue) to maximize algorithmic retention on Instagram Reels and TikTok.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REEL PRODUCTION PLAN */}
          {activeStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hook Card */}
              <div className="lg:col-span-1 rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2e]">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    3-Second Scroll Stopper
                  </span>
                  <button
                    onClick={() => handleCopy(planData.hook || "", "hook")}
                    className="text-[10px] flex items-center gap-1 text-amber-400 hover:underline cursor-pointer"
                  >
                    {copiedKey === "hook" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "hook" ? "Copied" : "Copy Hook"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-sm font-semibold text-amber-200 leading-snug">
                  {planData.hook}
                </div>

                <div className="pt-2">
                  <span className="text-xs font-semibold text-neutral-400 block mb-1">Visual Action Cue:</span>
                  <p className="text-xs text-neutral-400 leading-relaxed bg-[#141722] p-3 rounded-lg border border-[#1e2333]">
                    Tight camera framing, calm steady eye-contact with no blinking for the first 2 seconds to trigger instant watch-time hook.
                  </p>
                </div>
              </div>

              {/* Spoken Dialogue Script */}
              <div className="lg:col-span-2 rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2e]">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">
                      35-45s Spoken Dialogue Script ({selectedPersona?.language || "English"})
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(planData.reelScript || "", "reelScript")}
                    className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-semibold cursor-pointer"
                  >
                    {copiedKey === "reelScript" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "reelScript" ? "Script Copied!" : "Copy Full Script"}</span>
                  </button>
                </div>

                <textarea
                  rows={10}
                  value={planData.reelScript || ""}
                  onChange={(e) => setPlanData({ ...planData, reelScript: e.target.value })}
                  className="w-full p-4 rounded-xl bg-[#141722] border border-[#202538] text-neutral-200 text-xs leading-relaxed font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: FEED IMAGE POST & CAROUSEL */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Image Generation Prompt */}
                <div className="rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2e]">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-pink-400" />
                      <h4 className="text-sm font-bold text-white">Photorealistic AI Image Prompt</h4>
                    </div>
                    <button
                      onClick={() => handleCopy(planData.imagePrompt || "", "imagePrompt")}
                      className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 font-semibold cursor-pointer"
                    >
                      {copiedKey === "imagePrompt" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "imagePrompt" ? "Prompt Copied!" : "Copy Midjourney Prompt"}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-pink-950/20 border border-pink-500/30 text-[11px] text-pink-300 font-medium">
                    ⚠️ Outfit is automatically differentiated from the reel outfit to maintain authentic lifestyle rotation.
                  </div>

                  <textarea
                    rows={4}
                    value={planData.imagePrompt || ""}
                    onChange={(e) => setPlanData({ ...planData, imagePrompt: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-[#141722] border border-[#202538] text-neutral-200 text-xs leading-relaxed font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Post Style Guide */}
                <div className="rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2e]">
                    <h4 className="text-sm font-bold text-white">7-Type Rotation Strategy</h4>
                    <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                      Current: {planData.imagePostType || selectedPostType}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    To keep the AI influencer&apos;s feed dynamic and realistic, rotate across candid shots, OOTDs, podcast BTS clips, 4:5 text carousels, and photo dumps across Instagram and Facebook.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {postTypesList.map((pt) => (
                      <button
                        key={pt.id}
                        onClick={() => {
                          setSelectedPostType(pt.id);
                          setPlanData({ ...planData, imagePostType: pt.id });
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          (planData.imagePostType || selectedPostType) === pt.id
                            ? "bg-pink-500/20 border-pink-500 text-pink-300 font-bold"
                            : "bg-[#141722] border-[#252c3f] text-neutral-400 hover:text-white"
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Carousel Breakdown (if Carousel) */}
              {parsedCarousel.length > 0 && (
                <div className="rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2e]">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-sm font-bold text-white">4:5 Carousel Slide-by-Slide Deck</h4>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">{parsedCarousel.length} Slides</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {parsedCarousel.map((slide, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-[#141722] border border-[#222738] p-3.5 space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 mb-1.5 pb-1 border-b border-[#1e2333]">
                            <span>Slide {slide.slide || idx + 1}</span>
                            <span className="text-[10px] text-neutral-500">{slide.title}</span>
                          </div>
                          <p className="text-xs font-semibold text-white leading-snug mb-2">
                            {slide.text}
                          </p>
                        </div>
                        <div className="text-[10px] text-neutral-400 bg-[#0d0f17] p-2 rounded border border-[#1a1d29]">
                          <span className="text-neutral-500 font-bold block mb-0.5">Visual:</span>
                          {slide.visual}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: DAILY 5-STORY PACK */}
          {activeStep === 5 && (
            <div className="rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b1f2e]">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">
                    Daily 5-Story Pack (Instagram &amp; Facebook)
                  </h4>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      parsedStories
                        .map((s) => `Story ${s.storyNumber} [${s.type}]: ${s.caption} (Sticker: ${s.sticker})`)
                        .join("\n\n"),
                      "allStories"
                    )
                  }
                  className="text-xs flex items-center gap-1 text-amber-400 hover:underline cursor-pointer"
                >
                  {copiedKey === "allStories" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "allStories" ? "Copied All Stories!" : "Copy All 5 Stories"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {parsedStories.map((story, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#141722] border border-[#222738] p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 pb-1.5 border-b border-[#1e2333]">
                        <span>Story #{story.storyNumber || idx + 1}</span>
                        <span className="text-[10px] text-neutral-500">{story.type}</span>
                      </div>
                      <p className="text-xs text-neutral-200 mt-2 leading-relaxed">
                        {story.caption}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#1a1d29] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-neutral-500 font-semibold">Interactive Sticker:</span>
                        <button
                          onClick={() => handleCopy(story.caption, `story_${idx}`)}
                          className="text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          {copiedKey === `story_${idx}` ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                          <span>{copiedKey === `story_${idx}` ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] border border-amber-500/20 font-mono">
                        {story.sticker}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: 1-CLICK MULTI-PLATFORM COPY VAULT */}
          {activeStep === 6 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* YouTube Shorts */}
              <div className="rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1b1f2e]">
                  <div className="flex items-center gap-2">
                    <SocialIcon platform="youtube" className="w-4 h-4 text-red-400" />
                    <h4 className="text-sm font-bold text-white">YouTube Shorts SEO Package</h4>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        `TITLE:\n${planData.ytTitle}\n\nDESCRIPTION:\n${planData.ytDescription}\n\nTAGS:\n${planData.ytTags}`,
                        "ytAll"
                      )
                    }
                    className="text-xs font-semibold text-red-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {copiedKey === "ytAll" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "ytAll" ? "Copied All" : "Copy All"}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-neutral-400 font-semibold">SEO Title:</span>
                      <button
                        onClick={() => handleCopy(planData.ytTitle || "", "ytTitle")}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        {copiedKey === "ytTitle" ? "Copied!" : "Copy Title"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={planData.ytTitle || ""}
                      onChange={(e) => setPlanData({ ...planData, ytTitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141722] border border-[#202538] text-white font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-neutral-400 font-semibold">1500+ Char SEO Description:</span>
                      <button
                        onClick={() => handleCopy(planData.ytDescription || "", "ytDesc")}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        {copiedKey === "ytDesc" ? "Copied!" : "Copy Description"}
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={planData.ytDescription || ""}
                      onChange={(e) => setPlanData({ ...planData, ytDescription: e.target.value })}
                      className="w-full p-3 rounded-lg bg-[#141722] border border-[#202538] text-neutral-300 font-mono text-[11px] focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-neutral-400 font-semibold">15 Comma-Separated Tags:</span>
                      <button
                        onClick={() => handleCopy(planData.ytTags || "", "ytTags")}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        {copiedKey === "ytTags" ? "Copied!" : "Copy Tags"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={planData.ytTags || ""}
                      onChange={(e) => setPlanData({ ...planData, ytTags: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141722] border border-[#202538] text-neutral-300 font-mono text-[11px] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* TikTok */}
              <div className="rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1b1f2e]">
                  <div className="flex items-center gap-2">
                    <SocialIcon platform="tiktok" className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">TikTok Hook Caption &amp; Hashtags</h4>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(`${planData.tiktokCaption}\n\n${planData.tiktokHashtags}`, "ttAll")
                    }
                    className="text-xs font-semibold text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {copiedKey === "ttAll" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "ttAll" ? "Copied!" : "Copy All"}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-neutral-400 font-semibold block mb-1">Hook Caption:</span>
                    <textarea
                      rows={3}
                      value={planData.tiktokCaption || ""}
                      onChange={(e) => setPlanData({ ...planData, tiktokCaption: e.target.value })}
                      className="w-full p-3 rounded-lg bg-[#141722] border border-[#202538] text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-neutral-400 font-semibold block mb-1">Hashtags:</span>
                    <input
                      type="text"
                      value={planData.tiktokHashtags || ""}
                      onChange={(e) => setPlanData({ ...planData, tiktokHashtags: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141722] border border-[#202538] text-cyan-300 font-mono text-[11px] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Instagram Reels */}
              <div className="rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1b1f2e]">
                  <div className="flex items-center gap-2">
                    <SocialIcon platform="instagram" className="w-4 h-4 text-pink-400" />
                    <h4 className="text-sm font-bold text-white">Instagram Reels Long-Form Caption</h4>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(`${planData.instaCaption}\n\n${planData.instaHashtags}`, "igAll")
                    }
                    className="text-xs font-semibold text-pink-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {copiedKey === "igAll" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "igAll" ? "Copied!" : "Copy Caption + Tags"}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-neutral-400 font-semibold block mb-1">Caption:</span>
                    <textarea
                      rows={5}
                      value={planData.instaCaption || ""}
                      onChange={(e) => setPlanData({ ...planData, instaCaption: e.target.value })}
                      className="w-full p-3 rounded-lg bg-[#141722] border border-[#202538] text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-neutral-400 font-semibold block mb-1">8-12 Targeted Hashtags:</span>
                    <input
                      type="text"
                      value={planData.instaHashtags || ""}
                      onChange={(e) => setPlanData({ ...planData, instaHashtags: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141722] border border-[#202538] text-pink-300 font-mono text-[11px] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Facebook Discussion Caption */}
              <div className="rounded-2xl bg-[#11131c] border border-[#1f2436] p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1b1f2e]">
                  <div className="flex items-center gap-2">
                    <SocialIcon platform="facebook" className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold text-white">Facebook Discussion Caption</h4>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(`${planData.facebookCaption}\n\n${planData.facebookHashtags}`, "fbAll")
                    }
                    className="text-xs font-semibold text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {copiedKey === "fbAll" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "fbAll" ? "Copied!" : "Copy Caption"}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-neutral-400 font-semibold block mb-1">
                      Comment Trigger &amp; Question:
                    </span>
                    <textarea
                      rows={5}
                      value={planData.facebookCaption || ""}
                      onChange={(e) => setPlanData({ ...planData, facebookCaption: e.target.value })}
                      className="w-full p-3 rounded-lg bg-[#141722] border border-[#202538] text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-neutral-400 font-semibold block mb-1">Hashtags:</span>
                    <input
                      type="text"
                      value={planData.facebookHashtags || ""}
                      onChange={(e) => setPlanData({ ...planData, facebookHashtags: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141722] border border-[#202538] text-blue-300 font-mono text-[11px] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
