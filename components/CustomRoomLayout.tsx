"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  RoomAudioRenderer,
  TrackToggle,
  VideoTrack,
  isTrackReference,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import type { TrackReference } from "@livekit/components-core";
import { Maximize2, Minimize2, Monitor, PhoneOff, Pin, ScreenShare } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { clearIntentionalRoomNavigation } from "@/lib/roomEvents";
import { useRouter } from "next/navigation";
import CameraPiPOverlay from "@/components/CameraPiPOverlay";
import MediaDeviceSelector from "@/components/MediaDeviceSelector";
import ParticipantVideoTile, {
  StageLayoutToggle,
} from "@/components/ParticipantVideoTile";

const toggleBtnClass =
  "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 shadow-md border-0 cursor-pointer data-[lk-enabled=true]:bg-[#1f1f27] data-[lk-enabled=true]:text-white data-[lk-enabled=true]:hover:bg-[#34343d] data-[lk-enabled=false]:bg-red-500/20 data-[lk-enabled=false]:text-red-400 data-[lk-enabled=false]:border data-[lk-enabled=false]:border-red-500/30 data-[lk-enabled=false]:hover:bg-red-500/30";

function trackKey(track: TrackReference): string {
  return `${track.participant.identity}-${track.source}-${track.publication?.trackSid ?? "none"}`;
}

