"use client";

import { useEffect, useRef, useState } from "react";
import {
  useMaybeRoomContext,
  useMediaDeviceSelect,
} from "@livekit/components-react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import {
  clearSavedMediaDeviceId,
  getSavedMediaDeviceId,
  setSavedMediaDeviceId,
  type MediaDeviceKind,
} from "@/lib/mediaDeviceStorage";

type DeviceKind = MediaDeviceKind;

interface MediaDeviceSelectorProps {
  kind: DeviceKind;
  variant?: "compact" | "field";
  dropUp?: boolean;
  className?: string;
}

export default function MediaDeviceSelector({
  kind,
  variant = "field",
  dropUp = true,
  className = "",
}: MediaDeviceSelectorProps) {
  const { t } = useI18n();
  const room = useMaybeRoomContext();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const restoredDeviceIdRef = useRef<string | null>(null);
  const lastDevicesKeyRef = useRef("");

  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({
    kind,
    requestPermissions: true,
  });

  useEffect(() => {
    if (devices.length === 0) return;

    const savedId = getSavedMediaDeviceId(kind);
    if (!savedId) return;

    const deviceExists = devices.some((device) => device.deviceId === savedId);
    if (!deviceExists) {
      clearSavedMediaDeviceId(kind);
      restoredDeviceIdRef.current = null;
      return;
    }

    const devicesKey = devices.map((device) => device.deviceId).join("|");
    const devicesChanged = devicesKey !== lastDevicesKeyRef.current;
    lastDevicesKeyRef.current = devicesKey;

    if (activeDeviceId === savedId) {
      restoredDeviceIdRef.current = savedId;
      return;
    }

    if (restoredDeviceIdRef.current === savedId && !devicesChanged && room) return;

    setActiveMediaDevice(savedId);
    restoredDeviceIdRef.current = savedId;
  }, [devices, kind, activeDeviceId, setActiveMediaDevice, room]);

  const selectDevice = (deviceId: string) => {
    setActiveMediaDevice(deviceId);
    setSavedMediaDeviceId(kind, deviceId);
    restoredDeviceIdRef.current = deviceId;
    setOpen(false);
  };

  const labels = {
    audioinput: {
      title: t.controls.selectMic,
      default: t.controls.defaultMic,
      empty: t.controls.noMicDevices,
      field: t.settings.inputDevice,
    },
    audiooutput: {
      title: t.controls.selectSpeaker,
      default: t.controls.defaultSpeaker,
      empty: t.controls.noSpeakerDevices,
      field: t.settings.outputDevice,
    },
  }[kind];

  const activeLabel =
    devices.find((d) => d.deviceId === activeDeviceId)?.label || labels.default;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuPosition = dropUp
    ? "bottom-full left-0 mb-2"
    : "top-full left-0 mt-2";

  const menu = open && (
    <div
      className={`absolute ${menuPosition} w-64 max-h-56 overflow-y-auto custom-scrollbar bg-[#13131b] border border-[#34343d] rounded-xl p-1 shadow-2xl z-[120]`}
    >
      <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#908fa0]">
        {labels.title}
      </p>
      {!room && (
        <p className="px-2 pb-1 text-[10px] text-amber-400/90">{t.settings.devicesInCallHint}</p>
      )}
      {devices.length === 0 ? (
        <p className="px-2 py-2 text-xs text-[#908fa0]">{labels.empty}</p>
      ) : (
        devices.map((device) => (
          <button
            key={device.deviceId}
            type="button"
            onClick={() => selectDevice(device.deviceId)}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs truncate transition-colors ${
              device.deviceId === activeDeviceId
                ? "bg-[#6366f1] text-white"
                : "text-[#c7c4d7] hover:bg-[#292932] hover:text-white"
            }`}
            title={device.label}
          >
            {device.label || labels.default}
          </button>
        ))
      )}
    </div>
  );

  if (variant === "compact") {
    return (
      <div ref={rootRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="p-1 rounded-lg text-[#908fa0] hover:text-white hover:bg-[#292932] transition-colors"
          title={labels.title}
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {menu}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-[#c7c4d7]">{labels.field}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#13131b] border border-[#292932] hover:border-[#6366f1]/40 text-left transition-colors"
      >
        <span className="text-sm text-white truncate">{activeLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#908fa0] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {menu}
    </div>
  );
}
