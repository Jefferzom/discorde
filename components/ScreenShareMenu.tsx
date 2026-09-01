"use client";

import React, { useState } from "react";
import { Monitor, AppWindow, Globe, ChevronDown } from "lucide-react";
import { ScreenShareMode } from "@/lib/screenShare";
import { useI18n } from "@/lib/i18n/context";

interface ScreenShareMenuProps {
  currentMode: ScreenShareMode;
  onChangeMode: (mode: ScreenShareMode) => void;
}

const MODES: { id: ScreenShareMode; icon: React.ReactNode }[] = [
  { id: "screen", icon: <Monitor className="w-4 h-4" /> },
  { id: "window", icon: <AppWindow className="w-4 h-4" /> },
  { id: "tab", icon: <Globe className="w-4 h-4" /> },
];

export default function ScreenShareMenu({
  currentMode,
  onChangeMode,
}: ScreenShareMenuProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const labels: Record<ScreenShareMode, string> = {
    screen: t.controls.shareEntireScreen,
    window: t.controls.shareWindow,
    tab: t.controls.shareTab,
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2.5 rounded-full font-semibold text-xs flex items-center gap-1.5 bg-[#6366f1]/30 text-indigo-100 hover:bg-[#6366f1]/50 border border-indigo-400/30 transition-all duration-150 shadow-md"
        title={t.controls.changeShareType}
      >
        {MODES.find((m) => m.id === currentMode)?.icon}
        <span className="hidden sm:inline max-w-[90px] truncate">
          {labels[currentMode]}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-14 left-0 bg-[#13131b]/95 backdrop-blur-xl border border-[#34343d] rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 w-52 animate-in fade-in zoom-in-95">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#908fa0]">
            {t.controls.shareType}
          </p>
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                onChangeMode(mode.id);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                currentMode === mode.id
                  ? "bg-[#6366f1]/20 text-indigo-200 border border-indigo-500/30"
                  : "text-[#c7c4d7] hover:bg-[#292932] hover:text-white"
              }`}
            >
              <span className="text-indigo-400">{mode.icon}</span>
              <span>{labels[mode.id]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
