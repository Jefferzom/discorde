"use client";

import { PhoneOff } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { LeaveWarning } from "@/lib/leaveCall";

interface LeaveCallModalProps {
  warning: LeaveWarning;
  onStay: () => void;
  onConfirm: () => void;
}

export default function LeaveCallModal({
  warning,
  onStay,
  onConfirm,
}: LeaveCallModalProps) {
  const { t } = useI18n();

  const description =
    warning === "sharing-alone"
      ? t.call.leaveSharingAlone
      : warning === "sharing"
        ? t.call.leaveSharing
        : t.call.leaveAlone;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#1b1b23] border border-[#292932] rounded-2xl shadow-2xl p-6">
        <h3 className="text-base font-bold text-white mb-2">{t.call.leaveTitle}</h3>
        <p className="text-sm text-[#c7c4d7] leading-relaxed mb-5">{description}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onStay}
            className="px-4 py-2 rounded-xl text-sm text-[#c7c4d7] hover:bg-[#292932]"
          >
            {t.call.stay}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            {t.call.leaveConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
