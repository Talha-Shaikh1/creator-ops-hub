"use client";

import { useState } from "react";
import {
  CalendarDays,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import {
  YouTubeIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
} from "./SocialIcons";

interface DailyUploadRecord {
  id: string;
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
}

interface HistoryDay {
  date: string;
  status: "completed" | "partial" | "missed" | "pending";
  completedPlatforms: number;
  totalPlatforms: number;
  personaName: string | null;
  details: DailyUploadRecord | null;
}

interface StatsData {
  currentStreak: number;
  totalTrackedDays: number;
  completedDays: number;
  partialDays: number;
  missedDays: number;
  completionRate: number;
  history: HistoryDay[];
}

interface HistoryTabProps {
  stats: StatsData | null;
  onRefresh: () => void;
}

export function HistoryTab({ stats }: HistoryTabProps) {
  const [selectedDay, setSelectedDay] = useState<HistoryDay | null>(null);

  if (!stats) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Loading streak & history statistics...
      </div>
    );
  }

  const activeDay = selectedDay || stats.history[stats.history.length - 1];

  return (
    <div className="space-y-6">
      {/* Header & Metrics Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
            <span>Streak & Upload Matrix</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            28-day performance history and multi-channel consistency tracker
          </p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-950/20 to-[#12141d] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium block">
              Current Streak
            </span>
            <span className="text-2xl font-black text-white">
              {stats.currentStreak}{" "}
              <span className="text-xs font-semibold text-orange-400">
                {stats.currentStreak === 1 ? "Day" : "Days"}
              </span>
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-[#12141d] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium block">
              Completion Rate
            </span>
            <span className="text-2xl font-black text-white">
              {stats.completionRate}%
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* 100% Uploaded Days */}
        <div className="rounded-xl border border-[#1e2333] bg-[#10121a] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium block">
              100% Done Days
            </span>
            <span className="text-2xl font-black text-emerald-400">
              {stats.completedDays}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Partial & Missed */}
        <div className="rounded-xl border border-[#1e2333] bg-[#10121a] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium block">
              Partial / Missed
            </span>
            <span className="text-2xl font-black text-white">
              <span className="text-amber-400">{stats.partialDays}</span> /{" "}
              <span className="text-red-400">{stats.missedDays}</span>
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 28-Day Visual Matrix & Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 28-Day Grid */}
        <div className="lg:col-span-8 rounded-2xl border border-[#1e2333] bg-[#10121a] p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#1c2130] gap-2">
            <div>
              <h3 className="text-base font-bold text-white">
                Upload Consistency Matrix (28 Days)
              </h3>
              <p className="text-xs text-neutral-400">
                Click any day cell to view recorded video title and post links
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <span className="text-neutral-300">100% (4/4)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                <span className="text-neutral-300">Partial</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm shadow-red-500/50" />
                <span className="text-neutral-300">Missed</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
            {stats.history.map((day) => {
              const isSelected = activeDay?.date === day.date;
              let bg = "bg-[#141724] border-[#22283a] text-neutral-400";
              let badge = "text-neutral-500";

              if (day.status === "completed") {
                bg =
                  "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 hover:border-emerald-400";
                badge = "text-emerald-400 font-bold";
              } else if (day.status === "partial") {
                bg =
                  "bg-amber-950/40 border-amber-500/50 text-amber-200 hover:border-amber-400";
                badge = "text-amber-400 font-bold";
              } else if (day.status === "missed") {
                bg =
                  "bg-red-950/30 border-red-500/40 text-red-300 hover:border-red-400";
                badge = "text-red-400 font-semibold";
              } else if (day.status === "pending") {
                bg =
                  "bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-500";
                badge = "text-neutral-400";
              }

              // Extract day number (e.g. "15" from "2026-09-15")
              const dayNum = day.date.split("-")[2];
              const monthShort = new Date(day.date).toLocaleDateString("en-US", {
                month: "short",
              });

              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDay(day)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer min-h-[85px] ${bg} ${
                    isSelected
                      ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#090a0f]"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-mono text-neutral-400">
                      {monthShort} {dayNum}
                    </span>
                    <span className={`text-[10px] font-mono ${badge}`}>
                      {day.completedPlatforms}/4
                    </span>
                  </div>

                  <div className="mt-2 truncate">
                    {day.personaName ? (
                      <span className="text-xs font-semibold block truncate">
                        @{day.personaName}
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-500 italic block">
                        --
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Inspector Card */}
        <div className="lg:col-span-4 rounded-2xl border border-[#1e2333] bg-[#10121a] p-5 sm:p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2130]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Day Details</span>
              </h3>
              <span className="text-xs font-mono text-neutral-400">
                {activeDay?.date}
              </span>
            </div>

            {activeDay ? (
              <div className="mt-4 space-y-4">
                <div>
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold block">
                    Scheduled Brand
                  </span>
                  <span className="text-lg font-extrabold text-white">
                    {activeDay.personaName ? `@${activeDay.personaName}` : "None"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold block mb-1.5">
                    Platform Upload Checklist
                  </span>
                  <div className="space-y-2">
                    {[
                      {
                        name: "YouTube",
                        icon: YouTubeIcon,
                        done: activeDay.details?.youtubeDone,
                        url: activeDay.details?.youtubeUrl,
                        color: "text-red-400",
                      },
                      {
                        name: "Instagram",
                        icon: InstagramIcon,
                        done: activeDay.details?.instaDone,
                        url: activeDay.details?.instaUrl,
                        color: "text-pink-400",
                      },
                      {
                        name: "TikTok",
                        icon: TikTokIcon,
                        done: activeDay.details?.tiktokDone,
                        url: activeDay.details?.tiktokUrl,
                        color: "text-cyan-400",
                      },
                      {
                        name: "Facebook",
                        icon: FacebookIcon,
                        done: activeDay.details?.facebookDone,
                        url: activeDay.details?.facebookUrl,
                        color: "text-blue-400",
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#141724] border border-[#232a3d] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                            <span className="text-neutral-200 font-medium">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.done ? (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                                Done
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                                Pending
                              </span>
                            )}
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-neutral-400 hover:text-white"
                                title="Open uploaded link"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {activeDay.details?.videoTitle && (
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold block">
                      Video Title / Hook
                    </span>
                    <p className="text-xs text-neutral-200 mt-1 bg-[#141724] p-2.5 rounded-lg border border-[#232a3d]">
                      {activeDay.details.videoTitle}
                    </p>
                  </div>
                )}

                {activeDay.details?.notes && (
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold block">
                      Script Notes
                    </span>
                    <p className="text-xs text-neutral-300 mt-1 bg-[#141724] p-2.5 rounded-lg border border-[#232a3d] line-clamp-3">
                      {activeDay.details.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 mt-4">
                Select a day to view details
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
