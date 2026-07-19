"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { systemWaves, type SystemId } from "@/app/lib/weave-data";

export type WeaveSoundFrame = {
  deltaSeconds: number;
  progress: number;
};

type SoundFrameHandler = (frame: WeaveSoundFrame) => void;

type SoundEngine = {
  context: AudioContext;
  master: GainNode;
  paperGain: GainNode;
  pencilBand: BiquadFilterNode;
  pencilGain: GainNode;
  scratchSource: AudioBufferSourceNode;
  sources: AudioScheduledSourceNode[];
  toneFilter: BiquadFilterNode;
  toneGains: Record<SystemId, GainNode>;
};

const SYSTEM_ORDER: readonly SystemId[] = ["hvac", "electrical", "plumbing", "fire", "bms"];

const PENCIL_PROFILE: Record<SystemId, { frequency: number; gainScale: number; q: number }> = {
  hvac: { frequency: 1900, gainScale: 0.86, q: 0.72 },
  electrical: { frequency: 2750, gainScale: 0.72, q: 1.05 },
  plumbing: { frequency: 1350, gainScale: 1, q: 0.82 },
  fire: { frequency: 1050, gainScale: 1.06, q: 0.92 },
  bms: { frequency: 3200, gainScale: 0.58, q: 1.18 },
};

const TONE_PROFILE: Record<SystemId, { detune: number; frequency: number; gain: number }> = {
  hvac: { detune: 0, frequency: 146.832, gain: 0.006 },
  electrical: { detune: 2, frequency: 220, gain: 0.0046 },
  plumbing: { detune: -2, frequency: 329.628, gain: 0.0033 },
  fire: { detune: 3, frequency: 246.942, gain: 0.0036 },
  bms: { detune: -3, frequency: 369.994, gain: 0.0025 },
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(from: number, to: number, value: number) {
  const normalized = clamp01((value - from) / (to - from));
  return normalized * normalized * (3 - 2 * normalized);
}

function toneGainAtProgress(id: SystemId, progress: number) {
  const [start, end] = systemWaves[id];
  const local = clamp01((progress - start) / (end - start));
  return TONE_PROFILE[id].gain * smoothstep(0.62, 0.94, local);
}

function createNoiseBuffer(context: AudioContext) {
  const length = context.sampleRate * 2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  let paperBody = 0;
  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    paperBody = paperBody * 0.92 + white * 0.08;
    channel[index] = white * 0.72 + paperBody * 0.28;
  }
  const seam = Math.min(2048, Math.floor(length / 8));
  for (let index = 0; index < seam; index += 1) {
    const mix = index / seam;
    channel[length - seam + index] =
      channel[length - seam + index] * (1 - mix) + channel[index] * mix;
  }
  return buffer;
}

function createReverbImpulse(context: AudioContext) {
  const length = Math.floor(context.sampleRate * 1.4);
  const impulse = context.createBuffer(2, length, context.sampleRate);
  for (let channelIndex = 0; channelIndex < impulse.numberOfChannels; channelIndex += 1) {
    const channel = impulse.getChannelData(channelIndex);
    for (let index = 0; index < length; index += 1) {
      const decay = (1 - index / length) ** 4.2;
      channel[index] = (Math.random() * 2 - 1) * decay;
    }
  }
  return impulse;
}