function getActiveScreenShares(screenShares: TrackReference[]) {
  const valid = screenShares.filter((track) => Boolean(track.publication?.track));

  const remote = valid.filter((track) => !track.participant.isLocal);
  const local = valid.find((track) => track.participant.isLocal);

  const spotlight = remote[0] ?? local;
  const secondary = valid.filter((track) => track !== spotlight);

  return { spotlight, secondary };
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
  const [layoutMode, setLayoutMode] = useState<"spotlight" | "split">("spotlight");
  const [pipHidden, setPipHidden] = useState(false);
  const [shareStageFocus, setShareStageFocus] = useState<"screen" | "camera">("screen");
  const [focusedTrackKey, setFocusedTrackKey] = useState<string | null>(null);
  const [isStageFullscreen, setIsStageFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const allTracks = useTracks(
    [Track.Source.Camera, Track.Source.ScreenShare, Track.Source.ScreenShareAudio],
    { onlySubscribed: true, updateOnlyOn: [] }
  );

  const screenShareTracks = allTracks.filter(
    (track): track is TrackReference =>
      isTrackReference(track) && track.source === Track.Source.ScreenShare
  );

  const { spotlight: activeScreenShare, secondary: secondaryScreenShares } =
    getActiveScreenShares(screenShareTracks);

  const cameraTracks = allTracks.filter(
    (track): track is TrackReference =>
      isTrackReference(track) && track.source === Track.Source.Camera
  );

  const sharerCamera = useMemo(() => {
    if (!activeScreenShare) return undefined;
    return findCameraForParticipant(
      cameraTracks,
      activeScreenShare.participant.identity
    );
  }, [activeScreenShare, cameraTracks]);

  const showPip =
    layoutMode === "spotlight" &&
    shareStageFocus === "screen" &&
    activeScreenShare &&
    hasActiveCamera(sharerCamera) &&
    !pipHidden;

  const filmstripTracks = useMemo(() => {
    if (
      activeScreenShare &&
      shareStageFocus === "camera" &&
      sharerCamera &&
      hasActiveCamera(sharerCamera)
    ) {
      const cameras = cameraTracks.filter(
        (track) => track.participant.identity !== sharerCamera.participant.identity
      );
      return [activeScreenShare, ...secondaryScreenShares, ...cameras];
    }

    const excludeSharerCamFromStrip =
      showPip && sharerCamera && hasActiveCamera(sharerCamera);

    const excludeIdentity = excludeSharerCamFromStrip
      ? sharerCamera.participant.identity
      : layoutMode === "split" &&
          activeScreenShare &&
          shareStageFocus === "screen"
        ? activeScreenShare.participant.identity
        : null;

    const cameras = cameraTracks.filter(
      (track) => !excludeIdentity || track.participant.identity !== excludeIdentity
    );

    return [...secondaryScreenShares, ...cameras];
  }, [
    cameraTracks,
    secondaryScreenShares,
    showPip,
    sharerCamera,
    layoutMode,
    activeScreenShare,
    shareStageFocus,
  ]);

  const focusedTrack = useMemo(() => {
    if (!focusedTrackKey) return null;
    const fromFilmstrip = filmstripTracks.find((t) => trackKey(t) === focusedTrackKey);
    if (fromFilmstrip) return fromFilmstrip;
    if (sharerCamera && trackKey(sharerCamera) === focusedTrackKey) return sharerCamera;
    return cameraTracks.find((t) => trackKey(t) === focusedTrackKey) ?? null;
  }, [focusedTrackKey, filmstripTracks, sharerCamera, cameraTracks]);

  useEffect(() => {
    if (activeScreenShare) return;

    if (filmstripTracks.length === 0) {
      setFocusedTrackKey(null);
      return;
    }

    const stillValid = focusedTrackKey
      ? filmstripTracks.some((track) => trackKey(track) === focusedTrackKey)
      : false;

    if (!stillValid) {
      const firstCamera = filmstripTracks.find(
        (track) => track.source === Track.Source.Camera
      );
      setFocusedTrackKey(trackKey(firstCamera ?? filmstripTracks[0]));
    }
  }, [activeScreenShare, filmstripTracks, focusedTrackKey]);

  const sharerName =
    activeScreenShare?.participant.name ||
    activeScreenShare?.participant.identity ||
    "";

  useEffect(() => {
    setPipHidden(false);
    setShareStageFocus("screen");
  }, [activeScreenShare?.participant.identity]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsStageFullscreen(document.fullscreenElement === stageRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (activeScreenShare) return;

    if (document.fullscreenElement === stageRef.current) {
      void document.exitFullscreen();
    }
    setIsStageFullscreen(false);
  }, [activeScreenShare]);

  const showScreenFullscreen =
    Boolean(activeScreenShare) && shareStageFocus === "screen";

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

  const handleLeaveRoom = async () => {
    clearIntentionalRoomNavigation();
    await room.disconnect(true);
    router.push("/");
  };

  const renderStageContent = () => {
    if (activeScreenShare) {
      if (
        shareStageFocus === "camera" &&
        sharerCamera &&
        hasActiveCamera(sharerCamera)
      ) {
        return (
          <div className="absolute inset-0 p-2">
            <ParticipantVideoTile
              trackRef={sharerCamera}
              name={sharerName}
              isYou={sharerCamera.participant.isLocal}
              youLabel={t.common.you}
              variant="stage"
              popOutLabel={t.stage.popOut}
              isFocused
              focusLabel={t.stage.spotlight}
              badge={t.stage.sharerCamera}
            />
          </div>
        );
      }

      if (
        layoutMode === "split" &&
        shareStageFocus === "screen" &&
        sharerCamera &&
        hasActiveCamera(sharerCamera)
      ) {
        return (
          <div className="absolute inset-0 flex flex-col sm:flex-row gap-2 p-2">
            <div className="flex-1 min-h-0 min-w-0 relative rounded-xl overflow-hidden bg-black border border-[#292932]">
              <VideoTrack
                trackRef={activeScreenShare}
                className={`absolute inset-0 w-full h-full bg-black ${
                  isStageFullscreen ? "object-cover" : "object-contain"
                }`}
              />
            <div className="absolute top-3 left-3 bg-[#13131b]/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-semibold text-white border border-white/10 z-10">
                {sharerName} — {t.stage.screenStream}
              </div>
            </div>
            <div className="w-full sm:w-[38%] min-h-[140px] sm:min-h-0 shrink-0 relative rounded-xl overflow-hidden border border-indigo-500/30">
              <ParticipantVideoTile
                trackRef={sharerCamera}
                name={sharerName}
                variant="split"
                popOutLabel={t.stage.popOut}
                badge={t.stage.sharerCamera}
                onFocus={() => setShareStageFocus("camera")}
                focusLabel={t.stage.focusCamera}
              />
            </div>
          </div>
        );
      }

      return (
        <>
              <VideoTrack
                trackRef={activeScreenShare}
                className={`absolute inset-0 w-full h-full bg-black ${
                  isStageFullscreen ? "object-cover" : "object-contain"
                }`}
              />
          {showPip && sharerCamera && (
            <CameraPiPOverlay
              trackRef={sharerCamera}
              name={sharerName}
              onClose={() => setPipHidden(true)}
              onSpotlight={() => setShareStageFocus("camera")}
              popOutLabel={t.stage.popOut}
              closeLabel={t.stage.hidePip}
              spotlightLabel={t.stage.focusCamera}
            />
          )}
        </>
      );
    }

    if (focusedTrack) {
      const name =
        focusedTrack.participant.name || focusedTrack.participant.identity;

      return (
        <div className="absolute inset-0 p-2">
          <ParticipantVideoTile
            trackRef={focusedTrack}
            name={name}
            isYou={focusedTrack.participant.isLocal}
            youLabel={t.common.you}
            variant="stage"
            popOutLabel={t.stage.popOut}
            isFocused
            focusLabel={t.stage.spotlight}
            sharingLabel={
              focusedTrack.source === Track.Source.ScreenShare
                ? t.common.sharing
                : undefined
            }
          />
        </div>
      );
    }

    return (
      <div className="absolute inset-0 bg-[#0d0e15] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#1b1b23] border border-[#292932] flex items-center justify-center">
          <Monitor className="w-8 h-8 text-[#6366f1]/60" />
        </div>
        <p className="text-sm text-[#908fa0]">{t.stage.readyToShareDesc}</p>
      </div>
    );
  };

  return (
    <div className="relative flex flex-1 flex-col gap-3 min-h-0 h-full p-4 pb-20 bg-[#0d0d15]">
      <RoomAudioRenderer />

      <div
        ref={stageRef}
        className={`flex-1 min-h-0 bg-[#1b1b23] relative overflow-hidden flex flex-col shadow-2xl border border-[#292932] ${
          isStageFullscreen ? "rounded-none border-0" : "rounded-2xl"
        }`}
      >
        {renderStageContent()}

        {activeScreenShare && (
          <>
            <div className="absolute top-4 left-4 bg-[#13131b]/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg z-10">
              <Pin className="w-3.5 h-3.5 text-[#6366f1]" />
              <span className="text-xs font-semibold text-white">
                {sharerName} —{" "}
                {shareStageFocus === "camera" && hasActiveCamera(sharerCamera)
                  ? t.stage.sharerCamera
                  : t.stage.screenStream}
              </span>
            </div>
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
              {showScreenFullscreen && (
                <button
                  type="button"
                  onClick={() => void toggleStageFullscreen()}
                  className="p-2 rounded-xl bg-[#13131b]/90 backdrop-blur-md border border-white/10 text-[#c7c4d7] hover:text-white hover:bg-[#292932] transition-colors shadow-lg"
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
              <StageLayoutToggle
                mode={layoutMode}
                onChange={(mode) => {
                  setLayoutMode(mode);
                  if (mode === "spotlight") {
                    setPipHidden(false);
                    setShareStageFocus("screen");
                  }
                }}
                splitLabel={t.stage.splitView}
                spotlightLabel={t.stage.spotlightView}
              />
            </div>
          </>
        )}

        {!activeScreenShare && focusedTrack && (
          <div className="absolute top-4 left-4 bg-[#13131b]/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg z-10">
            <Pin className="w-3.5 h-3.5 text-[#6366f1]" />
            <span className="text-xs font-semibold text-white">
              {focusedTrack.participant.name || focusedTrack.participant.identity} —{" "}
              {t.stage.spotlight}
            </span>
          </div>
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

            const isMainScreenShare =
              activeScreenShare && trackRef === activeScreenShare;

            return (
              <ParticipantVideoTile
                key={key}
                trackRef={trackRef}
                name={name}
                isYou={trackRef.participant.isLocal}
                youLabel={t.common.you}
                sharingLabel={isScreenShare ? t.common.sharing : undefined}
                popOutLabel={t.stage.popOut}
                isFocused={
                  activeScreenShare
                    ? shareStageFocus === "camera" && isMainScreenShare
                    : focusedTrackKey === key
                }
                focusLabel={
                  activeScreenShare && isMainScreenShare
                    ? t.stage.focusScreen
                    : t.stage.spotlight
                }
                onFocus={() => {
                  if (!activeScreenShare) {
                    setFocusedTrackKey(key);
                    return;
                  }
                  if (shareStageFocus === "camera" && isMainScreenShare) {
                    setShareStageFocus("screen");
                    if (layoutMode === "spotlight") setPipHidden(false);
                  }
                }}
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

        <TrackToggle
          source={Track.Source.ScreenShare}
          showIcon={false}
          className="px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2 transition-all duration-150 shadow-lg border-0 cursor-pointer data-[lk-enabled=true]:bg-[#8083ff] data-[lk-enabled=true]:text-[#0d0096] data-[lk-enabled=true]:ring-2 data-[lk-enabled=true]:ring-indigo-400/40 data-[lk-enabled=false]:bg-[#1f1f27] data-[lk-enabled=false]:text-[#e4e1ed] data-[lk-enabled=false]:hover:bg-[#34343d]"
          title={t.controls.shareScreen}
        >
          <ScreenShare className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{t.controls.shareScreen}</span>
        </TrackToggle>

        <button
          type="button"
          onClick={handleLeaveRoom}
          className="w-11 h-11 rounded-full bg-[#93000a] text-white flex items-center justify-center hover:bg-red-600 transition-all duration-150 shadow-lg shadow-red-900/40 ml-1 border-0 cursor-pointer group"
          title={t.controls.disconnect}
        >
          <PhoneOff className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
}
