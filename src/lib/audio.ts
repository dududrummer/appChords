import * as Tone from 'tone';
import { parseChord, getNoteIndex } from './music-theory';
import type { Measure } from './progression';

export type Style = 'samba' | 'jazz' | 'bossanova';

// MIDI note number of each open string (guitar EADGBE, low to high)
const GUITAR_OPEN = [40, 45, 50, 55, 59, 64];
const NOTE_MIDI: Record<string, number> = {
  C:0,  'C#':1, Db:1, D:2, 'D#':3, Eb:3, E:4, F:5,
  'F#':6, Gb:6, G:7, 'G#':8, Ab:8, A:9, 'A#':10, Bb:10, B:11,
};

function noteToMidi(note: string, octave = 4): number {
  const pc = NOTE_MIDI[note] ?? 0;
  return pc + (octave + 1) * 12;
}

/** Convert a chord name to Tone.js frequency strings, optionally using fret data */
export function chordToFreqs(chordName: string, frets?: number[], tuning?: string[]): string[] {
  // If fret data provided, derive exact notes
  if (frets && tuning && frets.length === tuning.length) {
    const midiBase = tuning.map(n => {
      const pc = NOTE_MIDI[n] ?? 0;
      // Assume standard register: E2=40, A2=45, D3=50, G3=55, B3=59, e4=64
      const registers: Record<string, number> = { E:40, A:45, D:50, G:55, B:59 };
      return registers[n] ?? (pc + 48);
    });
    return frets
      .map((f, i) => f >= 0 ? Tone.Frequency(midiBase[i] + f, 'midi').toNote() : null)
      .filter(Boolean) as string[];
  }

  // Fallback: build a simple closed voicing from the chord
  const parsed = parseChord(chordName);
  if (!parsed) return [];

  const rootPc = getNoteIndex(parsed.root);
  if (rootPc === -1) return [];

  const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const freqs: string[] = [];

  // Bass: root in octave 2
  freqs.push(`${NOTE_NAMES[rootPc]}2`);

  // Upper voices in octave 3-4
  let octave = 3;
  let lastPc = rootPc;
  for (const pc of parsed.noteIndices.slice(0, 4)) {
    let interval = (pc - lastPc + 12) % 12;
    if (interval === 0 && freqs.length > 1) interval = 12;
    if (interval > 6) octave -= 0;
    freqs.push(`${NOTE_NAMES[pc]}${octave}`);
    if (pc < lastPc) octave++;
    lastPc = pc;
  }

  return freqs.slice(0, 5);
}

// ── Rhythmic patterns ─────────────────────────────────────────────────────────
// Each entry: [timeInBeats, velocityFull, velocityUpper]
// timeInBeats relative to measure start (4/4 = 4 beats)
type PatternEntry = { time: number; type: 'full' | 'upper' | 'bass' };

const PATTERNS: Record<Style, PatternEntry[]> = {
  samba: [
    { time: 0,    type: 'full'  },
    { time: 0.75, type: 'upper' },
    { time: 1.5,  type: 'upper' },
    { time: 2,    type: 'full'  },
    { time: 2.75, type: 'upper' },
    { time: 3.5,  type: 'upper' },
  ],
  jazz: [
    { time: 0,   type: 'bass'  },
    { time: 1,   type: 'upper' },
    { time: 2,   type: 'bass'  },
    { time: 3,   type: 'upper' },
  ],
  bossanova: [
    { time: 0,    type: 'full'  },
    { time: 0.75, type: 'upper' },
    { time: 1.5,  type: 'upper' },
    { time: 2.25, type: 'full'  },
    { time: 3,    type: 'upper' },
    { time: 3.75, type: 'upper' },
  ],
};

// ── Audio engine ──────────────────────────────────────────────────────────────
let polySynth: Tone.PolySynth | null = null;
let metroSynth: Tone.MembraneSynth | null = null;

function ensureSynths() {
  if (!polySynth) {
    polySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle8' } as any,
      envelope: { attack: 0.02, decay: 0.4, sustain: 0.25, release: 1.5 },
      volume: -8,
    }).toDestination();
  }
  if (!metroSynth) {
    metroSynth = new Tone.MembraneSynth({ volume: -12 }).toDestination();
  }
}

export async function startPlayback(
  measures: Measure[],
  style: Style,
  bpm: number,
  metronome: boolean,
  voicings: Record<string, { frets: number[]; tuning: string[] }>,
  onMeasure: (idx: number) => void,
  loop = true
) {
  await Tone.start();
  ensureSynths();
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  Tone.getTransport().bpm.value = bpm;

  const beatDur = 60 / bpm; // seconds per beat
  const measureDur = beatDur * 4; // 4/4

  const pattern = PATTERNS[style];

  measures.forEach((measure, mi) => {
    const measureStart = mi * measureDur;

    // Notify UI which measure is playing
    Tone.getTransport().schedule(() => onMeasure(mi), measureStart);

    // Metronome clicks
    if (metronome) {
      for (let beat = 0; beat < 4; beat++) {
        const t = measureStart + beat * beatDur;
        Tone.getTransport().schedule(time => {
          metroSynth?.triggerAttackRelease(beat === 0 ? 'C2' : 'C1', '16n', time, beat === 0 ? 0.9 : 0.5);
        }, t);
      }
    }

    // Chord events: split measure into beat groups
    let beatCursor = 0;
    for (const beat of measure.beats) {
      const beatStart = measureStart + beatCursor;
      const chordDur = beat.durationBeats * beatDur;
      const v = voicings[beat.chordName];
      const freqs = chordToFreqs(beat.chordName, v?.frets, v?.tuning);
      const upperFreqs = freqs.slice(1); // skip bass
      const bassFreq = freqs.slice(0, 1);

      for (const p of pattern) {
        const when = beatStart + p.time * beatDur;
        if (p.time >= beat.durationBeats) continue; // don't bleed into next chord slot
        const notes = p.type === 'bass' ? bassFreq : p.type === 'upper' ? upperFreqs : freqs;
        const vel = p.type === 'full' ? 0.75 : 0.5;
        if (notes.length === 0) continue;
        Tone.getTransport().schedule(time => {
          polySynth?.triggerAttackRelease(notes, '8n', time, vel);
        }, when);
      }

      beatCursor += beat.durationBeats;
    }
  });

  // Loop
  if (loop && measures.length > 0) {
    Tone.getTransport().loopStart = 0;
    Tone.getTransport().loopEnd = measures.length * measureDur;
    Tone.getTransport().loop = true;
  }

  Tone.getTransport().start();
}

export function stopPlayback() {
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  polySynth?.releaseAll();
}

export function setBpm(bpm: number) {
  Tone.getTransport().bpm.value = bpm;
}