function createSoundEngine() {
  const Context =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) return null;

  const context = new Context();
  const mix = context.createGain();
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  master.gain.value = 0;
  compressor.threshold.value = -18;
  compressor.knee.value = 6;
  compressor.ratio.value = 12;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.18;
  mix.connect(master);
  master.connect(compressor);
  compressor.connect(context.destination);

  const scratchSource = context.createBufferSource();
  scratchSource.buffer = createNoiseBuffer(context);
  scratchSource.loop = true;

  const pencilBand = context.createBiquadFilter();
  pencilBand.type = "bandpass";
  pencilBand.frequency.value = PENCIL_PROFILE.hvac.frequency;
  pencilBand.Q.value = PENCIL_PROFILE.hvac.q;
  const pencilHighPass = context.createBiquadFilter();
  pencilHighPass.type = "highpass";
  pencilHighPass.frequency.value = 420;
  pencilHighPass.Q.value = 0.3;
  const pencilLowPass = context.createBiquadFilter();
  pencilLowPass.type = "lowpass";
  pencilLowPass.frequency.value = 5600;
  pencilLowPass.Q.value = 0.3;
  const pencilGain = context.createGain();
  pencilGain.gain.value = 0;
  scratchSource.connect(pencilBand);
  pencilBand.connect(pencilHighPass);
  pencilHighPass.connect(pencilLowPass);
  pencilLowPass.connect(pencilGain);
  pencilGain.connect(mix);

  const paperBand = context.createBiquadFilter();
  paperBand.type = "bandpass";
  paperBand.frequency.value = 520;
  paperBand.Q.value = 0.8;
  const paperGain = context.createGain();
  paperGain.gain.value = 0;
  scratchSource.connect(paperBand);
  paperBand.connect(paperGain);
  paperGain.connect(mix);

  const toneFilter = context.createBiquadFilter();
  toneFilter.type = "lowpass";
  toneFilter.frequency.value = 680;
  toneFilter.Q.value = 0.45;
  const toneDry = context.createGain();
  toneDry.gain.value = 0.93;
  const preDelay = context.createDelay(0.1);
  preDelay.delayTime.value = 0.028;
  const convolver = context.createConvolver();
  convolver.buffer = createReverbImpulse(context);
  const toneWet = context.createGain();
  toneWet.gain.value = 0.07;
  toneFilter.connect(toneDry);
  toneDry.connect(mix);
  toneFilter.connect(preDelay);
  preDelay.connect(convolver);
  convolver.connect(toneWet);
  toneWet.connect(mix);

  const toneGains = {} as Record<SystemId, GainNode>;
  const sources: AudioScheduledSourceNode[] = [scratchSource];
  SYSTEM_ORDER.forEach((id) => {
    const profile = TONE_PROFILE[id];
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = profile.frequency;
    oscillator.detune.value = profile.detune;
    const gain = context.createGain();
    gain.gain.value = 0;
    oscillator.connect(gain);
    gain.connect(toneFilter);
    oscillator.start();
    sources.push(oscillator);
    toneGains[id] = gain;
  });
  scratchSource.start();

  return {
    context,
    master,
    paperGain,
    pencilBand,
    pencilGain,
    scratchSource,
    sources,
    toneFilter,
    toneGains,
  } satisfies SoundEngine;
}

