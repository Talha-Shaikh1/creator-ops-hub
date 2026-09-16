"use client";

import { useState } from "react";
import {
  Settings,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  Clock,
  Key,
  Phone,
  Globe,
  ExternalLink,
  ShieldCheck,
  Zap,
  QrCode,
  Radio,
} from "lucide-react";

interface SystemSettings {
  id: string;
  provider?: string | null;
  whatsappPhone?: string | null;
  greenApiIdInstance?: string | null;
  greenApiApiToken?: string | null;
  callmebotApiKey?: string | null;
  cronSecret?: string | null;
  startHourPKT: number;
  endHourPKT: number;
  appUrl?: string | null;
}

interface SettingsTabProps {
  settings: SystemSettings | null;
  onRefresh: () => void;
}

export function SettingsTab({ settings, onRefresh }: SettingsTabProps) {
  const [provider, setProvider] = useState(settings?.provider || "greenapi");
  const [whatsappPhone, setWhatsappPhone] = useState(
    settings?.whatsappPhone || ""
  );
  const [greenApiIdInstance, setGreenApiIdInstance] = useState(
    settings?.greenApiIdInstance || ""
  );
  const [greenApiApiToken, setGreenApiApiToken] = useState(
    settings?.greenApiApiToken || ""
  );
  const [callmebotApiKey, setCallmebotApiKey] = useState(
    settings?.callmebotApiKey || ""
  );
  const [geminiApiKey, setGeminiApiKey] = useState(
    (settings as any)?.geminiApiKey || ""
  );
  const [cronSecret, setCronSecret] = useState(settings?.cronSecret || "");
  const [startHourPKT, setStartHourPKT] = useState(
    String(settings?.startHourPKT ?? 14)
  );
  const [endHourPKT, setEndHourPKT] = useState(
    String(settings?.endHourPKT ?? 23)
  );
  const [appUrl, setAppUrl] = useState(
    settings?.appUrl || "http://localhost:3000"
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [isSimulatingCron, setIsSimulatingCron] = useState(false);
  const [cronResult, setCronResult] = useState<string | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          whatsappPhone,
          greenApiIdInstance,
          greenApiApiToken,
          callmebotApiKey,
          geminiApiKey,
          cronSecret,
          startHourPKT,
          endHourPKT,
          appUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      setSaveStatus("Settings saved successfully!");
      onRefresh();
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      setSaveStatus("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestMessage = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          phone: whatsappPhone,
          greenApiIdInstance,
          greenApiApiToken,
          callmebotApiKey,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || "Test WhatsApp message sent successfully!",
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Failed to send WhatsApp test message.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        message: msg,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSimulateCron = async () => {
    setIsSimulatingCron(true);
    setCronResult(null);
    try {
      const res = await fetch("/api/cron/remind?force=true", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cronSecret}`,
        },
      });

      const data = await res.json();
      setCronResult(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCronResult(JSON.stringify({ error: msg }, null, 2));
    } finally {
      setIsSimulatingCron(false);
    }
  };

  const curlCommand = `curl -X POST "${appUrl || "http://localhost:3000"}/api/cron/remind" \\
  -H "Authorization: Bearer ${cronSecret}"`;

  const githubActionYaml = `name: Hourly WhatsApp CreatorOps Reminder
on:
  schedule:
    # Runs every hour at minute 0
    - cron: '0 * * * *'
  workflow_dispatch:

jobs:
  remind:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger CreatorOps Reminder
        run: |
          curl -s -X POST "${appUrl || "https://your-domain.com"}/api/cron/remind" \\
            -H "Authorization: Bearer \${{ secrets.CRON_SECRET }}"`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>System Settings & WhatsApp Automation</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Configure Green-API / CallMeBot, recipient WhatsApp number, and hourly PKT notification window
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Form & 1-Click WhatsApp Test */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-[#1e2333] bg-[#10121a] p-5 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Provider Configuration</span>
            </h3>

            {/* Provider Switcher */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setProvider("greenapi")}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  provider === "greenapi"
                    ? "bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-500/10 text-emerald-300"
                    : "bg-[#141724] border-[#22283a] text-neutral-400 hover:border-neutral-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Green-API (QR Link)</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                    100% Reliable
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Scan QR from your WhatsApp. Free cloud instance.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setProvider("callmebot")}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  provider === "callmebot"
                    ? "bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-500/10 text-emerald-300"
                    : "bg-[#141724] border-[#22283a] text-neutral-400 hover:border-neutral-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-indigo-400" />
                    <span>CallMeBot (HTTP)</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                    Public Bot
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Uses Spanish WhatsApp bot (+34).
                </span>
              </button>
            </div>

            {/* Provider-Specific Setup Instructions */}
            {provider === "greenapi" ? (
              <div className="text-xs text-neutral-300 mb-5 bg-[#141724] p-3.5 rounded-xl border border-[#23293c] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400 block">
                    How to get Green-API Instance in 1 minute (Free):
                  </span>
                  <a
                    href="https://green-api.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>green-api.com</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <ol className="text-neutral-400 space-y-1 list-decimal list-inside text-xs">
                  <li>Create free account on <strong className="text-neutral-200">green-api.com</strong>.</li>
                  <li>Click <strong className="text-neutral-200">&quot;Create Instance&quot;</strong> (Free Developer Tier).</li>
                  <li>Scan the screen&apos;s <strong className="text-neutral-200">QR Code</strong> with your mobile WhatsApp (Linked Devices).</li>
                  <li>Copy your <code className="text-emerald-300 font-mono">idInstance</code> and <code className="text-emerald-300 font-mono">apiTokenInstance</code> and paste below.</li>
                </ol>
              </div>
            ) : (
              <div className="text-xs text-neutral-300 mb-5 bg-[#141724] p-3.5 rounded-xl border border-[#23293c] space-y-2">
                <span className="font-semibold text-emerald-400 block">
                  CallMeBot Setup Links:
                </span>
                <p className="text-neutral-400">
                  Send message <code className="text-emerald-300">I allow callmebot to send me messages</code> to:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="https://wa.me/34623786449?text=I%20allow%20callmebot%20to%20send%20me%20messages"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold"
                  >
                    <span>Bot 1 (+34 623 786 449)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://wa.me/34644263377?text=I%20allow%20callmebot%20to%20send%20me%20messages"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a2030] hover:bg-[#232b40] border border-[#2d3752] text-neutral-200 text-xs font-medium"
                  >
                    <span>Bot 2 (+34 644 263 377)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Recipient Phone */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Alert Recipient WhatsApp Phone (Pakistan: 923001234567)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="923001234567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#141724] border border-[#242b3d] text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Green-API Fields */}
              {provider === "greenapi" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Green-API Instance ID (`idInstance`)
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={greenApiIdInstance}
                        onChange={(e) => setGreenApiIdInstance(e.target.value)}
                        placeholder="e.g. 1101823456"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#141724] border border-[#242b3d] text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      API Token (`apiTokenInstance`)
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={greenApiApiToken}
                        onChange={(e) => setGreenApiApiToken(e.target.value)}
                        placeholder="e.g. e4f7b2c9..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#141724] border border-[#242b3d] text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CallMeBot Field */}
              {provider === "callmebot" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    CallMeBot WhatsApp API Key
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={callmebotApiKey}
                      onChange={(e) => setCallmebotApiKey(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#141724] border border-[#242b3d] text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Gemini API Key */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/30 to-purple-950/20 border border-indigo-500/30">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Google Gemini AI API Key (AI Content Studio)
                  </label>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    Optional / Pro
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mb-2">
                  Powers dynamic AI script generation, viral hooks, and SEO descriptions in the AI Content Studio. (If empty, smart built-in engine is used).
                </p>
                <div className="relative">
                  <Key className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#10121d] border border-[#252c42] text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Cron Secret */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Cron Secret Key (`CRON_SECRET`)
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={cronSecret}
                    onChange={(e) => setCronSecret(e.target.value)}
                    placeholder="creatorops_super_secret_cron_token_2025"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#141724] border border-[#242b3d] text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* PKT Reminder Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    PKT Reminder Start Hour (24H)
                  </label>
                  <select
                    value={startHourPKT}
                    onChange={(e) => setStartHourPKT(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#141724] border border-[#242b3d] text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
                  >
                    {[...Array(24)].map((_, i) => (
                      <option key={i} value={i} className="bg-[#11131c]">
                        {i}:00 ({i >= 12 ? `${i === 12 ? 12 : i - 12}:00 PM` : `${i}:00 AM`} PKT)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    PKT Reminder End Hour (24H)
                  </label>
                  <select
                    value={endHourPKT}
                    onChange={(e) => setEndHourPKT(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#141724] border border-[#242b3d] text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
                  >
                    {[...Array(24)].map((_, i) => (
                      <option key={i} value={i} className="bg-[#11131c]">
                        {i}:00 ({i >= 12 ? `${i === 12 ? 12 : i - 12}:00 PM` : `${i}:00 AM`} PKT)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Public App URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Public App URL (Used in WhatsApp Alert Link)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    placeholder="https://creator-ops.vercel.app or http://localhost:3000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#141724] border border-[#242b3d] text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#1c2130] flex items-center justify-between">
                <span className="text-xs">
                  {saveStatus && (
                    <span className="text-emerald-400 font-semibold">
                      {saveStatus}
                    </span>
                  )}
                </span>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving..." : "Save Settings"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* WhatsApp Test Dispatcher Card */}
          <div className="rounded-2xl border border-[#1e2333] bg-[#10121a] p-5 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-400" />
              <span>Instant WhatsApp Test Dispatcher</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Trigger a live WhatsApp message right now to confirm credentials are working.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSendTestMessage}
                disabled={isTesting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-neutral-950 text-xs font-bold transition-all hover:from-teal-400 hover:to-emerald-500 shadow-md shadow-teal-500/20 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{isTesting ? "Sending WhatsApp..." : "Send Test WhatsApp Message"}</span>
              </button>

              <button
                onClick={handleSimulateCron}
                disabled={isSimulatingCron}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181d2c] hover:bg-[#23293e] border border-[#2b344d] text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{isSimulatingCron ? "Executing..." : "Simulate Hourly Cron Engine"}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`mt-4 p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                  testResult.success
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/40 border-red-500/40 text-red-300"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {cronResult && (
              <div className="mt-4">
                <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                  Cron Engine Response:
                </span>
                <pre className="p-3 rounded-lg bg-[#141724] border border-[#232a3d] text-[11px] font-mono text-emerald-300 overflow-x-auto">
                  {cronResult}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right: External Cron Setup Guides */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[#1e2333] bg-[#10121a] p-5 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>External Cron Setup Guide</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              CreatorOps checks uploads every hour between 2:00 PM and 11:00 PM PKT. Hook it up to any free cron runner:
            </p>

            {/* Cron-job.org Guide */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#141724] border border-[#242b3d]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">
                    1. Cron-job.org (Free & Zero-Config)
                  </span>
                  <a
                    href="https://cron-job.org"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>cron-job.org</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
                  <li>Schedule: <code className="text-neutral-200">Every 60 minutes</code></li>
                  <li>
                    URL:{" "}
                    <code className="text-emerald-300 break-all">
                      {appUrl || "https://your-domain.com"}/api/cron/remind
                    </code>
                  </li>
                  <li>Request Method: <strong className="text-neutral-200">POST</strong> or <strong className="text-neutral-200">GET</strong></li>
                  <li>
                    Header:{" "}
                    <code className="text-neutral-300">
                      Authorization: Bearer {cronSecret}
                    </code>
                  </li>
                </ul>
              </div>

              {/* cURL Command Box */}
              <div className="p-3.5 rounded-xl bg-[#141724] border border-[#242b3d]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">
                    2. Ready-to-Run cURL Command
                  </span>
                  <button
                    onClick={() => handleCopy(curlCommand, "curl")}
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === "curl" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-[#0e1017] border border-[#1b1f2e] text-[10px] font-mono text-neutral-300 overflow-x-auto">
                  {curlCommand}
                </pre>
              </div>

              {/* GitHub Actions YAML Box */}
              <div className="p-3.5 rounded-xl bg-[#141724] border border-[#242b3d]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">
                    3. GitHub Actions (`.github/workflows/remind.yml`)
                  </span>
                  <button
                    onClick={() => handleCopy(githubActionYaml, "gh")}
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === "gh" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-[#0e1017] border border-[#1b1f2e] text-[10px] font-mono text-neutral-300 overflow-x-auto max-h-48">
                  {githubActionYaml}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
