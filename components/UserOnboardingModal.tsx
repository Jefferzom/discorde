"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ImageIcon, Sparkles, User } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import {
  generateDicebearAvatar,
  getUserProfile,
  setUserProfile,
} from "@/lib/userStorage";

interface UserOnboardingModalProps {
  open: boolean;
  onComplete?: () => void;
}

export default function UserOnboardingModal({
  open,
  onComplete,
}: UserOnboardingModalProps) {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const profile = getUserProfile();
    setUsername(profile?.username ?? "");
    setAvatarUrl(profile?.avatarUrl ?? "");
    setError(null);
  }, [open]);

  const previewAvatar = useMemo(() => {
    const seed = username.trim() || "guest";
    return avatarUrl.trim() || generateDicebearAvatar(seed);
  }, [username, avatarUrl]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = username.trim();
    if (!trimmedName) {
      setError(t.onboarding.usernameRequired);
      return;
    }

    setUserProfile({
      username: trimmedName,
      avatarUrl: avatarUrl.trim() || generateDicebearAvatar(trimmedName),
    });

    onComplete?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="max-w-md w-full bg-[#1b1b23] border border-[#292932] rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-lg shadow-indigo-900/30 mb-4 bg-[#13131b]">
            <img
              src={previewAvatar}
              alt={t.onboarding.avatarPreview}
              className="w-full h-full object-cover"
            />
          </div>
          <h2
            id="onboarding-title"
            className="text-xl font-bold text-white"
          >
            {t.onboarding.title}
          </h2>
          <p className="text-sm text-[#908fa0] mt-1">{t.onboarding.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="onboarding-username"
              className="text-xs font-semibold text-[#c7c4d7] uppercase tracking-wide flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              {t.onboarding.username}
              <span className="text-red-400">*</span>
            </label>
            <input
              id="onboarding-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t.onboarding.usernamePlaceholder}
              maxLength={32}
              autoComplete="username"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-[#13131b] border border-[#292932] text-white placeholder:text-[#5c5b6b] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="onboarding-avatar"
              className="text-xs font-semibold text-[#c7c4d7] uppercase tracking-wide flex items-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              {t.onboarding.avatarUrl}
              <span className="text-[#908fa0] font-normal normal-case">
                ({t.onboarding.optional})
              </span>
            </label>
            <input
              id="onboarding-avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder={t.onboarding.avatarPlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-[#13131b] border border-[#292932] text-white placeholder:text-[#5c5b6b] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
            <p className="text-[11px] text-[#908fa0]">{t.onboarding.avatarHint}</p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4" />
            {t.onboarding.continue}
          </button>
        </form>
      </div>
    </div>
  );
}
