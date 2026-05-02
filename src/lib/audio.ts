import * as Tone from 'tone';
import { parseChord, getNoteIndex } from './music-theory';
import type { Measure } from './progression';

export type Style = 'samba' | 'jazz' | 'bossanova';
export type AudioMode = 'harmony' | 'percussion' | 'both';

// ── Drum types ────────────────────────────────────────────────────────────────
type Drum = 'kick' | 'snare' | 'hihat' | 'ride' | 'tamborim' | 'surdo' | 'rim';
interface DrumHit { drum: Drum; pos: number; vel: number } // pos = 8th-note index (0-7)

// ── Percussion patterns (8th notes, 0-7 per 4/4 bar) ─────────────────────────
const PERC: Record<Style, DrumHit[]> = {
  samba: [
    { drum: 'surdo',    pos: 2, vel: 0.95 }, // beat 2
    { drum: 'surdo',    pos: 6, vel: 0.85 }, // beat 4
    { drum: 'tamborim', pos: 0, vel: 0.80 },
    { drum: 'tamborim', pos: 1, vel: 0.55 },
    { drum: 'tamborim', pos: 3, vel: 0.75 },
    { drum: 'tamborim', pos: 4, vel: 0.80 },
    { drum: 'tamborim', pos: 6, vel: 0.70 },
    { drum: 'tamborim', pos: 7, vel: 0.50 },
    { drum: 'snare',    pos: 1, vel: 0.35 }, // caixa fraca nas contratempos
    { drum: 'snare',    pos: 3, vel: 0.35 },
    { drum: 'snare',    pos: 5, vel: 0.35 },
    { drum: 'snare',    pos: 7, vel: 0.35 },
  ],
  jazz: [
    { drum: 'ride',  pos: 0, vel: 0.75 }, // ride swing: todas as colcheias
    { drum: 'ride',  pos: 1, vel: 0.50 },
    { drum: 'ride',  pos: 2, vel: 0.75 },
    { drum: 'ride',  pos: 3, vel: 0.50 },
    { drum: 'ride',  pos: 4, vel: 0.75 },
    { drum: 'ride',  pos: 5, vel: 0.50 },
    { drum: 'ride',  pos: 6, vel: 0.75 },
    { drum: 'ride',  pos: 7, vel: 0.50 },
    { drum: 'hihat', pos: 2, vel: 0.80 }, // chapéu no 2 e 4
    { drum: 'hihat', pos: 6, vel: 0.80 },
    { drum: 'snare', pos: 2, vel: 0.85 }, // caixa no 2 e 4
    { drum: 'snare', pos: 6, vel: 0.85 },
    { drum: 'kick',  pos: 0, vel: 0.60 }, // bumbo
    { drum: 'kick',  pos: 5, vel: 0.45 },
  ],
  bossanova: [
    { drum: 'rim',   pos: 0, vel: 0.85 }, // rimshot padrão bossa nova
    { drum: 'rim',   pos: 2, vel: 0.65 },
    { drum: 'rim',   pos: 3, vel: 0.80 },
    { drum: 'rim',   pos: 5, vel: 0.70 },
    { drum: 'rim',   pos: 6, vel: 0.60 },
    { drum: 'kick',  pos: 0, vel: 0.70 }, // bumbo bossa
    { drum: 'kick',  pos: 3, vel: 0.55 },
    { drum: 'kick',  pos: 5, vel: 0.50 },
    { drum: 'hihat', pos: 0, vel: 0.40 }, // chapéu suave constante
    { drum: 'hihat', pos: 2, vel: 0.30 },
    { drum: 'hihat', pos: 4, vel: 0.40 },
    { drum: 'hihat', pos: 6, vel: 0.30 },
  ],
};

