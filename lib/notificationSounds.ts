export type NotificationSoundType =
  | "cameraOn"
  | "cameraOff"
  | "screenShareStart"
  | "screenShareStop"
  | "channelJoin"
  | "channelLeave"
  | "channelSwitch"
  | "serverSwitch"
  | "roomSwitch";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    audioContext = new AudioCtx();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function playTone(
  ctx: AudioContext,
  destination: AudioNode,
  {
    frequency,
    type = "sine",
    startTime,
    duration,
    volume = 0.3,
    frequencyEnd,
  }: {
    frequency: number;
    type?: OscillatorType;
    startTime: number;
    duration: number;
    volume?: number;
    frequencyEnd?: number;
  }
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  if (frequencyEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(frequencyEnd, 1),
      startTime + duration
    );
  }

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

export function playNotificationSound(type: NotificationSoundType) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.35;
  master.connect(ctx.destination);

  switch (type) {
    case "cameraOn":
      // Tríade ascendente — câmera ligada
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        playTone(ctx, master, {
          frequency: freq,
          type: "sine",
          startTime: now + i * 0.09,
          duration: 0.22,
          volume: 0.28,
        });
      });
      break;

    case "cameraOff":
      // Tom descendente suave — câmera desligada
      playTone(ctx, master, {
        frequency: 440,
        type: "triangle",
        startTime: now,
        duration: 0.28,
        volume: 0.25,
        frequencyEnd: 220,
      });
      break;

    case "screenShareStart":
      // Sweep ascendente + clique — compartilhamento iniciado
      playTone(ctx, master, {
        frequency: 180,
        type: "sawtooth",
        startTime: now,
        duration: 0.18,
        volume: 0.12,
        frequencyEnd: 720,
      });
      playTone(ctx, master, {
        frequency: 880,
        type: "square",
        startTime: now + 0.14,
        duration: 0.1,
        volume: 0.15,
      });
      break;

    case "screenShareStop":
      // Dois bipes graves — compartilhamento encerrado
      [0, 0.14].forEach((offset, i) => {
        playTone(ctx, master, {
          frequency: 320 - i * 60,
          type: "square",
          startTime: now + offset,
          duration: 0.11,
          volume: 0.2,
        });
      });
      break;

    case "channelJoin":
      // Entrada em canal de voz
      [392, 523.25, 659.25].forEach((freq, i) => {
        playTone(ctx, master, {
          frequency: freq,
          type: "sine",
          startTime: now + i * 0.07,
          duration: 0.18,
          volume: 0.22,
        });
      });
      break;

    case "channelLeave":
      // Saída de canal de voz
      playTone(ctx, master, {
        frequency: 392,
        type: "sine",
        startTime: now,
        duration: 0.2,
        volume: 0.2,
        frequencyEnd: 196,
      });
      break;

    case "channelSwitch":
      // Troca entre canais de voz
      playTone(ctx, master, {
        frequency: 330,
        type: "triangle",
        startTime: now,
        duration: 0.08,
        volume: 0.18,
        frequencyEnd: 440,
      });
      playTone(ctx, master, {
        frequency: 554.37,
        type: "sine",
        startTime: now + 0.1,
        duration: 0.15,
        volume: 0.22,
      });
      break;

    case "serverSwitch":
      // Troca de servidor
      [261.63, 329.63, 392].forEach((freq, i) => {
        playTone(ctx, master, {
          frequency: freq,
          type: "sine",
          startTime: now + i * 0.06,
          duration: 0.14,
          volume: 0.2,
        });
      });
      playTone(ctx, master, {
        frequency: 523.25,
        type: "triangle",
        startTime: now + 0.22,
        duration: 0.2,
        volume: 0.18,
      });
      break;

    case "roomSwitch":
      // Navegação para nova sala
      playTone(ctx, master, {
        frequency: 220,
        type: "sawtooth",
        startTime: now,
        duration: 0.12,
        volume: 0.1,
        frequencyEnd: 440,
      });
      [523.25, 659.25].forEach((freq, i) => {
        playTone(ctx, master, {
          frequency: freq,
          type: "sine",
          startTime: now + 0.14 + i * 0.08,
          duration: 0.16,
          volume: 0.2,
        });
      });
      break;
  }
}
