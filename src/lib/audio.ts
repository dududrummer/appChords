import * as Tone from 'tone';
import { parseChord, getNoteIndex } from './music-theory';
import type { Measure } from './progression';

export type Style    = 'samba' | 'jazz' | 'bossanova';
export type AudioMode = 'harmony' | 'percussion' | 'both';

export const DEFAULT_BPM: Record<Style, number> = { samba: 100, jazz: 138, bossanova: 108 };
export const BPM_RANGE:   Record<Style, [number,number]> = {
  samba:[70,160], jazz:[90,240], bossanova:[70,150],
};

// ── Percussion patterns (8th-note grid 0-7, 4/4) ─────────────────────────────
type Drum = 'kick'|'snare'|'hihat'|'tamborim'|'surdo';
interface Hit { drum:Drum; pos:number; vel:number }

const PERC: Record<Style, Hit[]> = {
  samba:[
    {drum:'surdo',    pos:2, vel:0.95}, {drum:'surdo',    pos:6, vel:0.85},
    {drum:'tamborim', pos:0, vel:0.80}, {drum:'tamborim', pos:1, vel:0.55},
    {drum:'tamborim', pos:3, vel:0.75}, {drum:'tamborim', pos:4, vel:0.80},
    {drum:'tamborim', pos:6, vel:0.70}, {drum:'tamborim', pos:7, vel:0.50},
    {drum:'snare',    pos:1, vel:0.40}, {drum:'snare',    pos:3, vel:0.38},
    {drum:'snare',    pos:5, vel:0.40}, {drum:'snare',    pos:7, vel:0.35},
  ],
  jazz:[
    {drum:'hihat',    pos:0, vel:0.70}, {drum:'hihat',    pos:1, vel:0.40},
    {drum:'hihat',    pos:2, vel:0.70}, {drum:'hihat',    pos:3, vel:0.40},
    {drum:'hihat',    pos:4, vel:0.70}, {drum:'hihat',    pos:5, vel:0.40},
    {drum:'hihat',    pos:6, vel:0.70}, {drum:'hihat',    pos:7, vel:0.40},
    {drum:'snare',    pos:2, vel:0.80}, {drum:'snare',    pos:6, vel:0.80},
    {drum:'kick',     pos:0, vel:0.65}, {drum:'kick',     pos:5, vel:0.45},
  ],
  bossanova:[
    {drum:'snare',    pos:0, vel:0.80}, {drum:'snare',    pos:2, vel:0.60},
    {drum:'snare',    pos:3, vel:0.75}, {drum:'snare',    pos:5, vel:0.65},
    {drum:'snare',    pos:6, vel:0.55},
    {drum:'kick',     pos:0, vel:0.72}, {drum:'kick',     pos:3, vel:0.52},
    {drum:'kick',     pos:5, vel:0.48},
    {drum:'hihat',    pos:0, vel:0.30}, {drum:'hihat',    pos:2, vel:0.25},
    {drum:'hihat',    pos:4, vel:0.30}, {drum:'hihat',    pos:6, vel:0.25},
  ],
};

const COMP: Record<Style,{time:number;type:'full'|'upper';vel:number}[]> = {
  samba:[
    {time:0,   type:'full',  vel:0.78},{time:0.75,type:'upper',vel:0.52},
    {time:1.5, type:'upper', vel:0.58},{time:2,   type:'full', vel:0.72},
    {time:2.75,type:'upper', vel:0.52},{time:3.5, type:'upper',vel:0.50},
  ],
  jazz:[
    {time:1,   type:'full',  vel:0.68},{time:1.67,type:'upper',vel:0.48},
    {time:3,   type:'full',  vel:0.68},{time:3.67,type:'upper',vel:0.48},
  ],
  bossanova:[
    {time:0,   type:'full',  vel:0.66},{time:0.75,type:'upper',vel:0.50},
    {time:1.5, type:'upper', vel:0.55},{time:2.25,type:'full', vel:0.60},
    {time:3,   type:'upper', vel:0.50},{time:3.75,type:'upper',vel:0.46},
  ],
};

// ── Note helpers ──────────────────────────────────────────────────────────────
const PC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const OPEN_MIDI: Record<string,number> = {E:40,A:45,D:50,G:55,B:59};

export function chordToFreqs(name:string, frets?:number[], tuning?:string[]): string[] {
  if (frets && tuning) {
    return frets.map((f,i)=>{
      if(f<0) return null;
      const pc = getNoteIndex(tuning[i]); if(pc===-1) return null;
      return Tone.Frequency(( OPEN_MIDI[tuning[i]] ?? pc+48 )+f,'midi').toNote();
    }).filter(Boolean) as string[];
  }
  const p = parseChord(name); if(!p) return [];
  const root = getNoteIndex(p.root);
  const out: string[] = [`${PC[root]}2`];
  let oct=3;
  for(const pc of p.noteIndices.slice(0,4)){ if(pc<root) oct++; out.push(`${PC[pc]}${oct}`); }
  return out.slice(0,5);
}

// ── Synths (lazy-init, zero network) ─────────────────────────────────────────
let harmony:   Tone.PolySynth|null = null;
let kick:      Tone.MembraneSynth|null = null;
let snare:     Tone.NoiseSynth|null = null;
let hihat:     Tone.MetalSynth|null = null;
let tamborim:  Tone.MetalSynth|null = null;
let surdo:     Tone.MembraneSynth|null = null;
let ready = false;

