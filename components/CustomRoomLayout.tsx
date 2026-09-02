"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RoomAudioRenderer,
  TrackToggle,
  VideoTrack,
  isTrackReference,
  useConnectionState,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import type { TrackReference } from "@livekit/components-core";
import {
  Maximize2,
  Minimize2,
  Monitor,
  Pause,
  PhoneOff,
  PictureInPicture2,
  Pin,
  Play,
  ScreenShare,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { clearIntentionalRoomNavigation, markIntentionalDisconnect } from "@/lib/roomEvents";
import { getLeaveWarning, type LeaveWarning } from "@/lib/leaveCall";
import LeaveCallModal from "@/components/LeaveCallModal";
import { useRouter } from "next/navigation";
import CameraPiPOverlay from "@/components/CameraPiPOverlay";
import MediaDeviceSelector from "@/components/MediaDeviceSelector";
import ScreenShareMenu from "@/components/ScreenShareMenu";
import ParticipantVideoTile, {
  StageLayoutToggle,
} from "@/components/ParticipantVideoTile";
import RemoteVolumeControl from "@/components/RemoteVolumeControl";
import CallStatsHud from "@/components/CallStatsHud";
import { useLiveKitScreenShare } from "@/hooks/useLiveKitScreenShare";
import { useLocalTrackEffects } from "@/hooks/useLocalTrackEffects";
import { usePictureInPicture } from "@/hooks/usePictureInPicture";
import { useMediaPreferences } from "@/hooks/useMediaPreferences";
import { setMediaPreferences } from "@/lib/mediaPreferences";
import { popOutFromTrackRef } from "@/lib/popOutVideo";

const toggleBtnClass =
  "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 shadow-md border-0 cursor-pointer data-[lk-enabled=true]:bg-[#1f1f27] data-[lk-enabled=true]:text-white data-[lk-enabled=true]:hover:bg-[#34343d] data-[lk-enabled=false]:bg-red-500/20 data-[lk-enabled=false]:text-red-400 data-[lk-enabled=false]:border data-[lk-enabled=false]:border-red-500/30 data-[lk-enabled=false]:hover:bg-red-500/30";

const stageIconBtnClass =
  "p-2 rounded-xl bg-[#13131b]/90 backdrop-blur-md border border-white/10 text-[#c7c4d7] hover:text-white hover:bg-[#292932] transition-colors shadow-lg";

function trackKey(track: TrackReference): string {
  return `${track.participant.identity}-${track.source}-${track.publication?.trackSid ?? "none"}`;
}

function findCameraForParticipant(
  cameraTracks: TrackReference[],
  participantIdentity: string
) {
  return cameraTracks.find(
    (track) =>
      isTrackReference(track) &&
      track.participant.identity === participantIdentity &&
      track.source === Track.Source.Camera &&
      track.publication &&
      !track.publication.isMuted
  );
}

function hasActiveCamera(track?: TrackReference) {
  return Boolean(track?.publication && !track.publication.isMuted);
}

export default function CustomRoomLayout() {
  const { t } = useI18n();
  const router = useRouter();
  const room = useRoomContext();
  const mediaPrefs = useMediaPreferences();
  useLocalTrackEffects();
  const screenShare = useLiveKitScreenShare();
  const [layoutMode, setLayoutMode] = useState<"spotlight" | "split">("spotlight");
  const [pipHidden, setPipHidden] = useState(false);
  const [focusedTrackKey, setFocusedTrackKey] = useState<string | null>(null);
  const [isStageFullscreen, setIsStageFullscreen] = useState(false);
  const [leaveWarning, setLeaveWarning] = useState<LeaveWarning | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageShareRef = useRef<HTMLDivElement>(null);
  const connectionState = useConnectionState();

  const allTracks = useTracks(
    [Track.Source.Camera, Track.Source.ScreenShare, Track.Source.ScreenShareAudio],
    { onlySubscribed: true, updateOnlyOn: [] }
  );

  const screenShareTracks = useMemo(
    () =>
      allTracks.filter(
        (track): track is TrackReference =>
          isTrackReference(track) &&
          track.source === Track.Source.ScreenShare &&
          Boolean(track.publication?.track)
      ),
    [allTracks]
  );

  const cameraTracks = useMemo(
    () =>
      allTracks.filter(
        (track): track is TrackReference =>
          isTrackReference(track) && track.source === Track.Source.Camera
      ),
    [allTracks]
  );

  const shareAudioIdentities = useMemo(
    () =>
      new Set(
        allTracks
          .filter(
            (track) =>
              isTrackReference(track) &&
              track.source === Track.Source.ScreenShareAudio
          )
          .map((track) => track.participant.identity)
      ),
    [allTracks]
  );

  /** Compartilhamento que assume o palco por padrão: remoto tem prioridade sobre o local */
  const defaultScreenShare = useMemo(
    () =>
      screenShareTracks.find((track) => !track.participant.isLocal) ??
      screenShareTracks[0],
    [screenShareTracks]
  );

  /** Um novo compartilhamento assume o palco automaticamente */
  const currentShareIdentity = defaultScreenShare?.participant.identity ?? null;
  const [lastShareIdentity, setLastShareIdentity] = useState(currentShareIdentity);

  if (lastShareIdentity !== currentShareIdentity) {
    setLastShareIdentity(currentShareIdentity);
    setFocusedTrackKey(null);
    setPipHidden(false);
  }

  /** Tudo que pode ir para o palco: telas e câmeras */
  const stageCandidates = useMemo(
    () => [...screenShareTracks, ...cameraTracks],
    [screenShareTracks, cameraTracks]
  );

  const focusedTrack = useMemo(() => {
    if (!focusedTrackKey) return null;
    return stageCandidates.find((track) => trackKey(track) === focusedTrackKey) ?? null;
  }, [focusedTrackKey, stageCandidates]);

  const stageTrack = useMemo(() => {
    if (focusedTrack) return focusedTrack;
    if (defaultScreenShare) return defaultScreenShare;
    return cameraTracks.find(hasActiveCamera) ?? cameraTracks[0] ?? null;
  }, [focusedTrack, defaultScreenShare, cameraTracks]);

  const isStageScreenShare = stageTrack?.source === Track.Source.ScreenShare;

  const sharerCamera = useMemo(() => {
    if (!stageTrack || !isStageScreenShare) return undefined;
    return findCameraForParticipant(cameraTracks, stageTrack.participant.identity);
  }, [stageTrack, isStageScreenShare, cameraTracks]);

  const showPip =
    layoutMode === "spotlight" &&
    isStageScreenShare &&
    hasActiveCamera(sharerCamera) &&
    !pipHidden;

  const showSplitCamera =
    layoutMode === "split" && isStageScreenShare && hasActiveCamera(sharerCamera);

  const filmstripTracks = useMemo(() => {
    const hiddenKeys = new Set<string>();
    if (stageTrack) hiddenKeys.add(trackKey(stageTrack));
    if ((showPip || showSplitCamera) && sharerCamera) {
      hiddenKeys.add(trackKey(sharerCamera));
    }
    return stageCandidates.filter((track) => !hiddenKeys.has(trackKey(track)));
  }, [stageCandidates, stageTrack, sharerCamera, showPip, showSplitCamera]);

  const stageName = stageTrack
    ? stageTrack.participant.name || stageTrack.participant.identity
    : "";

  const stageShareHasAudio = Boolean(
    stageTrack &&
      isStageScreenShare &&
      !stageTrack.participant.isLocal &&
      shareAudioIdentities.has(stageTrack.participant.identity)
  );

  const handleStagePiPFallback = useCallback(() => {
    if (stageTrack) popOutFromTrackRef(stageTrack, stageName);
  }, [stageTrack, stageName]);

  const { isPiPActive: isStagePiPActive, togglePiP: toggleStagePiP } =
    usePictureInPicture(stageShareRef, handleStagePiPFallback);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsStageFullscreen(document.fullscreenElement === stageRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (isStageScreenShare) return;

    if (document.fullscreenElement === stageRef.current) {
      void document.exitFullscreen();
    }
  }, [isStageScreenShare]);

  const toggleStageFullscreen = async () => {
    if (!stageRef.current) return;

    try {
      if (document.fullscreenElement === stageRef.current) {
        await document.exitFullscreen();
      } else {
        await stageRef.current.requestFullscreen();
      }
    } catch {
      // Browser blocked fullscreen — ignore
    }
  };

  const confirmLeaveRoom = async () => {
    setLeaveWarning(null);
    markIntentionalDisconnect();
    clearIntentionalRoomNavigation();
    await room.disconnect(true);
    router.push("/");
  };

  const handleLeaveRoom = async () => {
    const warning = getLeaveWarning(room);
    if (warning) {
      setLeaveWarning(warning);
      return;
    }
    await confirmLeaveRoom();
  };

  const renderStageContent = () => {
    if (!stageTrack) {
      return (
        <div className="absolute inset-0 bg-[#0d0e15] flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1b1b23] border border-[#292932] flex items-center justify-center">
            <Monitor className="w-8 h-8 text-[#6366f1]/60" />
          </div>
          <p className="text-sm text-[#908fa0]">{t.stage.readyToShareDesc}</p>
        </div>
      );
    }

    if (!isStageScreenShare) {
      return (
        <div className="absolute inset-0 p-2">
          <ParticipantVideoTile
            trackRef={stageTrack}
            name={stageName}
            isYou={stageTrack.participant.isLocal}
            youLabel={t.common.you}
            variant="stage"
            popOutLabel={t.stage.popOut}
            volumeLabel={t.stage.userVolume}
            isFocused
            focusLabel={t.stage.spotlight}
          />
        </div>
      );
    }

    if (showSplitCamera && sharerCamera) {
      return (
        <div className="absolute inset-0 flex flex-col sm:flex-row gap-2 p-2">
          <div
            ref={stageShareRef}
            className="flex-1 min-h-0 min-w-0 relative rounded-xl overflow-hidden bg-black border border-[#292932]"
          >
            <VideoTrack
              trackRef={stageTrack}
              className={`absolute inset-0 w-full h-full bg-black ${
                isStageFullscreen ? "object-cover" : "object-contain"
              }`}
            />
            <div className="absolute top-3 left-3 bg-[#13131b]/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-semibold text-white border border-white/10 z-10">
              {stageName} — {t.stage.screenStream}
            </div>
          </div>
          <div className="w-full sm:w-[38%] min-h-[140px] sm:min-h-0 shrink-0 relative rounded-xl overflow-hidden border border-indigo-500/30">
            <ParticipantVideoTile
              trackRef={sharerCamera}
              name={stageName}
              isYou={sharerCamera.participant.isLocal}
              youLabel={t.common.you}
              variant="split"
              popOutLabel={t.stage.popOut}
              volumeLabel={t.stage.userVolume}
              badge={t.stage.sharerCamera}
              onFocus={() => setFocusedTrackKey(trackKey(sharerCamera))}
              focusLabel={t.stage.focusCamera}
            />
          </div>
        </div>
      );
    }

    return (
      <>
        <div ref={stageShareRef} className="absolute inset-0">
          <VideoTrack
            trackRef={stageTrack}
            className={`absolute inset-0 w-full h-full bg-black ${
              isStageFullscreen ? "object-cover" : "object-contain"
            }`}
          />
        </div>
        {showPip && sharerCamera && (
          <CameraPiPOverlay
            trackRef={sharerCamera}
            name={stageName}
            onClose={() => setPipHidden(true)}
            onSpotlight={() => setFocusedTrackKey(trackKey(sharerCamera))}
            popOutLabel={t.stage.popOut}
            closeLabel={t.stage.hidePip}
            spotlightLabel={t.stage.focusCamera}
          />
        )}
      </>
    );
  };

  return (
    <div className="relative flex flex-1 flex-col gap-3 min-h-0 h-full p-4 pb-20 bg-[#0d0d15]">
      <RoomAudioRenderer />

      {connectionState === ConnectionState.Reconnecting && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          {t.call.connectionLost} · {t.call.reconnecting}
        </div>
      )}

      <div
        ref={stageRef}
        className={`flex-1 min-h-0 bg-[#1b1b23] relative overflow-hidden flex flex-col shadow-2xl border border-[#292932] ${
          isStageFullscreen ? "rounded-none border-0" : "rounded-2xl"
        }`}
      >
        {renderStageContent()}

        <CallStatsHud />

        {isStageScreenShare &&
          screenShare.isPaused &&
          stageTrack?.participant.isLocal && (
            <div className="absolute inset-0 z-[15] flex items-center justify-center bg-black/35 pointer-events-none">
              <div className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold">
                {t.call.sharePaused}
              </div>
            </div>
          )}

        {stageTrack && (
          <>
            <div className="absolute top-4 left-4 bg-[#13131b]/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg z-10">
              <Pin className="w-3.5 h-3.5 text-[#6366f1]" />
              <span className="text-xs font-semibold text-white">
                {stageName} —{" "}
                {isStageScreenShare ? t.stage.screenStream : t.stage.spotlight}
              </span>
            </div>

            <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
              {stageShareHasAudio && stageTrack && (
                <RemoteVolumeControl
                  participant={stageTrack.participant}
                  source={Track.Source.ScreenShareAudio}
                  sliderLabel={t.stage.shareVolume}
                  variant="overlay"
                />
              )}

              {isStageScreenShare && (
                <button
                  type="button"
                  onClick={() => void toggleStagePiP()}
                  className={`${stageIconBtnClass} ${
                    isStagePiPActive ? "!bg-indigo-500/80 !text-white" : ""
                  }`}
                  title={
                    isStagePiPActive ? t.stage.exitPictureInPicture : t.stage.popOut
                  }
                >
                  <PictureInPicture2 className="w-4 h-4" />
                </button>
              )}

              {isStageScreenShare && (
                <button
                  type="button"
                  onClick={() => void toggleStageFullscreen()}
                  className={stageIconBtnClass}
                  title={
                    isStageFullscreen ? t.stage.exitFullscreen : t.stage.fullscreen
                  }
                >
                  {isStageFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              )}

              {isStageScreenShare && hasActiveCamera(sharerCamera) && (
                <StageLayoutToggle
                  mode={layoutMode}
                  onChange={(mode) => {
                    setLayoutMode(mode);
                    if (mode === "spotlight") setPipHidden(false);
                  }}
                  splitLabel={t.stage.splitView}
                  spotlightLabel={t.stage.spotlightView}
                />
              )}
            </div>
          </>
        )}
      </div>

      <div className="h-32 sm:h-36 shrink-0 flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
        {filmstripTracks.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-[#908fa0] border border-dashed border-[#292932] rounded-2xl">
            Aguardando participantes...
          </div>
        ) : (
          filmstripTracks.map((trackRef) => {
            const name =
              trackRef.participant.name || trackRef.participant.identity;
            const isScreenShare = trackRef.source === Track.Source.ScreenShare;
            const key = trackKey(trackRef);

            return (
              <ParticipantVideoTile
                key={key}
                trackRef={trackRef}
                name={name}
                isYou={trackRef.participant.isLocal}
                youLabel={t.common.you}
                sharingLabel={isScreenShare ? t.common.sharing : undefined}
                popOutLabel={t.stage.popOut}
                volumeLabel={t.stage.userVolume}
                isFocused={focusedTrackKey === key}
                focusLabel={
                  isScreenShare ? t.stage.focusScreen : t.stage.spotlight
                }
                onFocus={() => setFocusedTrackKey(key)}
              />
            );
          })
        )}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#292932]/95 backdrop-blur-xl px-5 py-2.5 rounded-full flex items-center gap-3 shadow-[0_20px_35px_-5px_rgba(0,0,0,0.6)] border border-white/10 z-40">
        <TrackToggle
          source={Track.Source.Camera}
          showIcon
          className={toggleBtnClass}
          title={t.controls.turnOnCamera}
        />

        <div className="flex items-center gap-1">
          <TrackToggle
            source={Track.Source.Microphone}
            showIcon
            className={toggleBtnClass}
            title={t.controls.unmuteMicrophone}
          />
          <MediaDeviceSelector kind="audioinput" variant="compact" dropUp />
        </div>

        <div className="w-px h-6 bg-[#464554]/60 mx-0.5" />

        <button
          type="button"
          onClick={() =>
            setMediaPreferences({ backgroundBlur: !mediaPrefs.backgroundBlur })
          }
          className={`${toggleBtnClass} ${
            mediaPrefs.backgroundBlur ? "!bg-emerald-600 !text-white" : ""
          }`}
          title={t.call.backgroundBlur}
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void screenShare.toggleShare()}
            disabled={screenShare.busy}
            className={`px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2 transition-all duration-150 shadow-lg border-0 cursor-pointer ${
              screenShare.isScreenShareEnabled
                ? "bg-[#8083ff] text-[#0d0096] ring-2 ring-indigo-400/40"
                : "bg-[#1f1f27] text-[#e4e1ed] hover:bg-[#34343d]"
            }`}
            title={
              screenShare.isScreenShareEnabled
                ? t.controls.stopSharing
                : t.controls.shareScreen
            }
          >
            <ScreenShare className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">
              {screenShare.isScreenShareEnabled
                ? t.controls.stopSharing
                : t.controls.shareScreen}
            </span>
          </button>
          <ScreenShareMenu
            compact
            currentMode={screenShare.mode}
            onChangeMode={(mode) => void screenShare.changeMode(mode)}
          />
          {screenShare.isScreenShareEnabled && (
            <button
              type="button"
              onClick={() => void screenShare.togglePause()}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                screenShare.isPaused
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-[#1f1f27] text-[#e4e1ed] hover:bg-[#34343d]"
              }`}
              title={
                screenShare.isPaused ? t.call.resumeShare : t.call.pauseShare
              }
            >
              {screenShare.isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleLeaveRoom}
          className="w-11 h-11 rounded-full bg-[#93000a] text-white flex items-center justify-center hover:bg-red-600 transition-all duration-150 shadow-lg shadow-red-900/40 ml-1 border-0 cursor-pointer group"
          title={t.controls.disconnect}
        >
          <PhoneOff className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {leaveWarning && (
        <LeaveCallModal
          warning={leaveWarning}
          onStay={() => setLeaveWarning(null)}
          onConfirm={() => void confirmLeaveRoom()}
        />
      )}
    </div>
  );
}
