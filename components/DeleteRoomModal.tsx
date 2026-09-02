"use client";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface DeleteRoomModalProps {
  open: boolean;
  roomName: string;
  deleting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteRoomModal({
  open,
  roomName,
  deleting = false,
  error,
  onClose,
  onConfirm,
}: DeleteRoomModalProps) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#1b1b23] border border-[#292932] rounded-2xl shadow-2xl p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.rooms.deleteTitle}</h3>
              <p className="text-xs text-[#908fa0] mt-0.5">{t.rooms.deleteDesc}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="p-1 rounded-lg text-[#908fa0] hover:text-white hover:bg-[#292932] disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-xl bg-[#13131b] border border-[#292932] px-4 py-3 mb-4">
          <p className="text-sm text-[#c7c4d7] truncate font-medium">{roomName}</p>
        </div>

        {error && <p className="text-xs text-red-400 mb-4">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-sm text-[#c7c4d7] hover:bg-[#292932] disabled:opacity-50"
          >
            {t.modal.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {t.rooms.deleteConfirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
