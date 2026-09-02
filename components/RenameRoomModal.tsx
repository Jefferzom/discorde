"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface RenameRoomModalProps {
  open: boolean;
  initialName: string;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function RenameRoomModal({
  open,
  initialName,
  saving = false,
  error,
  onClose,
  onSave,
}: RenameRoomModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave(name.trim());
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#1b1b23] border border-[#292932] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">{t.rooms.renameTitle}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#908fa0] hover:text-white hover:bg-[#292932]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="room-name" className="text-xs font-semibold text-[#c7c4d7]">
              {t.rooms.roomName}
            </label>
            <input
              id="room-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={64}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-[#13131b] border border-[#292932] text-white placeholder:text-[#5c5b6b] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-[#c7c4d7] hover:bg-[#292932]"
            >
              {t.modal.cancel}
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#6366f1] hover:bg-[#5558e3] text-white disabled:opacity-50"
            >
              {t.rooms.saveName}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