export function useWeaveSoundscape(reducedMotion: boolean) {
  const engineRef = useRef<SoundEngine | null>(null);
  const enabledRef = useRef(false);
  const reducedMotionRef = useRef(reducedMotion);
  const accumulatorRef = useRef(0);
  const lastProgressRef = useRef<number | null>(null);
  const suspendTimerRef = useRef<number | null>(null);
  const [available, setAvailable] = useState(true);
  const [enabled, setEnabled] = useState(false);

  const soundFrameRef = useRef<SoundFrameHandler | null>((frame) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (!enabledRef.current || reducedMotionRef.current) {
      lastProgressRef.current = frame.progress;
      accumulatorRef.current = 0;
      return;
    }
    accumulatorRef.current += frame.deltaSeconds;
    if (accumulatorRef.current < 1 / 30) return;

    const deltaSeconds = accumulatorRef.current;
    accumulatorRef.current = 0;
    const previousProgress = lastProgressRef.current;
    lastProgressRef.current = frame.progress;
    const velocity =
      previousProgress === null ? 0 : Math.abs(frame.progress - previousProgress) / deltaSeconds;
    const speed = clamp01((velocity - 0.002) / 0.095);
    const activeSystem = SYSTEM_ORDER.find((id) => {
      const [start, end] = systemWaves[id];
      return frame.progress >= start && frame.progress <= end;
    });
    const now = engine.context.currentTime;

    let scratchTarget = 0;
    let paperTarget = 0;
    if (activeSystem) {
      const [start, end] = systemWaves[activeSystem];
      const local = clamp01((frame.progress - start) / (end - start));
      const edge = smoothstep(0, 0.04, local) * (1 - smoothstep(0.94, 1, local));
      const profile = PENCIL_PROFILE[activeSystem];
      const motion = Math.sqrt(speed);
      scratchTarget = 0.026 * profile.gainScale * edge * motion;
      paperTarget = 0.006 * edge * motion;
      engine.pencilBand.frequency.setTargetAtTime(profile.frequency, now, 0.045);
      engine.pencilBand.Q.setTargetAtTime(profile.q, now, 0.045);
    }

    const pencilTime = scratchTarget > engine.pencilGain.gain.value ? 0.018 : 0.07;
    engine.pencilGain.gain.setTargetAtTime(scratchTarget, now, pencilTime);
    engine.paperGain.gain.setTargetAtTime(paperTarget, now, pencilTime);
    engine.scratchSource.playbackRate.setTargetAtTime(0.82 + 0.38 * speed, now, 0.06);

    SYSTEM_ORDER.forEach((id) => {
      const target = toneGainAtProgress(id, frame.progress);
      const gain = engine.toneGains[id].gain;
      gain.setTargetAtTime(target, now, target > gain.value ? 0.22 : 0.4);
    });
    engine.toneFilter.frequency.setTargetAtTime(680 + frame.progress * 240, now, 0.12);
  });

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    const engine = engineRef.current;
    if (!engine || !enabledRef.current || !reducedMotion) return;
    const now = engine.context.currentTime;
    engine.pencilGain.gain.setTargetAtTime(0, now, 0.07);
    engine.paperGain.gain.setTargetAtTime(0, now, 0.07);
    SYSTEM_ORDER.forEach((id) => {
      engine.toneGains[id].gain.setTargetAtTime(TONE_PROFILE[id].gain, now, 1.1);
    });
  }, [reducedMotion]);

  const toggleSound = useCallback(async () => {
    if (enabledRef.current) {
      enabledRef.current = false;
      setEnabled(false);
      const engine = engineRef.current;
      if (engine) {
        accumulatorRef.current = 0;
        engine.master.gain.setTargetAtTime(0, engine.context.currentTime, 0.025);
        suspendTimerRef.current = window.setTimeout(() => {
          if (!enabledRef.current && engine.context.state === "running") {
            void engine.context.suspend();
          }
        }, 140);
      }
      return;
    }

    let engine = engineRef.current;
    try {
      if (!engine) {
        engine = createSoundEngine();
        if (!engine) {
          setAvailable(false);
          return;
        }
        engineRef.current = engine;
      }
      const activeEngine = engine;
      if (suspendTimerRef.current !== null) {
        window.clearTimeout(suspendTimerRef.current);
        suspendTimerRef.current = null;
      }
      await activeEngine.context.resume();
      accumulatorRef.current = 0;
      const now = activeEngine.context.currentTime;
      const seededProgress = lastProgressRef.current ?? 0;
      SYSTEM_ORDER.forEach((id) => {
        const gain = activeEngine.toneGains[id].gain;
        gain.cancelScheduledValues(now);
        gain.setValueAtTime(toneGainAtProgress(id, seededProgress), now);
      });
      enabledRef.current = true;
      setEnabled(true);
      activeEngine.master.gain.setTargetAtTime(0.55, now, 0.3);
      if (reducedMotionRef.current) {
        SYSTEM_ORDER.forEach((id) => {
          activeEngine.toneGains[id].gain.setTargetAtTime(
            TONE_PROFILE[id].gain,
            activeEngine.context.currentTime,
            1.1,
          );
        });
      }
    } catch {
      setAvailable(false);
      enabledRef.current = false;
      setEnabled(false);
    }
  }, []);

  useEffect(() => {
    const clearSuspendTimer = () => {
      if (suspendTimerRef.current !== null) {
        window.clearTimeout(suspendTimerRef.current);
        suspendTimerRef.current = null;
      }
    };
    const resumeEnabledSound = () => {
      const engine = engineRef.current;
      if (!engine || !enabledRef.current || document.hidden) return;
      clearSuspendTimer();
      accumulatorRef.current = 0;
      lastProgressRef.current = null;
      void engine.context
        .resume()
        .then(() => {
          if (enabledRef.current && !document.hidden && engine.context.state === "running") {
            engine.master.gain.setTargetAtTime(0.55, engine.context.currentTime, 0.3);
          }
        })
        .catch(() => {
          enabledRef.current = false;
          setEnabled(false);
        });
    };
    const handleVisibility = () => {
      const engine = engineRef.current;
      if (!engine) return;
      clearSuspendTimer();
      if (!document.hidden) {
        resumeEnabledSound();
        return;
      }
      engine.master.gain.setTargetAtTime(0, engine.context.currentTime, 0.08);
      suspendTimerRef.current = window.setTimeout(() => {
        if (document.hidden && engine.context.state === "running") {
          void engine.context.suspend();
        }
      }, 280);
    };
    const handlePageHide = () => {
      const engine = engineRef.current;
      if (!engine) return;
      clearSuspendTimer();
      const now = engine.context.currentTime;
      engine.master.gain.cancelScheduledValues(now);
      engine.master.gain.setValueAtTime(0, now);
      void engine.context.suspend();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", resumeEnabledSound);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", resumeEnabledSound);
      const engine = engineRef.current;
      if (!engine) return;
      clearSuspendTimer();
      engine.sources.forEach((source) => {
        try {
          source.stop();
        } catch {
          // The source may already be stopped while the page is closing.
        }
      });
      void engine.context.close();
      engineRef.current = null;
    };
  }, []);

  return {
    available,
    enabled,
    soundFrameRef: soundFrameRef as RefObject<SoundFrameHandler | null>,
    toggleSound,
  };
}
