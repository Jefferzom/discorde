"use client";

import { Circle, Moon, MinusCircle, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { usePresenceStatus } from "@/hooks/usePresenceStatus";
import {
  presenceDotClass,
  setPresenceStatus,
  type PresenceStatus,
} from "@/lib/presenceStorage";

const OPTIONS: PresenceStatus[] = ["online", "idle", "dnd", "invisible"];

export default function PresenceStatusPicker() {
  const { t } = useI18n();
  const status = usePresenceStatus();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const labels: Record<PresenceStatus, string> = {
    online: t.presence.online,
    idle: t.presence.idle,
    dnd: t.presence.dnd,
    invisible: t.presence.invisible,
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="text-[10px] text-[#908fa0] truncate hover:text-white transition-colors text-left max-w-full"
        title={t.presence.setStatus}
      >
        {labels[status]}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-44 bg-[#13131b] border border-[#34343d] rounded-xl p-1 shadow-2xl z-[130]">
          {OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPresenceStatus(option);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left transition-colors ${
                status === option
                  ? "bg-[#292932] text-white"
                  : "text-[#c7c4d7] hover:bg-[#292932] hover:text-white"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${presenceDotClass(option)}`}
              />
              {labels[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PresenceDot({ className = "" }: { className?: string }) {
  const status = usePresenceStatus();
  return (
    <span
      className={`rounded-full border-2 border-[#13131b] ${presenceDotClass(status)} ${className}`}
    />
  );
}

export function PresenceStatusIcon({ status }: { status: PresenceStatus }) {
  if (status === "idle") return <Moon className="w-3.5 h-3.5 text-amber-400" />;
  if (status === "dnd") return <MinusCircle className="w-3.5 h-3.5 text-red-400" />;
  if (status === "invisible") return <EyeOff className="w-3.5 h-3.5 text-[#908fa0]" />;
  return <Circle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />;
}
