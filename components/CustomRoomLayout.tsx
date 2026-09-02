"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DisconnectButton,
  RoomAudioRenderer,
  TrackToggle,
  VideoTrack,
  isTrackReference,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import type { TrackReference } from "@livekit/components-core";
import { Monitor, PhoneOff, Pin, ScreenShare } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import CameraPiPOverlay from "@/components/CameraPiPOverlay";
import ParticipantVideoTile, {
  StageLayoutToggle,
} from "@/components/ParticipantVideoTile";

const toggleBtnClass =
  "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 shadow-md border-0 cursor-pointer data-[lk-enabled=true]:bg-[#1f1f27] data-[lk-enabled=true]:text-white data-[lk-enabled=true]:hover:bg-[#34343d] data-[lk-enabled=false]:bg-red-500/20 data-[lk-enabled=false]:text-red-400 data-[lk-enabled=false]:border data-[lk-enabled=false]:border-red-500/30 data-[lk-enabled=false]:hover:bg-red-500/30";

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
      Boolean(track.publication?.track)
  );
}

export default function CustomRoomLayout() {
  const { t } = useI18n();
  const [layoutMode, setLayoutMode] = useState<"spotlight" | "split">("spotlight");
  const [pipHidden, setPipHidden] = useState(false);

  const allTracks = useTracks(
    [Track.Source.Camera, Track.Source.ScreenShare, Track.Source.ScreenShareAudio],
    { onlySubscribed: true }
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
    activeScreenShare &&
    sharerCamera &&
    !pipHidden;

  const filmstripTracks = useMemo(() => {
    const excludeIdentity =
      showPip && sharerCamera
        ? sharerCamera.participant.identity
        : layoutMode === "split" && activeScreenShare
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
  ]);

  const sharerName =
    activeScreenShare?.participant.name ||
    activeScreenShare?.participant.identity ||
    "";

  useEffect(() => {
    setPipHidden(false);
  }, [activeScreenShare?.participant.identity]);

  return (
    <div className="relative flex flex-1 flex-col gap-3 min-h-0 h-full p-4 pb-20 bg-[#0d0d15]">
      <RoomAudioRenderer />

      <div className="flex-1 min-h-0 bg-[#1b1b23] rounded-2xl relative overflow-hidden flex flex-col shadow-2xl border border-[#292932]">
        {activeScreenShare ? (
          layoutMode === "split" && sharerCamera ? (
            <div className="absolute inset-0 flex flex-col sm:flex-row gap-2 p-2">
              <div className="flex-1 min-h-0 min-w-0 relative rounded-xl overflow-hidden bg-black border border-[#292932]">
                <VideoTrack
                  trackRef={activeScreenShare}
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 bg-[#13131b]/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-semibold text-white border border-white/10">
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
                />
              </div>
            </div>
          ) : (
            <>
              <VideoTrack
                trackRef={activeScreenShare}
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
              {showPip && sharerCamera && (
                <CameraPiPOverlay
                  trackRef={sharerCamera}
                  name={sharerName}
                  onClose={() => setPipHidden(true)}
                  popOutLabel={t.stage.popOut}
                  closeLabel={t.stage.hidePip}
                />
              )}
            </>
          )
        ) : (
          <div className="absolute inset-0 bg-[#0d0e15] flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#1b1b23] border border-[#292932] flex items-center justify-center">
              <Monitor className="w-8 h-8 text-[#6366f1]/60" />
            </div>
            <p className="text-sm text-[#908fa0]">{t.stage.readyToShareDesc}</p>
          </div>
        )}

        {activeScreenShare && (
          <>
            <div className="absolute top-4 left-4 bg-[#13131b]/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg z-10">
              <Pin className="w-3.5 h-3.5 text-[#6366f1]" />
              <span className="text-xs font-semibold text-white">
                {sharerName} — {t.stage.screenStream}
              </span>
            </div>
            <StageLayoutToggle
              mode={layoutMode}
              onChange={(mode) => {
                setLayoutMode(mode);
                if (mode === "spotlight") setPipHidden(false);
              }}
              splitLabel={t.stage.splitView}
              spotlightLabel={t.stage.spotlightView}
            />
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

            return (
              <ParticipantVideoTile
                key={`${trackRef.participant.identity}-${trackRef.source}`}
                trackRef={trackRef}
                name={name}
                isYou={trackRef.participant.isLocal}
                youLabel={t.common.you}
                sharingLabel={isScreenShare ? t.common.sharing : undefined}
                popOutLabel={t.stage.popOut}
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

        <TrackToggle
          source={Track.Source.Microphone}
          showIcon
          className={toggleBtnClass}
          title={t.controls.unmuteMicrophone}
        />

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

        <DisconnectButton
          className="w-11 h-11 rounded-full bg-[#93000a] text-white flex items-center justify-center hover:bg-red-600 transition-all duration-150 shadow-lg shadow-red-900/40 ml-1 border-0 cursor-pointer group"
          title={t.controls.disconnect}
        >
          <PhoneOff className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </DisconnectButton>
      </div>
    </div>
  );
}
