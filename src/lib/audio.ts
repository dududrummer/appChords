import * as Tone from 'tone';
import { parseChord, getNoteIndex } from './music-theory';
import type { Measure } from './progression';
import { findLoop, availableBpms, type LoopStyle } from '../config/audio-loops';

export type Style     = LoopStyle;
export type AudioMode = 'harmony' | 'percussion' | 'both';

export const DEFAULT_BPM: Record<Style, number> = {
  batucada: 90, sambaenredo: 140, jazz: 170, bossanova: 108,
};
export const BPM_RANGE: Record<Style, [number,number]> = {
  batucada:   [60, 120],
  sambaenredo:[125, 160],
  jazz:       [150, 200],
  bossanova:  [70, 150],
};

// ── Re-export helpers for UI ──────────────────────────────────────────────────
export { findLoop, availableBpms };

// ── Active HTML audio loop ────────────────────────────────────────────────────
let activeLoop: HTMLAudioElement | null = null;

function stopLoop() {
  if (activeLoop) { activeLoop.pause(); activeLoop.src = ''; activeLoop = null; }
}

function playLoop(file: string): HTMLAudioElement {
  stopLoop();
  const audio = new Audio(`/audio/loops/${file}`);
  audio.loop = true;
  audio.volume = 0.9;
  audio.play().catch(e => console.warn('Loop play error:', e));
  activeLoop = audio;
  return audio;
}

// ── Chord note helpers ────────────────────────────────────────────────────────
const PC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const OPEN_MIDI: Record<string,number> = {E:40,A:45,D:50,G:55,B:59};

export function chordToFreqs(name:string, frets?:number[], tuning?:string[]): string[] {
  if (frets && tuning) {
    return frets.map((f,i)=>{
      if(f<0) return null;
      const pc=getNoteIndex(tuning[i]); if(pc===-1) return null;
      return Tone.Frequency((OPEN_MIDI[tuning[i]]??pc+48)+f,'midi').toNote();
    }).filter(Boolean) as string[];
  }
  const p=parseChord(name); if(!p) return [];
  const root=getNoteIndex(p.root);
  const out:string[]=[`${PC[root]}2`]; let oct=3;
  for(const pc of p.noteIndices.slice(0,4)){ if(pc<root) oct++; out.push(`${PC[pc]}${oct}`); }
  return out.slice(0,5);
}

// ── Harmony synth (FMSynth Rhodes-like) ──────────────────────────────────────
let harmony: Tone.PolySynth|null = null;
let harmonyReady = false;

function initHarmony() {
  if(harmonyReady) return;
  const rev = new Tone.Reverb({decay:1.2, wet:0.15}).toDestination();
  const cmp = new Tone.Compressor(-20, 4).connect(rev);
  harmony = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity:3.5, modulationIndex:12,
    oscillator:{type:'sine'},
    envelope:{attack:0.002, decay:0.6, sustain:0.2, release:2},
    modulation:{type:'sine'},
    modulationEnvelope:{attack:0.002, decay:0.3, sustain:0, release:1},
    volume:-5,
  } as any).connect(cmp);
  harmonyReady = true;
}

// ── Comping patterns ──────────────────────────────────────────────────────────
const SAMBA_COMP = [
  {time:0,   type:'full'  as const, vel:0.75},{time:0.75,type:'upper' as const,vel:0.50},
  {time:1.5, type:'upper' as const, vel:0.55},{time:2,   type:'full'  as const,vel:0.70},
  {time:2.75,type:'upper' as const, vel:0.50},{time:3.5, type:'upper' as const,vel:0.48},
];

const COMP: Record<Style,{time:number;type:'full'|'upper';vel:number}[]> = {
  batucada:    SAMBA_COMP,
  sambaenredo: SAMBA_COMP,
  jazz:[
    {time:1,   type:'full',  vel:0.65},{time:1.67,type:'upper',vel:0.45},
    {time:3,   type:'full',  vel:0.65},{time:3.67,type:'upper',vel:0.45},
  ],
  bossanova:[
    {time:0,   type:'full',  vel:0.62},{time:0.75,type:'upper',vel:0.48},
    {time:1.5, type:'upper', vel:0.52},{time:2.25,type:'full', vel:0.58},
    {time:3,   type:'upper', vel:0.48},{time:3.75,type:'upper',vel:0.44},
  ],
};


// ── Main playback ─────────────────────────────────────────────────────────────
export async function startPlayback(
  measures:    Measure[],
  style:       Style,
  bpm:         number,
  _metronome:  boolean,
  mode:        AudioMode,
  voicings:    Record<string,{frets:number[];tuning:string[]}>,
  onMeasure:   (i:number)=>void,
  loop = true
) {
  await Tone.start();
  stopLoop();
  Tone.getTransport().stop();
  Tone.getTransport().cancel();

  // ── Percussion: play the loop file ─────────────────────────────────────────
  if (mode !== 'harmony') {
    const entry = findLoop(style, bpm);
    if (entry) {
      playLoop(entry.file);
    } else {
      console.info(`Nenhum loop encontrado para ${style} @ ${bpm} BPM. Adicione arquivos em public/audio/loops/.`);
    }
  }

  // ── Harmony: schedule chord comping ────────────────────────────────────────
  if (mode !== 'percussion') {
    initHarmony();
    Tone.getTransport().bpm.value = bpm;
    Tone.getTransport().swing = style === 'jazz' ? 0.5 : 0;
    Tone.getTransport().swingSubdivision = '8n';

    const beatSec=60/bpm, barSec=beatSec*4;

    measures.forEach((measure,mi) => {
      const barStart = mi * barSec;
      Tone.getTransport().schedule(() => onMeasure(mi), barStart);

      let cursor=0;
      for(const beat of measure.beats){
        const slotStart=barStart+cursor*beatSec, slotEnd=slotStart+beat.durationBeats*beatSec;
        const v=voicings[beat.chordName];
        const freqs=chordToFreqs(beat.chordName, v?.frets, v?.tuning);
        const upper=freqs.slice(1);

        COMP[style].forEach(({time,type,vel})=>{
          const t=slotStart+time*beatSec; if(t>=slotEnd) return;
          const notes=type==='upper'?upper:freqs; if(!notes.length) return;
          notes.forEach((note,ni)=>
            Tone.getTransport().schedule(abs=>
              harmony?.triggerAttackRelease(note,'8n',abs+(ni*0.018),vel+(Math.random()-0.5)*0.05), t));
        });
        cursor+=beat.durationBeats;
      }
    });

    if(loop&&measures.length>0){
      Tone.getTransport().loopStart=0;
      Tone.getTransport().loopEnd=measures.length*barSec;
      Tone.getTransport().loop=true;
    }
    Tone.getTransport().start();
  } else {
    // Percussion only — just notify UI with a simple timer
    let mi = 0;
    const barMs = (60 / bpm) * 4 * 1000;
    const tick = () => { onMeasure(mi++ % measures.length); };
    tick();
    const intervalId = setInterval(tick, barMs);
    (window as any).__appChordsInterval = intervalId;
  }
}

export function stopPlayback() {
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  harmony?.releaseAll();
  stopLoop();
  clearInterval((window as any).__appChordsInterval);
}

export function setBpm(b:number) { Tone.getTransport().bpm.value = b; }
export function hasLoopFor(style:Style, bpm:number) { return findLoop(style, bpm) !== null; }
