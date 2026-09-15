"use client";

import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { MissionTab } from "@/components/MissionTab";
import { RotationTab } from "@/components/RotationTab";
import { GmailVaultTab } from "@/components/GmailVaultTab";
import { HistoryTab } from "@/components/HistoryTab";
import { SettingsTab } from "@/components/SettingsTab";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("mission");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [todayData, setTodayData] = useState<any>(null);
  const [personas, setPersonas] = useState<any[]>([]);
  const [gmailAccounts, setGmailAccounts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  // Helper for PKT day of week
  const [pktDayOfWeek, setPktDayOfWeek] = useState<number>(1);
  const [pktDateStr, setPktDateStr] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const [uploadsRes, personasRes, gmailRes, statsRes, settingsRes] =
        await Promise.all([
          fetch("/api/uploads"),
          fetch("/api/personas"),
          fetch("/api/gmail"),
          fetch("/api/stats"),
          fetch("/api/settings"),
        ]);

      if (uploadsRes.ok) {
        const u = await uploadsRes.json();
        setTodayData(u);
        setPktDateStr(u.date);
      }
      if (personasRes.ok) {
        const p = await personasRes.json();
        setPersonas(p);
      }
      if (gmailRes.ok) {
        const g = await gmailRes.json();
        setGmailAccounts(g);
      }
      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s);
      }
      if (settingsRes.ok) {
        const st = await settingsRes.json();
        setSettings(st);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Determine PKT day of week
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Karachi",
      weekday: "short",
    });
    const dayStr = formatter.format(new Date());
    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    setPktDayOfWeek(dayMap[dayStr] ?? 1);
  }, [fetchData]);

  const activePersonaName =
    todayData?.todayUpload?.persona?.name ||
    todayData?.scheduledPersona?.name;

  const isAllCompleted =
    Boolean(todayData?.todayUpload?.allCompleted) ||
    (Boolean(todayData?.todayUpload?.youtubeDone) &&
      Boolean(todayData?.todayUpload?.instaDone) &&
      Boolean(todayData?.todayUpload?.tiktokDone) &&
      Boolean(todayData?.todayUpload?.facebookDone));

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeBrandName={activePersonaName}
        isAllCompleted={isAllCompleted}
        streakCount={stats?.currentStreak || 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-spin">
              <RefreshCw className="w-5 h-5" />
            </div>
            <p className="text-sm text-neutral-400 font-medium">
              Synchronizing CreatorOps Hub pipeline...
            </p>
          </div>
        ) : (
          <div>
            {activeTab === "mission" && (
              <MissionTab
                todayUpload={todayData?.todayUpload || null}
                scheduledPersona={todayData?.scheduledPersona || null}
                currentDateStr={pktDateStr}
                onRefresh={fetchData}
              />
            )}

            {activeTab === "rotation" && (
              <RotationTab
                personas={personas}
                gmailAccounts={gmailAccounts}
                currentPKTDayOfWeek={pktDayOfWeek}
                onRefresh={fetchData}
              />
            )}

            {activeTab === "gmail" && (
              <GmailVaultTab
                gmailAccounts={gmailAccounts}
                onRefresh={fetchData}
              />
            )}

            {activeTab === "history" && (
              <HistoryTab stats={stats} onRefresh={fetchData} />
            )}

            {activeTab === "settings" && (
              <SettingsTab settings={settings} onRefresh={fetchData} />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-[#181c28] bg-[#0b0d14] py-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-neutral-400">
            <span>CreatorOps Hub</span>
            <span>•</span>
            <span className="text-emerald-400">Asia/Karachi UTC+5</span>
          </div>
          <span>
            CallMeBot WhatsApp Rotation & Content Operations Dashboard
          </span>
        </div>
      </footer>
    </div>
  );
}