// ── Chord comping patterns (beat positions, 0-3 = 4 beats) ───────────────────
const CHORD_HITS: Record<Style, { time: number; type: 'full' | 'upper'; vel: number }[]> = {
  samba: [
    { time: 0,    type: 'full',  vel: 0.80 },
    { time: 0.75, type: 'upper', vel: 0.55 },
    { time: 1.5,  type: 'upper', vel: 0.60 },
    { time: 2,    type: 'full',  vel: 0.75 },
    { time: 2.75, type: 'upper', vel: 0.55 },
    { time: 3.5,  type: 'upper', vel: 0.55 },
  ],
  jazz: [
    { time: 1,    type: 'full',  vel: 0.70 }, // comp on 2 and 4
    { time: 1.66, type: 'upper', vel: 0.50 },
    { time: 3,    type: 'full',  vel: 0.70 },
    { time: 3.66, type: 'upper', vel: 0.50 },
  ],
  bossanova: [
    { time: 0,    type: 'full',  vel: 0.70 },
    { time: 0.75, type: 'upper', vel: 0.55 },
    { time: 1.5,  type: 'upper', vel: 0.60 },
    { time: 2.25, type: 'full',  vel: 0.65 },
    { time: 3,    type: 'upper', vel: 0.55 },
    { time: 3.75, type: 'upper', vel: 0.50 },
  ],
};

// ── Note helpers ──────────────────────────────────────────────────────────────
const PC_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export function chordToFreqs(chordName: string, frets?: number[], tuning?: string[]): string[] {
  if (frets && tuning) {
    const OPEN_MIDI: Record<string, number> = { E: 40, A: 45, D: 50, G: 55, B: 59 };
    return frets.map((f, i) => {
      if (f < 0) return null;
      const pc = getNoteIndex(tuning[i]);
      if (pc === -1) return null;
      const base = OPEN_MIDI[tuning[i]] ?? pc + 48;
      return Tone.Frequency(base + f, 'midi').toNote();
    }).filter(Boolean) as string[];
  }
  const p = parseChord(chordName);
  if (!p) return [];
  const root = getNoteIndex(p.root);
  const freqs: string[] = [`${PC_NAMES[root]}2`];
  let oct = 3;
  for (const pc of p.noteIndices.slice(0, 4)) {
    if (pc < root) oct++;
    freqs.push(`${PC_NAMES[pc]}${oct}`);
  }
  return freqs.slice(0, 5);
}

// ── Synth singletons ──────────────────────────────────────────────────────────
let harmony:  Tone.PolySynth | null = null;
let kick:     Tone.MembraneSynth | null = null;
let snare:    Tone.NoiseSynth | null = null;
let hihat:    Tone.MetalSynth | null = null;
let tamborim: Tone.MetalSynth | null = null;
let surdo:    Tone.MembraneSynth | null = null;
let reverb:   Tone.Reverb | null = null;

function initSynths() {
  if (harmony) return;

  reverb = new Tone.Reverb({ decay: 1.8, wet: 0.18 }).toDestination();

  // Piano/guitar-like FM chord synth
  harmony = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3,
    modulationIndex: 10,
    oscillator:         { type: 'sine' },
    envelope:           { attack: 0.01, decay: 0.3, sustain: 0.4, release: 1.2 },
    modulation:         { type: 'triangle' },
    modulationEnvelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.5 },
    volume: -6,
  } as any).connect(reverb);

  // Percussion
  kick = new Tone.MembraneSynth({
    pitchDecay: 0.06, octaves: 8,
    envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.1 }, volume: -4,
  }).toDestination();

  snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.13, sustain: 0, release: 0.05 }, volume: -8,
  }).connect(new Tone.Filter(2500, 'highpass').toDestination());

  hihat = new Tone.MetalSynth({
    frequency: 600, harmonicity: 5.1, modulationIndex: 32,
    resonance: 4000, octaves: 1.5,
    envelope: { attack: 0.001, decay: 0.04, release: 0.01 }, volume: -14,
  }).toDestination();

  tamborim = new Tone.MetalSynth({
    frequency: 900, harmonicity: 8, modulationIndex: 16,
    resonance: 5000, octaves: 0.5,
    envelope: { attack: 0.001, decay: 0.03, release: 0.01 }, volume: -12,
  }).toDestination();

  surdo = new Tone.MembraneSynth({
    pitchDecay: 0.1, octaves: 4, frequency: 55,
    envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.1 }, volume: -4,
  }).toDestination();
}

