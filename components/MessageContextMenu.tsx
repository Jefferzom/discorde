"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";

interface MessageContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function MessageContextMenu({
  x,
  y,
  onEdit,
  onDelete,
  onClose,
}: MessageContextMenuProps) {
  const { t } = useI18n();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[80] cursor-default"
        aria-label={t.modal.cancel}
        onClick={onClose}
      />
      <div
        className="fixed z-[81] min-w-[180px] bg-[#13131b] border border-[#34343d] rounded-xl p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
        style={{ left: x, top: y }}
        role="menu"
      >
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#c7c4d7] hover:bg-[#292932] hover:text-white transition-colors text-left"
        >
          <Pencil className="w-4 h-4 text-indigo-400" />
          {t.chat.editMessage}
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
        >
          <Trash2 className="w-4 h-4" />
          {t.chat.deleteMessage}
        </button>
      </div>
    </>
  );
}
