import * as Tone from 'tone';
import { parseChord, getNoteIndex } from './music-theory';
import type { Measure } from './progression';

export type Style    = 'samba' | 'jazz' | 'bossanova';
export type AudioMode = 'harmony' | 'percussion' | 'both';

// ── Default BPM per style ─────────────────────────────────────────────────────
export const DEFAULT_BPM: Record<Style, number> = { samba: 100, jazz: 140, bossanova: 108 };
export const BPM_RANGE:   Record<Style, [number, number]> = {
  samba:     [70, 160],
  jazz:      [100, 240],
  bossanova: [70, 160],
};

// ── Drum note mappings (MIDI-like, mapped to Sampler pitches) ─────────────────
// CR78 samples: BD=C1, SD=D1, CH=E1, OH=F1, HT=G1, MT=A1, LT=B1
const D: Record<string, string> = {
  kick: 'C1', snare: 'D1', hihat_c: 'E1', hihat_o: 'F1',
  htom:  'G1', mtom:  'A1', ltom:    'B1',
};

// ── Percussion patterns (8th-note grid, 0-7 for 4/4) ─────────────────────────
type Hit = { drum: keyof typeof D; pos: number; vel: number };

const PERC: Record<Style, Hit[]> = {
  samba: [
    // Surdo (deep low drum) — beat 2 and 4 = pos 2 and 6
    { drum: 'ltom',    pos: 2, vel: 0.95 },
    { drum: 'ltom',    pos: 6, vel: 0.85 },
    // Caixa (snare rim) — every off-beat
    { drum: 'snare',   pos: 1, vel: 0.45 },
    { drum: 'snare',   pos: 3, vel: 0.45 },
    { drum: 'snare',   pos: 5, vel: 0.45 },
    { drum: 'snare',   pos: 7, vel: 0.45 },
    // Tamborim/agogô — samba syncopated
    { drum: 'htom',    pos: 0, vel: 0.80 },
    { drum: 'htom',    pos: 1, vel: 0.55 },
    { drum: 'htom',    pos: 3, vel: 0.75 },
    { drum: 'htom',    pos: 4, vel: 0.80 },
    { drum: 'htom',    pos: 6, vel: 0.70 },
    { drum: 'htom',    pos: 7, vel: 0.50 },
  ],
  jazz: [
    // Ride cymbal — swing colcheias
    { drum: 'hihat_o', pos: 0, vel: 0.75 },
    { drum: 'hihat_c', pos: 1, vel: 0.45 },
    { drum: 'hihat_o', pos: 2, vel: 0.75 },
    { drum: 'hihat_c', pos: 3, vel: 0.45 },
    { drum: 'hihat_o', pos: 4, vel: 0.75 },
    { drum: 'hihat_c', pos: 5, vel: 0.45 },
    { drum: 'hihat_o', pos: 6, vel: 0.75 },
    { drum: 'hihat_c', pos: 7, vel: 0.45 },
    // Caixa no 2 e 4
    { drum: 'snare',   pos: 2, vel: 0.85 },
    { drum: 'snare',   pos: 6, vel: 0.85 },
    // Bumbo
    { drum: 'kick',    pos: 0, vel: 0.65 },
    { drum: 'kick',    pos: 5, vel: 0.50 },
  ],
  bossanova: [
    // Rimshot — padrão João Gilberto (clave 3-2)
    { drum: 'snare',   pos: 0, vel: 0.82 },
    { drum: 'snare',   pos: 2, vel: 0.62 },
    { drum: 'snare',   pos: 3, vel: 0.78 },
    { drum: 'snare',   pos: 5, vel: 0.68 },
    { drum: 'snare',   pos: 6, vel: 0.58 },
    // Bumbo bossa
    { drum: 'kick',    pos: 0, vel: 0.70 },
    { drum: 'kick',    pos: 3, vel: 0.55 },
    { drum: 'kick',    pos: 5, vel: 0.48 },
    // Chapéu — suave e constante
    { drum: 'hihat_c', pos: 0, vel: 0.35 },
    { drum: 'hihat_c', pos: 2, vel: 0.25 },
    { drum: 'hihat_c', pos: 4, vel: 0.35 },
    { drum: 'hihat_c', pos: 6, vel: 0.25 },
  ],
};

// ── Chord comping patterns ─────────────────────────────────────────────────────
const COMP: Record<Style, { time: number; type: 'full' | 'upper'; vel: number }[]> = {
  samba: [
    { time: 0,    type: 'full',  vel: 0.78 },
    { time: 0.75, type: 'upper', vel: 0.52 },
    { time: 1.5,  type: 'upper', vel: 0.58 },
    { time: 2,    type: 'full',  vel: 0.72 },
    { time: 2.75, type: 'upper', vel: 0.52 },
    { time: 3.5,  type: 'upper', vel: 0.52 },
  ],
  jazz: [
    { time: 1,    type: 'full',  vel: 0.68 },
    { time: 1.67, type: 'upper', vel: 0.48 },
    { time: 3,    type: 'full',  vel: 0.68 },
    { time: 3.67, type: 'upper', vel: 0.48 },
  ],
  bossanova: [
    { time: 0,    type: 'full',  vel: 0.68 },
    { time: 0.75, type: 'upper', vel: 0.52 },
    { time: 1.5,  type: 'upper', vel: 0.58 },
    { time: 2.25, type: 'full',  vel: 0.62 },
    { time: 3,    type: 'upper', vel: 0.52 },
    { time: 3.75, type: 'upper', vel: 0.48 },
  ],
};