function triggerDrum(drum: Drum, time: number, vel: number) {
  switch (drum) {
    case 'kick':     kick?.triggerAttackRelease('C1', '8n', time, vel); break;
    case 'snare':    snare?.triggerAttackRelease('8n', time, vel); break;
    case 'hihat':    hihat?.triggerAttackRelease(time, vel); break;
    case 'ride':     hihat?.triggerAttackRelease(time, vel * 1.2); break;
    case 'tamborim': tamborim?.triggerAttackRelease(time, vel); break;
    case 'surdo':    surdo?.triggerAttackRelease('C1', '4n', time, vel); break;
    case 'rim':      snare?.triggerAttackRelease('16n', time, vel * 0.7); break;
  }
}

// ── Main API ──────────────────────────────────────────────────────────────────
export async function startPlayback(
  measures: Measure[],
  style: Style,
  bpm: number,
  metronome: boolean,
  mode: AudioMode,
  voicings: Record<string, { frets: number[]; tuning: string[] }>,
  onMeasure: (idx: number) => void,
  loop = true
) {
  await Tone.start();
  initSynths();
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  Tone.getTransport().bpm.value = bpm;
  Tone.getTransport().swing = style === 'jazz' ? 0.5 : 0; // swing only for jazz
  Tone.getTransport().swingSubdivision = '8n';

  const beatSec = 60 / bpm;
  const barSec = beatSec * 4;
  const eighth = beatSec / 2;
  const percPattern = PERC[style];
  const chordPattern = CHORD_HITS[style];

  measures.forEach((measure, mi) => {
    const barStart = mi * barSec;
    Tone.getTransport().schedule(() => onMeasure(mi), barStart);

    // Metronome
    if (metronome) {
      for (let b = 0; b < 4; b++) {
        Tone.getTransport().schedule(t => {
          kick?.triggerAttackRelease('C2', '16n', t, b === 0 ? 0.9 : 0.5);
        }, barStart + b * beatSec);
      }
    }

    // Percussion
    if (mode !== 'harmony') {
      percPattern.forEach(({ drum, pos, vel }) => {
        Tone.getTransport().schedule(t => triggerDrum(drum, t, vel), barStart + pos * eighth);
      });
    }

    // Harmony (chord comping)
    if (mode !== 'percussion') {
      let beatCursor = 0;
      for (const beat of measure.beats) {
        const slotStart = barStart + beatCursor * beatSec;
        const slotEnd = slotStart + beat.durationBeats * beatSec;
        const v = voicings[beat.chordName];
        const freqs = chordToFreqs(beat.chordName, v?.frets, v?.tuning);
        const upper = freqs.slice(1);

        chordPattern.forEach(({ time, type, vel }) => {
          const absTime = slotStart + time * beatSec;
          if (absTime >= slotEnd) return;
          const notes = type === 'upper' ? upper : freqs;
          if (!notes.length) return;
          Tone.getTransport().schedule(t => {
            harmony?.triggerAttackRelease(notes, '8n', t, vel + Math.random() * 0.05);
          }, absTime);
        });

        beatCursor += beat.durationBeats;
      }
    }
  });

  if (loop && measures.length > 0) {
    Tone.getTransport().loopStart = 0;
    Tone.getTransport().loopEnd = measures.length * barSec;
    Tone.getTransport().loop = true;
  }
  Tone.getTransport().start();
}

export function stopPlayback() {
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  harmony?.releaseAll();
}

export function setBpm(bpm: number) {
  Tone.getTransport().bpm.value = bpm;
}
