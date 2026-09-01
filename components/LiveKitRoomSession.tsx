"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { AlertCircle, Loader2 } from "lucide-react";
import CustomRoomLayout from "@/components/CustomRoomLayout";

interface LiveKitRoomSessionProps {
  roomId: string;
  livekitUrl: string;
  onDisconnected: () => void;
}

export default function LiveKitRoomSession({
  roomId,
  livekitUrl,
  onDisconnected,
}: LiveKitRoomSessionProps) {
  const [participantName] = useState(
    () => `Membro_${Math.floor(Math.random() * 100)}`
  );
  const [token, setToken] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchToken() {
      try {
        setConnectionError(null);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
        const response = await fetch(
          `${apiUrl}/token?roomName=${encodeURIComponent(roomId)}&participantName=${encodeURIComponent(participantName)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Falha ao obter token (${response.status})`);
        }

        const data = (await response.json()) as { token: string };
        setToken(data.token);
      } catch (error) {
        if (controller.signal.aborted) return;
        setConnectionError(
          error instanceof Error ? error.message : "Erro ao conectar na sala"
        );
      }
    }

    fetchToken();

    return () => controller.abort();
  }, [roomId, participantName]);

  if (connectionError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#13131b]">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-semibold mb-1">Falha na conexão</p>
          <p className="text-sm text-[#908fa0]">{connectionError}</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#13131b]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#6366f1] animate-spin" />
          <p className="text-[#c7c4d7] font-medium">Conectando...</p>
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
      key={token}
      video
      audio
      token={token}
      serverUrl={livekitUrl}
      connect
      data-lk-theme="default"
      className="flex-1 min-h-0 h-full"
      onDisconnected={onDisconnected}
    >
      <CustomRoomLayout />
    </LiveKitRoom>
  );
}
