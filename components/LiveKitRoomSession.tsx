"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { consumeIntentionalDisconnect } from "@/lib/roomEvents";

const MAX_RECONNECT_ATTEMPTS = 5;

interface LiveKitRoomSessionProps {
  roomId: string;
  livekitUrl: string;
  participantName: string;
  audio?: boolean;
  video?: boolean;
  onDisconnected: () => void;
  children?: ReactNode;
}

export default function LiveKitRoomSession({
  roomId,
  livekitUrl,
  participantName,
  audio = true,
  video = false,
  onDisconnected,
  children,
}: LiveKitRoomSessionProps) {
  const { t } = useI18n();
  const [token, setToken] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchToken = useCallback(async (signal?: AbortSignal) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const response = await fetch(
      `${apiUrl}/token?roomName=${encodeURIComponent(roomId)}&participantName=${encodeURIComponent(participantName)}`,
      { signal }
    );

    if (!response.ok) {
      throw new Error(`Falha ao obter token (${response.status})`);
    }

    const data = (await response.json()) as { token: string };
    return data.token;
  }, [participantName, roomId]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setConnectionError(null);
        const nextToken = await fetchToken(controller.signal);
        setToken(nextToken);
      } catch (error) {
        if (controller.signal.aborted) return;
        setConnectionError(
          error instanceof Error ? error.message : "Erro ao conectar na sala"
        );
      }
    }

    void load();
    return () => {
      controller.abort();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [fetchToken, reconnectAttempt]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
      setGaveUp(true);
      return;
    }

    const next = reconnectAttempt + 1;
    const delay = Math.min(1000 * 2 ** reconnectAttempt, 8000);
    retryTimerRef.current = setTimeout(() => {
      setToken(null);
      setGaveUp(false);
      setReconnectAttempt(next);
    }, delay);
  }, [reconnectAttempt]);

  const handleDisconnected = () => {
    if (consumeIntentionalDisconnect()) {
      onDisconnected();
      return;
    }
    scheduleReconnect();
  };

  if (gaveUp) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#13131b] min-h-0">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-semibold mb-1">{t.call.reconnectFailed}</p>
          <p className="text-sm text-[#908fa0] mb-4">{t.call.connectionLost}</p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setGaveUp(false);
                setReconnectAttempt((n) => n + 1);
                setToken(null);
              }}
              className="px-4 py-2 rounded-xl bg-[#6366f1] text-white text-sm font-semibold"
            >
              {t.call.retry}
            </button>
            <button
              type="button"
              onClick={onDisconnected}
              className="px-4 py-2 rounded-xl bg-[#292932] text-[#c7c4d7] text-sm"
            >
              {t.call.backHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (connectionError && !token) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#13131b] min-h-0">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-semibold mb-1">Falha na conexão</p>
          <p className="text-sm text-[#908fa0] mb-4">{connectionError}</p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setConnectionError(null);
                setReconnectAttempt((n) => n + 1);
              }}
              className="px-4 py-2 rounded-xl bg-[#6366f1] text-white text-sm font-semibold"
            >
              {t.call.retry}
            </button>
            <button
              type="button"
              onClick={onDisconnected}
              className="px-4 py-2 rounded-xl bg-[#292932] text-[#c7c4d7] text-sm"
            >
              {t.call.backHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#13131b] min-h-0">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#6366f1] animate-spin" />
          <p className="text-[#c7c4d7] font-medium">
            {reconnectAttempt > 0 ? t.call.reconnecting : "Conectando..."}
          </p>
          {reconnectAttempt > 0 && (
            <p className="text-xs text-[#908fa0]">
              {t.call.reconnectAttempt
                .replace("{n}", String(reconnectAttempt))
                .replace("{max}", String(MAX_RECONNECT_ATTEMPTS))}
            </p>
          )}
          <p className="text-xs text-[#908fa0]">
            Entrando como{" "}
            <span className="text-indigo-300">{participantName}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      key={`${roomId}-${token}`}
      video={video}
      audio={audio}
      token={token}
      serverUrl={livekitUrl}
      connect
      connectOptions={{ autoSubscribe: true }}
      data-lk-theme="default"
      className="flex-1 min-h-0 h-full w-full relative flex flex-col"
      onDisconnected={handleDisconnected}
    >
      {children}
    </LiveKitRoom>
  );
}
