"use client";

import { useState } from "react";
import {
  Radio,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Bot,
  Laptop,
} from "lucide-react";
import {
  YouTubeIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
} from "./SocialIcons";
import { PersonaModal, PersonaFormData } from "./PersonaModal";

interface Persona {
  id: string;
  name: string;
  assignedDay: number | null;
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
  gmailAccountId?: string | null;
  gmailAccount?: {
    id: string;
    email: string;
    subscription: string;
    browserProfile?: string | null;
  } | null;
}

interface GmailAccount {
  id: string;
  email: string;
  subscription: string;
  browserProfile?: string | null;
}

interface RotationTabProps {
  personas: Persona[];
  gmailAccounts: GmailAccount[];
  currentPKTDayOfWeek: number;
  onRefresh: () => void;
}

export function RotationTab({
  personas,
  gmailAccounts,
  currentPKTDayOfWeek,
  onRefresh,
}: RotationTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<PersonaFormData | null>(
    null
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const daysOfWeek = [
    { day: 1, name: "Monday", short: "Mon" },
    { day: 2, name: "Tuesday", short: "Tue" },
    { day: 3, name: "Wednesday", short: "Wed" },
    { day: 4, name: "Thursday", short: "Thu" },
    { day: 5, name: "Friday", short: "Fri" },
    { day: 6, name: "Saturday", short: "Sat" },
    { day: 0, name: "Sunday", short: "Sun" },
  ];

  const handleEdit = (p: Persona) => {
    setEditingPersona({
      id: p.id,
      name: p.name,
      assignedDay: p.assignedDay,
      gmailAccountId: p.gmailAccountId,
      niche: p.niche || "",
      language: p.language || "English",
      targetAudience: p.targetAudience || "",
      visualStyle: p.visualStyle || "",
      framePrompt: p.framePrompt || "",
      masterVideoPrompt: p.masterVideoPrompt || "",
      weeklyReelsTarget: p.weeklyReelsTarget || 3,
      weeklyFeedTarget: p.weeklyFeedTarget || 4,
      dailyStoriesTarget: p.dailyStoriesTarget || 5,
      youtubeHandle: p.youtubeHandle || "",
      youtubeUrl: p.youtubeUrl || "",
      instaHandle: p.instaHandle || "",
      instaUrl: p.instaUrl || "",
      tiktokHandle: p.tiktokHandle || "",
      tiktokUrl: p.tiktokUrl || "",
      facebookHandle: p.facebookHandle || "",
      facebookUrl: p.facebookUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPersona(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/personas/${id}`, {
        method: "DELETE",
      });
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete persona", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            <span>Daily Persona Rotation Engine</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Automatic day-of-week rotation schedule and multi-channel pipeline
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Persona</span>
        </button>
      </div>

      {/* 7-Day Visual Rotation Schedule */}
      <div className="rounded-2xl border border-[#1e2333] bg-[#10121a] p-5 sm:p-6 shadow-md">
        <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>7-Day Rotation Schedule</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {daysOfWeek.map(({ day, name, short }) => {
            const assigned = personas.filter((p) => p.assignedDay === day);
            const isToday = currentPKTDayOfWeek === day;

            return (
              <div
                key={day}
                className={`rounded-xl border p-3 flex flex-col justify-between transition-all min-h-[110px] ${
                  isToday
                    ? "bg-emerald-950/30 border-emerald-500/50 shadow-sm"
                    : "bg-[#141724] border-[#22283a]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-neutral-200">
                      {short}
                    </span>
                    {isToday && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-500 block mb-2">
                    {name}
                  </span>
                </div>

                <div>
                  {assigned.length > 0 ? (
                    <div className="space-y-1">
                      {assigned.map((p) => (
                        <div
                          key={p.id}
                          className="px-2 py-1 rounded bg-[#1b2031] border border-[#2b334c] text-xs font-medium text-white truncate flex items-center justify-between"
                        >
                          <span className="truncate">@{p.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-neutral-600 italic">
                      No brand set
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personas Directory / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((p) => {
          const dayName =
            p.assignedDay !== null && p.assignedDay !== undefined
              ? daysOfWeek.find((d) => d.day === p.assignedDay)?.name || "Sunday"
              : "Standby";

          const isToday = currentPKTDayOfWeek === p.assignedDay;

          return (
            <div
              key={p.id}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                isToday
                  ? "bg-[#131624] border-emerald-500/40 shadow-sm"
                  : "bg-[#11131c] border-[#1e2333] hover:border-[#2b3248]"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                      <span>@{p.name}</span>
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-neutral-400 font-medium">
                        Assigned:{" "}
                        <strong
                          className={
                            isToday ? "text-emerald-400" : "text-neutral-300"
                          }
                        >
                          {dayName}
                        </strong>
                      </span>
                      {p.language && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                          {p.language}
                        </span>
                      )}
                    </div>
                    {p.niche && (
                      <p className="text-[11px] text-neutral-400 truncate max-w-xs mt-1">
                        {p.niche}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a1e2d] transition-colors cursor-pointer"
                      title="Edit Persona"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirmId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(p.id)}
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
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-[#1a1e2d] transition-colors cursor-pointer"
                        title="Delete Persona"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Linked Gmail badge */}
                {p.gmailAccount && (
                  <div className="flex items-center gap-1.5 my-3 px-2.5 py-1 rounded bg-[#161a28] border border-[#242c40] text-xs text-neutral-300">
                    <Bot className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-300 font-medium">
                      {p.gmailAccount.subscription}
                    </span>
                    <span className="text-neutral-500">•</span>
                    <span className="truncate text-neutral-400">
                      {p.gmailAccount.email}
                    </span>
                    {p.gmailAccount.browserProfile && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                        {p.gmailAccount.browserProfile}
                      </span>
                    )}
                  </div>
                )}

                {/* Social Channel Links */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#1d2232]">
                  {/* YouTube */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <YouTubeIcon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    {p.youtubeUrl ? (
                      <a
                        href={p.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-neutral-300 hover:text-red-400 transition-colors"
                      >
                        {p.youtubeHandle || "Channel"}
                      </a>
                    ) : (
                      <span className="text-neutral-600 italic">Not set</span>
                    )}
                  </div>

                  {/* Instagram */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    {p.instaUrl ? (
                      <a
                        href={p.instaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-neutral-300 hover:text-pink-400 transition-colors"
                      >
                        {p.instaHandle || "Profile"}
                      </a>
                    ) : (
                      <span className="text-neutral-600 italic">Not set</span>
                    )}
                  </div>

                  {/* TikTok */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <TikTokIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    {p.tiktokUrl ? (
                      <a
                        href={p.tiktokUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-neutral-300 hover:text-cyan-400 transition-colors"
                      >
                        {p.tiktokHandle || "TikTok"}
                      </a>
                    ) : (
                      <span className="text-neutral-600 italic">Not set</span>
                    )}
                  </div>

                  {/* Facebook */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <FacebookIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    {p.facebookUrl ? (
                      <a
                        href={p.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-neutral-300 hover:text-blue-400 transition-colors"
                      >
                        {p.facebookHandle || "Page"}
                      </a>
                    ) : (
                      <span className="text-neutral-600 italic">Not set</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <PersonaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={onRefresh}
        personaToEdit={editingPersona}
        gmailAccounts={gmailAccounts}
      />
    </div>
  );
}
