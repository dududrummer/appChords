import * as Tone from 'tone';
import { parseChord, getNoteIndex } from './music-theory';
import type { Measure } from './progression';

export type Style    = 'samba' | 'jazz' | 'bossanova';
export type AudioMode = 'harmony' | 'percussion' | 'both';

export const DEFAULT_BPM: Record<Style, number> = { samba: 100, jazz: 138, bossanova: 108 };
export const BPM_RANGE:   Record<Style, [number,number]> = {
  samba:[70,160], jazz:[90,240], bossanova:[70,150],
};

// ── Drum types ────────────────────────────────────────────────────────────────
type Drum =
  | 'surdo'     // Samba: surdo profundo (batida no 2 e 4)
  | 'tanta'     // Samba: tantã (complementa surdo)
  | 'repique'   // Samba: repique (chamada sincopada)
  | 'pandeiro'  // Samba: pandeiro (grave)
  | 'jingle'    // Samba: platinelas do pandeiro (shaker)
  | 'kick'      // Bossa/Jazz: bumbo
  | 'rim'       // Bossa: aro (caixa de borda)
  | 'brush'     // Jazz: vassourinha (soft noise)
  | 'ride'      // Jazz: prato de condução
  | 'snare'     // Jazz/Bossa: caixa
  | 'hihat';    // Bossa/Jazz: chimbal (foot)

interface Hit { drum: Drum; pos: number; vel: number }

// ── Patterns (8th-note grid, 0-7 em 4/4) ─────────────────────────────────────
const PERC: Record<Style, Hit[]> = {
  samba: [
    // Surdo 1 (mestre) — bate no 2 e 4
    { drum:'surdo',   pos:2, vel:0.95 }, { drum:'surdo',   pos:6, vel:0.85 },
    // Tantã — complementa no 1 e 3
    { drum:'tanta',   pos:0, vel:0.70 }, { drum:'tanta',   pos:4, vel:0.65 },
    // Repique — chamada sincopada
    { drum:'repique', pos:0, vel:0.80 }, { drum:'repique', pos:1, vel:0.55 },
    { drum:'repique', pos:3, vel:0.75 }, { drum:'repique', pos:4, vel:0.80 },
    { drum:'repique', pos:6, vel:0.70 },
    // Pandeiro (grave: punho)
    { drum:'pandeiro',pos:0, vel:0.70 }, { drum:'pandeiro',pos:4, vel:0.65 },
    // Platinelas (shimmer constante)
    { drum:'jingle',  pos:0, vel:0.35 }, { drum:'jingle',  pos:1, vel:0.28 },
    { drum:'jingle',  pos:2, vel:0.35 }, { drum:'jingle',  pos:3, vel:0.28 },
    { drum:'jingle',  pos:4, vel:0.35 }, { drum:'jingle',  pos:5, vel:0.28 },
    { drum:'jingle',  pos:6, vel:0.35 }, { drum:'jingle',  pos:7, vel:0.28 },
  ],
  bossanova: [
    // Bumbo — padrão bossa nova
    { drum:'kick',    pos:0, vel:0.72 }, { drum:'kick',    pos:3, vel:0.55 },
    { drum:'kick',    pos:5, vel:0.50 },
    // Aro — clave 3-2 (padrão João Gilberto)
    { drum:'rim',     pos:0, vel:0.82 }, { drum:'rim',     pos:2, vel:0.60 },
    { drum:'rim',     pos:3, vel:0.78 }, { drum:'rim',     pos:5, vel:0.65 },
    { drum:'rim',     pos:6, vel:0.55 },
    // Chimbal (pé) — contratempos no 2 e 4
    { drum:'hihat',   pos:2, vel:0.40 }, { drum:'hihat',   pos:6, vel:0.40 },
    // Ghost notes (contratempos suaves)
    { drum:'snare',   pos:1, vel:0.20 }, { drum:'snare',   pos:5, vel:0.20 },
  ],
  jazz: [
    // Prato de condução — todas as colcheias (swing via Transport.swing)
    { drum:'ride',    pos:0, vel:0.72 }, { drum:'ride',    pos:1, vel:0.42 },
    { drum:'ride',    pos:2, vel:0.72 }, { drum:'ride',    pos:3, vel:0.42 },
    { drum:'ride',    pos:4, vel:0.72 }, { drum:'ride',    pos:5, vel:0.42 },
    { drum:'ride',    pos:6, vel:0.72 }, { drum:'ride',    pos:7, vel:0.42 },
    // Caixa — 2 e 4
    { drum:'snare',   pos:2, vel:0.82 }, { drum:'snare',   pos:6, vel:0.82 },
    // Bumbo — feathered (suave)
    { drum:'kick',    pos:0, vel:0.50 }, { drum:'kick',    pos:4, vel:0.38 },
    // Vassourinha — textura contínua (muito suave)
    { drum:'brush',   pos:0, vel:0.22 }, { drum:'brush',   pos:1, vel:0.18 },
    { drum:'brush',   pos:2, vel:0.22 }, { drum:'brush',   pos:3, vel:0.18 },
    { drum:'brush',   pos:4, vel:0.22 }, { drum:'brush',   pos:5, vel:0.18 },
    { drum:'brush',   pos:6, vel:0.22 }, { drum:'brush',   pos:7, vel:0.18 },
  ],
};

