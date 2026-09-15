"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Flame,
  Radio,
  Sparkles,
  Bot,
  CalendarDays,
  Settings,
  CheckCircle2,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeBrandName?: string;
  isAllCompleted?: boolean;
  streakCount?: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  activeBrandName,
  isAllCompleted,
  streakCount = 0,
}: NavbarProps) {
  const [pktTime, setPktTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setPktTime(formatter.format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: "mission", label: "Today's Mission", icon: Sparkles },
    { id: "rotation", label: "Brand Rotation", icon: Radio },
    { id: "gmail", label: "Gmail & AI Vault", icon: Bot },
    { id: "history", label: "Streak & History", icon: CalendarDays },
    { id: "settings", label: "WhatsApp & Cron", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1e2230] bg-[#090a0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & PKT Time */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  CreatorOps <span className="text-emerald-400">Hub</span>
                </span>
                <span className="text-[10px] text-neutral-400 block -mt-1 font-mono">
                  WhatsApp Content Engine
                </span>
              </div>
            </div>

            {/* PKT Clock Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141722] border border-[#23283a] text-xs text-neutral-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{pktTime ? `${pktTime} PKT` : "PKT Clock"}</span>
            </div>
          </div>

          {/* Today's Active Brand Pill */}
          <div className="hidden lg:flex items-center gap-3">
            {activeBrandName && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isAllCompleted
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-amber-950/40 border-amber-500/30 text-amber-300"
                }`}
              >
                {isAllCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
                <span>
                  Today: <strong className="font-semibold text-white">@{activeBrandName}</strong>
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isAllCompleted
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {isAllCompleted ? "Done" : "Pending"}
                </span>
              </div>
            )}

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-950/30 border border-orange-500/30 text-orange-400 text-xs font-medium">
              <Flame className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
              <span>{streakCount} Day Streak</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-[#141722]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
