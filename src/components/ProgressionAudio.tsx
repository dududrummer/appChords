import { useState, useCallback, useEffect } from 'react';
import { Play, Square, Volume2, Music, Drum } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { startPlayback, stopPlayback, setBpm, type Style, type AudioMode } from '@/lib/audio';
import type { Measure } from '@/lib/progression';
import type { Voicing } from '@/lib/chord-finder';

interface StoredVoicing extends Voicing { tuning: string[] }

interface Props {
  measures: Measure[];
  voicings: Record<string, StoredVoicing>;
  onMeasureChange: (idx: number | null) => void;
}

const STYLES: { value: Style; label: string; desc: string }[] = [
  { value: 'samba',     label: '🥁 Samba',     desc: 'Batucada + comping sincopado' },
  { value: 'jazz',      label: '🎷 Jazz',      desc: 'Swing + ride + comping no 2 e 4' },
  { value: 'bossanova', label: '🎸 Bossa Nova', desc: 'Rimshot + padrão João Gilberto' },
];

const MODES: { value: AudioMode; label: string; icon: React.ReactNode }[] = [
  { value: 'both',      label: 'Harmonia + Percussão', icon: <><Music className="h-3.5 w-3.5" /><Drum className="h-3.5 w-3.5" /></> },
  { value: 'harmony',   label: 'Só Harmonia',          icon: <Music className="h-3.5 w-3.5" /> },
  { value: 'percussion',label: 'Só Percussão',         icon: <Drum className="h-3.5 w-3.5" /> },
];

export function ProgressionAudio({ measures, voicings, onMeasureChange }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [style, setStyle]         = useState<Style>('samba');
  const [mode, setMode]           = useState<AudioMode>('both');
  const [bpm, setBpmState]        = useState(110);
  const [metronome, setMetronome] = useState(false);
  const [loop, setLoop]           = useState(true);

  useEffect(() => () => { stopPlayback(); }, []);

  const handlePlay = useCallback(async () => {
    if (measures.length === 0) return;
    const vm: Record<string, { frets: number[]; tuning: string[] }> = {};
    for (const [k, v] of Object.entries(voicings)) vm[k] = { frets: v.frets, tuning: v.tuning };

    await startPlayback(measures, style, bpm, metronome, mode, vm, (idx) => onMeasureChange(idx), loop);
    setIsPlaying(true);
  }, [measures, style, bpm, metronome, mode, voicings, loop, onMeasureChange]);

  const handleStop = useCallback(() => {
    stopPlayback(); setIsPlaying(false); onMeasureChange(null);
  }, [onMeasureChange]);

  const handleBpm = useCallback((val: number[]) => {
    setBpmState(val[0]); if (isPlaying) setBpm(val[0]);
  }, [isPlaying]);

  return (
    <div className="space-y-5">

      {/* Style */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Estilo rítmico</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {STYLES.map(s => (
            <button
              key={s.value}
              onClick={() => setStyle(s.value)}
              className={`rounded-lg border-2 p-3 text-left transition-all ${
                style === s.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold text-sm">{s.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode: harmony / percussion / both */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">O que tocar</Label>
        <ToggleGroup type="single" value={mode} onValueChange={v => v && setMode(v as AudioMode)} className="flex gap-2 flex-wrap">
          {MODES.map(m => (
            <ToggleGroupItem key={m.value} value={m.value} className="flex-1 gap-1.5 text-xs">
              {m.icon} {m.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-[11px] text-muted-foreground">
          {mode === 'percussion' ? '💡 Ideal para treinar improvisação sobre a levada.' :
           mode === 'harmony'    ? '💡 Só a progressão harmônica, sem percussão.' :
                                   '💡 Harmonia e levada juntos.'}
        </p>
      </div>

      {/* BPM */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold">Andamento (metrônomo)</Label>
          <span className="font-mono font-bold tabular-nums">{bpm} BPM</span>
        </div>
        <Slider min={40} max={280} step={1} value={[bpm]} onValueChange={handleBpm} />
        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
          <span>40 Lento</span><span>|</span><span>120 Moderado</span><span>|</span><span>280 Rápido</span>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-5">
        <div className="flex items-center gap-2">
          <Switch id="metro" checked={metronome} onCheckedChange={setMetronome} />
          <Label htmlFor="metro" className="cursor-pointer flex items-center gap-1 text-sm">
            <Volume2 className="h-4 w-4" /> Metrônomo
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="loop" checked={loop} onCheckedChange={setLoop} />
          <Label htmlFor="loop" className="cursor-pointer text-sm">Loop</Label>
        </div>
      </div>

      {/* Play / Stop */}
      <Button
        onClick={isPlaying ? handleStop : handlePlay}
        disabled={measures.length === 0}
        className="w-full text-base py-5"
        variant={isPlaying ? 'destructive' : 'default'}
        size="lg"
      >
        {isPlaying
          ? <><Square className="h-5 w-5 mr-2" /> Parar</>
          : <><Play  className="h-5 w-5 mr-2" /> Reproduzir</>}
      </Button>

      {isPlaying && (
        <div className="text-center space-y-1">
          <p className="text-sm font-medium animate-pulse">
            {STYLES.find(s => s.value === style)?.label} · {bpm} BPM
          </p>
          <p className="text-xs text-muted-foreground">{MODES.find(m => m.value === mode)?.label}</p>
        </div>
      )}
    </div>
  );
}