// ── Chord comping patterns ─────────────────────────────────────────────────────
const COMP: Record<Style,{time:number;type:'full'|'upper';vel:number}[]> = {
  samba:[
    {time:0,   type:'full',  vel:0.75},{time:0.75,type:'upper',vel:0.50},
    {time:1.5, type:'upper', vel:0.55},{time:2,   type:'full', vel:0.70},
    {time:2.75,type:'upper', vel:0.50},{time:3.5, type:'upper',vel:0.48},
  ],
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

// ── Note helpers ──────────────────────────────────────────────────────────────
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
  const out: string[]=[`${PC[root]}2`];
  let oct=3;
  for(const pc of p.noteIndices.slice(0,4)){ if(pc<root) oct++; out.push(`${PC[pc]}${oct}`); }
  return out.slice(0,5);
}

// ── Synth instances ────────────────────────────────────────────────────────────
let harmony:  Tone.PolySynth|null=null;
let surdo:    Tone.MembraneSynth|null=null;
let tanta:    Tone.MembraneSynth|null=null;
let repique:  Tone.MembraneSynth|null=null;
let pandeiro: Tone.MembraneSynth|null=null;
let jingle:   Tone.MetalSynth|null=null;
let kick:     Tone.MembraneSynth|null=null;
let rim:      Tone.NoiseSynth|null=null;
let snare:    Tone.NoiseSynth|null=null;
let ride:     Tone.MetalSynth|null=null;
let brush:    Tone.NoiseSynth|null=null;
let hihat:    Tone.MetalSynth|null=null;
let ready=false;