// ── Note helpers ──────────────────────────────────────────────────────────────
const PC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const OPEN_MIDI: Record<string, number> = { E: 40, A: 45, D: 50, G: 55, B: 59 };

export function chordToFreqs(name: string, frets?: number[], tuning?: string[]): string[] {
  if (frets && tuning) {
    return frets.map((f, i) => {
      if (f < 0) return null;
      const pc = getNoteIndex(tuning[i]);
      if (pc === -1) return null;
      const base = OPEN_MIDI[tuning[i]] ?? (pc + 48);
      return Tone.Frequency(base + f, 'midi').toNote();
    }).filter(Boolean) as string[];
  }
  const p = parseChord(name);
  if (!p) return [];
  const root = getNoteIndex(p.root);
  const notes: string[] = [`${PC[root]}2`];
  let oct = 3;
  for (const pc of p.noteIndices.slice(0, 4)) {
    if (pc < root) oct++;
    notes.push(`${PC[pc]}${oct}`);
  }
  return notes.slice(0, 5);
}

// ── Singleton instances ────────────────────────────────────────────────────────
let piano:   Tone.Sampler | null = null;
let drums:   Tone.Sampler | null = null;
let reverb:  Tone.Reverb  | null = null;
let loading  = false;
let loaded   = false;

export async function loadSamples(): Promise<void> {
  if (loaded || loading) return;
  loading = true;

  await Tone.start();
  reverb = new Tone.Reverb({ decay: 1.5, wet: 0.15 }).toDestination();

  await new Promise<void>((resolve) => {
    piano = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3',  C1: 'C1.mp3',  'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3',
        A1: 'A1.mp3',  C2: 'C2.mp3',  'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
        A2: 'A2.mp3',  C3: 'C3.mp3',  'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
        A3: 'A3.mp3',  C4: 'C4.mp3',  'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',  C5: 'C5.mp3',  'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
      },
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: resolve,
    }).connect(reverb!);
  });

  await new Promise<void>((resolve) => {
    drums = new Tone.Sampler({
      urls: {
        [D.kick]:    'BD.mp3',
        [D.snare]:   'SD.mp3',
        [D.hihat_c]: 'CH.mp3',
        [D.hihat_o]: 'OH.mp3',
        [D.htom]:    'HT.mp3',
        [D.mtom]:    'MT.mp3',
        [D.ltom]:    'LT.mp3',
      },
      baseUrl: 'https://tonejs.github.io/audio/drum-samples/CR78/',
      onload: resolve,
    }).toDestination();
  });

  loaded  = true;
  loading = false;
}

// ── Playback ──────────────────────────────────────────────────────────────────
export async function startPlayback(
  measures:   Measure[],
  style:      Style,
  bpm:        number,
  metronome:  boolean,
  mode:       AudioMode,
  voicings:   Record<string, { frets: number[]; tuning: string[] }>,
  onMeasure:  (idx: number) => void,
  loop = true
) {
  await loadSamples();

  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  Tone.getTransport().bpm.value   = bpm;
  Tone.getTransport().swing       = style === 'jazz' ? 0.5 : 0;
  Tone.getTransport().swingSubdivision = '8n';

  const beatSec  = 60 / bpm;
  const barSec   = beatSec * 4;
  const eighthSec = beatSec / 2;

  measures.forEach((measure, mi) => {
    const barStart = mi * barSec;
    Tone.getTransport().schedule(() => onMeasure(mi), barStart);

    // Metronome
    if (metronome) {
      for (let b = 0; b < 4; b++) {
        Tone.getTransport().schedule(t => {
          drums?.triggerAttackRelease(b === 0 ? D.htom : D.snare, '16n', t, b === 0 ? 0.7 : 0.3);
        }, barStart + b * beatSec);
      }
    }

    // Percussion
    if (mode !== 'harmony') {
      PERC[style].forEach(({ drum, pos, vel }) => {
        Tone.getTransport().schedule(t => {
          drums?.triggerAttackRelease(D[drum], '8n', t, vel);
        }, barStart + pos * eighthSec);
      });
    }

    // Harmony comping
    if (mode !== 'percussion') {
      let cursor = 0;
      for (const beat of measure.beats) {
        const slotStart = barStart + cursor * beatSec;
        const slotEnd   = slotStart + beat.durationBeats * beatSec;
        const v     = voicings[beat.chordName];
        const freqs = chordToFreqs(beat.chordName, v?.frets, v?.tuning);
        const upper = freqs.slice(1);

        COMP[style].forEach(({ time, type, vel }) => {
          const t = slotStart + time * beatSec;
          if (t >= slotEnd) return;
          const notes = type === 'upper' ? upper : freqs;
          if (!notes.length) return;
          Tone.getTransport().schedule(abs => {
            piano?.triggerAttackRelease(notes, '8n', abs, vel + (Math.random() - 0.5) * 0.04);
          }, t);
        });
        cursor += beat.durationBeats;
      }
    }
  });

  if (loop && measures.length > 0) {
    Tone.getTransport().loopStart = 0;
    Tone.getTransport().loopEnd   = measures.length * barSec;
    Tone.getTransport().loop      = true;
  }
  Tone.getTransport().start();
}

export function stopPlayback() {
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  piano?.releaseAll();
}

export function setBpm(bpm: number) {
  Tone.getTransport().bpm.value = bpm;
}

export function isLoaded() { return loaded; }
