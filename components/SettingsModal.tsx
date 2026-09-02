"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import {
  X,
  Mic,
  Video,
  Shield,
  Sparkles,
  Check,
  Languages,
  User,
  ImageIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useHasMounted } from "@/hooks/useHasMounted";
import {
  generateDicebearAvatar,
  getUserProfile,
  setUserProfile,
} from "@/lib/userStorage";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isVideoOn: boolean;
  onToggleVideo: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
}: SettingsModalProps) {
  const { t, language, setLanguage } = useI18n();
  const profile = useUserProfile();
  const mounted = useHasMounted();
  const [activeTab, setActiveTab] = useState<"voice" | "video" | "language" | "stitch" | "profile">("voice");
  const [inputVolume, setInputVolume] = useState(85);
  const [outputVolume, setOutputVolume] = useState(100);
  const [krispEnabled, setKrispEnabled] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState("1080p60");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!isOpen || activeTab !== "profile") return;
    const stored = getUserProfile();
    setUsername(stored?.username ?? "");
    setAvatarUrl(stored?.avatarUrl ?? "");
    setProfileError(null);
    setProfileSaved(false);
  }, [isOpen, activeTab, profile?.username, profile?.avatarUrl]);

  const previewAvatar = useMemo(() => {
    const seed = username.trim() || "guest";
    return avatarUrl.trim() || generateDicebearAvatar(seed);
  }, [username, avatarUrl]);

  const handleProfileSave = (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = username.trim();
    if (!trimmedName) {
      setProfileError(t.onboarding.usernameRequired);
      return;
    }

    setUserProfile({
      username: trimmedName,
      avatarUrl: avatarUrl.trim() || generateDicebearAvatar(trimmedName),
    });

    setProfileError(null);
    setProfileSaved(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#1b1b23] border border-[#292932] rounded-3xl max-w-2xl w-full h-[520px] shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Settings Sidebar */}
        <div className="w-48 bg-[#13131b] p-4 flex flex-col gap-1 border-r border-[#292932] shrink-0">
          <span className="text-[10px] font-bold text-[#908fa0] uppercase tracking-wider px-2 mb-2">
            {t.settings.title}
          </span>

          <button
            onClick={() => setActiveTab("voice")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
              activeTab === "voice"
                ? "bg-[#292932] text-white border border-[#34343d]"
                : "text-[#c7c4d7] hover:bg-[#1f1f27] hover:text-white"
            }`}
          >
            <Mic className="w-4 h-4 text-indigo-400" />
            <span>{t.settings.voiceAudio}</span>
          </button>

          <button
            onClick={() => setActiveTab("video")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
              activeTab === "video"
                ? "bg-[#292932] text-white border border-[#34343d]"
                : "text-[#c7c4d7] hover:bg-[#1f1f27] hover:text-white"
            }`}
          >
            <Video className="w-4 h-4 text-emerald-400" />
            <span>{t.settings.videoStream}</span>
          </button>

          <button
            onClick={() => setActiveTab("language")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
              activeTab === "language"
                ? "bg-[#292932] text-white border border-[#34343d]"
                : "text-[#c7c4d7] hover:bg-[#1f1f27] hover:text-white"
            }`}
          >
            <Languages className="w-4 h-4 text-cyan-400" />
            <span>{t.settings.languageTab}</span>
          </button>

          <button
            onClick={() => setActiveTab("stitch")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
              activeTab === "stitch"
                ? "bg-[#292932] text-white border border-[#34343d]"
                : "text-[#c7c4d7] hover:bg-[#1f1f27] hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.settings.stitchDesign}</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
              activeTab === "profile"
                ? "bg-[#292932] text-white border border-[#34343d]"
                : "text-[#c7c4d7] hover:bg-[#1f1f27] hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>{t.settings.userProfile}</span>
          </button>

          <div className="mt-auto pt-4 border-t border-[#292932]">
            <span className="text-[10px] text-[#908fa0] px-2 block">
              StreamSync Engine v2.4
            </span>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-[#c7c4d7] hover:bg-[#292932] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tab: Idioma / Language */}
          {activeTab === "language" && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-white">{t.settings.selectLanguage}</h3>
                <p className="text-xs text-[#908fa0]">
                  O idioma base do navegador é detectado automaticamente.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div
                  onClick={() => setLanguage("pt")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    language === "pt"
                      ? "bg-[#292932] border-[#6366f1] text-white ring-1 ring-[#6366f1]"
                      : "bg-[#13131b] border-[#292932] text-[#c7c4d7] hover:bg-[#22222d]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇧🇷</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{t.settings.portuguese}</span>
                      <span className="text-[11px] text-[#908fa0]">Português nativo</span>
                    </div>
                  </div>
                  {language === "pt" && <Check className="w-5 h-5 text-[#6366f1]" />}
                </div>

                <div
                  onClick={() => setLanguage("en")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    language === "en"
                      ? "bg-[#292932] border-[#6366f1] text-white ring-1 ring-[#6366f1]"
                      : "bg-[#13131b] border-[#292932] text-[#c7c4d7] hover:bg-[#22222d]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇺🇸</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{t.settings.english}</span>
                      <span className="text-[11px] text-[#908fa0]">English interface</span>
                    </div>
                  </div>
                  {language === "en" && <Check className="w-5 h-5 text-[#6366f1]" />}
                </div>
              </div>
            </div>
          )}

          {activeTab === "voice" && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-white">{t.settings.voiceAudio}</h3>
                <p className="text-xs text-[#908fa0]">
                  Configure your microphone and speaker devices.
                </p>
              </div>

              {/* Volume Sliders */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-[#c7c4d7]">
                    <span>{t.settings.inputVolume}</span>
                    <span className="font-mono text-indigo-400">{inputVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={inputVolume}
                    onChange={(e) => setInputVolume(Number(e.target.value))}
                    className="w-full accent-[#6366f1] h-2 bg-[#292932] rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-[#c7c4d7]">
                    <span>{t.settings.outputVolume}</span>
                    <span className="font-mono text-indigo-400">{outputVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={outputVolume}
                    onChange={(e) => setOutputVolume(Number(e.target.value))}
                    className="w-full accent-[#6366f1] h-2 bg-[#292932] rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Krisp Noise Suppression */}
              <div className="flex items-center justify-between p-3.5 bg-[#13131b] rounded-2xl border border-[#292932]">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">
                      {t.settings.krispTitle}
                    </span>
                    <span className="text-[10px] text-[#908fa0]">
                      {t.settings.krispDesc}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setKrispEnabled(!krispEnabled)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${
                    krispEnabled ? "bg-emerald-600" : "bg-[#292932]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      krispEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === "video" && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-base font-bold text-white">{t.settings.videoStream}</h3>
                <p className="text-xs text-[#908fa0]">
                  Set resolution and framerate for streams and camera.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#c7c4d7]">
                  {t.settings.resolutionPreset}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "1080p60", label: "1080p @ 60 FPS", desc: "Ultra Crisp HD" },
                    { id: "720p60", label: "720p @ 60 FPS", desc: "Smooth Gaming" },
                    { id: "720p30", label: "720p @ 30 FPS", desc: "Balanced" },
                    { id: "480p30", label: "480p @ 30 FPS", desc: "Low Bandwidth" },
                  ].map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedQuality(preset.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col ${
                        selectedQuality === preset.id
                          ? "bg-[#292932] border-[#6366f1] text-white"
                          : "bg-[#13131b] border-transparent text-[#c7c4d7] hover:bg-[#22222d]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{preset.label}</span>
                        {selectedQuality === preset.id && (
                          <Check className="w-3.5 h-3.5 text-[#6366f1]" />
                        )}
                      </div>
                      <span className="text-[10px] text-[#908fa0] mt-0.5">
                        {preset.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "stitch" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-white">{t.settings.stitchDesign}</h3>
                <p className="text-xs text-[#908fa0]">
                  Connected to project: StreamSync Video Hub (`projects/7329526585811402395`)
                </p>
              </div>

              <div className="p-4 bg-[#13131b] rounded-2xl border border-[#292932] flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#908fa0]">Design System</span>
                  <span className="font-semibold text-indigo-400">Kinetic Dark / Obsidian</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#908fa0]">Primary Accent</span>
                  <span className="font-mono text-[#c0c1ff]">#6366f1 / #8083ff</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#908fa0]">Background Tokens</span>
                  <span className="font-mono text-[#adc6ff]">#13131b / #1b1b23</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#908fa0]">MCP Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Live &amp; Synced
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-white">{t.settings.userProfile}</h3>
                <p className="text-xs text-[#908fa0]">{t.settings.profileDesc}</p>
              </div>

              <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 bg-[#13131b] rounded-2xl border border-[#292932]">
                  <img
                    src={
                      mounted && profile
                        ? previewAvatar
                        : generateDicebearAvatar("guest")
                    }
                    alt={username || t.settings.userProfile}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#6366f1] shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-bold text-white truncate">
                      {mounted && profile ? profile.username : t.settings.noProfile}
                    </span>
                    <span className="text-xs text-[#908fa0] truncate">
                      {mounted && profile?.avatarUrl
                        ? profile.avatarUrl
                        : t.onboarding.avatarHint}
                    </span>
                    <span className="text-[11px] text-emerald-400 mt-1">
                      ● {t.common.online}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="settings-username"
                    className="text-xs font-semibold text-[#c7c4d7] uppercase tracking-wide flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    {t.onboarding.username}
                  </label>
                  <input
                    id="settings-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (profileError) setProfileError(null);
                      setProfileSaved(false);
                    }}
                    placeholder={t.onboarding.usernamePlaceholder}
                    maxLength={32}
                    autoComplete="username"
                    className="w-full px-4 py-3 rounded-xl bg-[#13131b] border border-[#292932] text-white placeholder:text-[#5c5b6b] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                  {profileError && (
                    <p className="text-xs text-red-400">{profileError}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="settings-avatar"
                    className="text-xs font-semibold text-[#c7c4d7] uppercase tracking-wide flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    {t.onboarding.avatarUrl}
                    <span className="text-[#908fa0] font-normal normal-case">
                      ({t.onboarding.optional})
                    </span>
                  </label>
                  <input
                    id="settings-avatar"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setProfileSaved(false);
                    }}
                    placeholder={t.onboarding.avatarPlaceholder}
                    className="w-full px-4 py-3 rounded-xl bg-[#13131b] border border-[#292932] text-white placeholder:text-[#5c5b6b] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                  <p className="text-[11px] text-[#908fa0]">{t.onboarding.avatarHint}</p>
                </div>

                <button
                  type="submit"
                  className="self-start px-5 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-white font-semibold text-sm flex items-center gap-2 transition-all"
                >
                  {profileSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t.settings.profileSaved}
                    </>
                  ) : (
                    t.settings.saveProfile
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