function init() {
  if(ready) return;

  const rev  = new Tone.Reverb({decay:1.2, wet:0.15}).toDestination();
  const comp = new Tone.Compressor(-20, 4).connect(rev);

  harmony = new Tone.PolySynth(Tone.FMSynth,{
    harmonicity:3.5, modulationIndex:12,
    oscillator:{type:'sine'},
    envelope:{attack:0.002, decay:0.6, sustain:0.2, release:2.0},
    modulation:{type:'sine'},
    modulationEnvelope:{attack:0.002, decay:0.3, sustain:0, release:1.0},
    volume:-5,
  } as any).connect(comp);

  // Samba drums
  surdo    = new Tone.MembraneSynth({pitchDecay:0.09,octaves:6,envelope:{attack:0.001,decay:0.6,sustain:0,release:0.1},volume:-2}).toDestination();
  tanta    = new Tone.MembraneSynth({pitchDecay:0.05,octaves:4,envelope:{attack:0.001,decay:0.35,sustain:0,release:0.08},volume:-7}).toDestination();
  repique  = new Tone.MembraneSynth({pitchDecay:0.03,octaves:3,envelope:{attack:0.001,decay:0.18,sustain:0,release:0.05},volume:-8}).toDestination();
  pandeiro = new Tone.MembraneSynth({pitchDecay:0.04,octaves:3,envelope:{attack:0.001,decay:0.22,sustain:0,release:0.06},volume:-10}).toDestination();
  jingle   = new Tone.MetalSynth({frequency:800,harmonicity:6,modulationIndex:20,resonance:4500,octaves:0.8,envelope:{attack:0.001,decay:0.05,release:0.01},volume:-20}).toDestination();

  // Bossa/Jazz drums
  const rimHP = new Tone.Filter(3000,'highpass').toDestination();
  rim   = new Tone.NoiseSynth({noise:{type:'white'},envelope:{attack:0.001,decay:0.04,sustain:0,release:0.01},volume:-10}).connect(rimHP);
  kick  = new Tone.MembraneSynth({pitchDecay:0.06,octaves:8,envelope:{attack:0.001,decay:0.3,sustain:0,release:0.08},volume:-4}).toDestination();

  const snHP = new Tone.Filter(1800,'highpass').toDestination();
  snare = new Tone.NoiseSynth({noise:{type:'white'},envelope:{attack:0.001,decay:0.13,sustain:0,release:0.04},volume:-10}).connect(snHP);

  ride  = new Tone.MetalSynth({frequency:450,harmonicity:5.1,modulationIndex:32,resonance:4000,octaves:1.5,envelope:{attack:0.001,decay:0.4,release:0.05},volume:-18}).toDestination();

  const brLP = new Tone.Filter(4000,'lowpass').toDestination();
  brush = new Tone.NoiseSynth({noise:{type:'pink'},envelope:{attack:0.005,decay:0.18,sustain:0,release:0.08},volume:-22}).connect(brLP);

  hihat = new Tone.MetalSynth({frequency:600,harmonicity:5.1,modulationIndex:32,resonance:4000,octaves:1.5,envelope:{attack:0.001,decay:0.06,release:0.01},volume:-18}).toDestination();

  ready=true;
}

function triggerDrum(drum:Drum, t:number, vel:number) {
  switch(drum) {
    case 'surdo':    surdo?.triggerAttackRelease('C1','4n',t,vel); break;
    case 'tanta':    tanta?.triggerAttackRelease('G1','8n',t,vel); break;
    case 'repique':  repique?.triggerAttackRelease('D2','16n',t,vel); break;
    case 'pandeiro': pandeiro?.triggerAttackRelease('A1','8n',t,vel); break;
    case 'jingle':   jingle?.triggerAttackRelease(t,vel); break;
    case 'kick':     kick?.triggerAttackRelease('C1','8n',t,vel); break;
    case 'rim':      rim?.triggerAttackRelease('16n',t,vel); break;
    case 'snare':    snare?.triggerAttackRelease('8n',t,vel); break;
    case 'ride':     ride?.triggerAttackRelease(t,vel); break;
    case 'brush':    brush?.triggerAttackRelease('8n',t,vel); break;
    case 'hihat':    hihat?.triggerAttackRelease(t,vel); break;
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
  init();
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  Tone.getTransport().bpm.value=bpm;
  Tone.getTransport().swing=style==='jazz'?0.5:0;
  Tone.getTransport().swingSubdivision='8n';

  const beatSec=60/bpm, barSec=beatSec*4, eighth=beatSec/2;

  measures.forEach((measure,mi)=>{
    const barStart=mi*barSec;
    Tone.getTransport().schedule(()=>onMeasure(mi), barStart);

    if(metronome){
      for(let b=0;b<4;b++)
        Tone.getTransport().schedule(t=>triggerDrum(b===0?'surdo':'jingle',t,b===0?0.5:0.3), barStart+b*beatSec);
    }

    if(mode!=='harmony'){
      PERC[style].forEach(({drum,pos,vel})=>
        Tone.getTransport().schedule(t=>triggerDrum(drum,t,vel), barStart+pos*eighth));
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
          notes.forEach((note,ni)=>
            Tone.getTransport().schedule(abs=>
              harmony?.triggerAttackRelease(note,'8n',abs+(ni*0.018),vel+(Math.random()-0.5)*0.05), t));
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

export function stopPlayback(){ Tone.getTransport().stop(); Tone.getTransport().cancel(); harmony?.releaseAll(); }
export function setBpm(b:number){ Tone.getTransport().bpm.value=b; }
export function isLoaded(){ return ready; }