function initSynths() {
  if(ready) return;
  const reverb = new Tone.Reverb({decay:1.4, wet:0.18}).toDestination();
  const comp   = new Tone.Compressor(-18, 4).connect(reverb);

  // Rhodes-like FM electric piano
  harmony = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3.5, modulationIndex: 12,
    oscillator:         {type:'sine'},
    envelope:           {attack:0.002, decay:0.6, sustain:0.2, release:2.0},
    modulation:         {type:'sine'},
    modulationEnvelope: {attack:0.002, decay:0.3, sustain:0.0, release:1.0},
    volume: -5,
  } as any).connect(comp);

  kick = new Tone.MembraneSynth({
    pitchDecay:0.06, octaves:8,
    oscillator:{type:'sine'},
    envelope:{attack:0.001, decay:0.32, sustain:0, release:0.08},
    volume:-3,
  }).toDestination();

  const snareHP = new Tone.Filter(1800,'highpass').toDestination();
  snare = new Tone.NoiseSynth({
    noise:{type:'white'},
    envelope:{attack:0.001, decay:0.14, sustain:0, release:0.04},
    volume:-9,
  }).connect(snareHP);

  hihat = new Tone.MetalSynth({
    frequency:500, harmonicity:5.1, modulationIndex:32,
    resonance:4000, octaves:1.5,
    envelope:{attack:0.001, decay:0.07, release:0.01},
    volume:-17,
  }).toDestination();

  tamborim = new Tone.MetalSynth({
    frequency:950, harmonicity:9, modulationIndex:20,
    resonance:5500, octaves:0.5,
    envelope:{attack:0.001, decay:0.04, release:0.01},
    volume:-15,
  }).toDestination();

  surdo = new Tone.MembraneSynth({
    pitchDecay:0.09, octaves:5,
    oscillator:{type:'sine'},
    envelope:{attack:0.001, decay:0.55, sustain:0, release:0.1},
    volume:-2,
  }).toDestination();

  ready = true;
}

function triggerDrum(drum:Drum, time:number, vel:number) {
  switch(drum){
    case 'kick':     kick?.triggerAttackRelease('C1','8n',time,vel); break;
    case 'snare':    snare?.triggerAttackRelease('8n',time,vel); break;
    case 'hihat':    hihat?.triggerAttackRelease(time,vel); break;
    case 'tamborim': tamborim?.triggerAttackRelease(time,vel); break;
    case 'surdo':    surdo?.triggerAttackRelease('G0','4n',time,vel); break;
  }
}

// ── Playback ──────────────────────────────────────────────────────────────────
export async function startPlayback(
  measures:Measure[], style:Style, bpm:number,
  metronome:boolean, mode:AudioMode,
  voicings:Record<string,{frets:number[];tuning:string[]}>,
  onMeasure:(i:number)=>void, loop=true
) {
  await Tone.start();
  initSynths();
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  Tone.getTransport().bpm.value = bpm;
  Tone.getTransport().swing = style==='jazz'?0.5:0;
  Tone.getTransport().swingSubdivision='8n';

  const beatSec=60/bpm, barSec=beatSec*4, eighthSec=beatSec/2;

  measures.forEach((measure,mi)=>{
    const barStart=mi*barSec;
    Tone.getTransport().schedule(()=>onMeasure(mi), barStart);

    if(metronome){
      for(let b=0;b<4;b++){
        Tone.getTransport().schedule(t=>{
          triggerDrum(b===0?'surdo':'hihat',t, b===0?0.6:0.3);
        }, barStart+b*beatSec);
      }
    }

    if(mode!=='harmony'){
      PERC[style].forEach(({drum,pos,vel})=>{
        Tone.getTransport().schedule(t=>triggerDrum(drum,t,vel), barStart+pos*eighthSec);
      });
    }

    if(mode!=='percussion'){
      let cursor=0;
      for(const beat of measure.beats){
        const slotStart=barStart+cursor*beatSec;
        const slotEnd=slotStart+beat.durationBeats*beatSec;
        const v=voicings[beat.chordName];
        const freqs=chordToFreqs(beat.chordName,v?.frets,v?.tuning);
        const upper=freqs.slice(1);

        COMP[style].forEach(({time,type,vel})=>{
          const t=slotStart+time*beatSec; if(t>=slotEnd) return;
          const notes=type==='upper'?upper:freqs; if(!notes.length) return;
          // Strum effect: offset each note 18ms apart
          notes.forEach((note,ni)=>{
            Tone.getTransport().schedule(abs=>{
              harmony?.triggerAttackRelease(note,'8n',abs+(ni*0.018),vel+(Math.random()-0.5)*0.05);
            },t);
          });
        });
        cursor+=beat.durationBeats;
      }
    }
  });

  if(loop&&measures.length>0){
    Tone.getTransport().loopStart=0;
    Tone.getTransport().loopEnd=measures.length*barSec;
    Tone.getTransport().loop=true;
  }
  Tone.getTransport().start();
}

export function stopPlayback(){
  Tone.getTransport().stop(); Tone.getTransport().cancel(); harmony?.releaseAll();
}
export function setBpm(bpm:number){ Tone.getTransport().bpm.value=bpm; }
export function isLoaded(){ return ready; }
