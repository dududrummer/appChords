import { useState, useCallback, useEffect } from 'react';
import { Play, Square, Volume2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { startPlayback, stopPlayback, setBpm, type Style } from '@/lib/audio';
import type { Measure } from '@/lib/progression';
import type { Voicing } from '@/lib/chord-finder';

interface Props {
  measures: Measure[];
  voicings: Record<string, Voicing & { tuning: string[] }>;
  onMeasureChange: (idx: number | null) => void;
}

const STYLE_LABELS: Record<Style, string> = {
  samba:     '🥁 Samba',
  jazz:      '🎷 Jazz',
  bossanova: '🎸 Bossa Nova',
};

export function ProgressionAudio({ measures, voicings, onMeasureChange }: Props) {
  const [isPlaying, setIsPlaying]     = useState(false);
  const [style, setStyle]             = useState<Style>('samba');
  const [bpm, setBpmState]            = useState(120);
  const [metronome, setMetronome]     = useState(false);
  const [loop, setLoop]               = useState(true);

  useEffect(() => {
    return () => { stopPlayback(); };
  }, []);

  const handlePlay = useCallback(async () => {
    if (measures.length === 0) return;
    const voicingMap: Record<string, { frets: number[]; tuning: string[] }> = {};
    for (const [k, v] of Object.entries(voicings)) {
      voicingMap[k] = { frets: v.frets, tuning: v.tuning };
    }
    await startPlayback(measures, style, bpm, metronome, voicingMap, (idx) => {
      onMeasureChange(idx);
    }, loop);
    setIsPlaying(true);
  }, [measures, style, bpm, metronome, voicings, loop, onMeasureChange]);

  const handleStop = useCallback(() => {
    stopPlayback();
    setIsPlaying(false);
    onMeasureChange(null);
  }, [onMeasureChange]);

  const handleBpmChange = useCallback((val: number[]) => {
    setBpmState(val[0]);
    if (isPlaying) setBpm(val[0]);
  }, [isPlaying]);

  return (
    <div className="space-y-5">
      {/* Style */}
      <div className="space-y-2">
        <Label>Estilo de acompanhamento</Label>
        <ToggleGroup type="single" value={style} onValueChange={v => v && setStyle(v as Style)} className="flex gap-2 flex-wrap">
          {(Object.keys(STYLE_LABELS) as Style[]).map(s => (
            <ToggleGroupItem key={s} value={s} className="flex-1">
              {STYLE_LABELS[s]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* BPM */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="flex items-center gap-2"><Music className="h-4 w-4" /> Andamento</Label>
          <span className="text-sm font-mono font-bold tabular-nums">{bpm} BPM</span>
        </div>
        <Slider min={40} max={280} step={1} value={[bpm]} onValueChange={handleBpmChange} />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>40 — Lento</span>
          <span>120 — Moderado</span>
          <span>280 — Rápido</span>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Switch id="metro" checked={metronome} onCheckedChange={setMetronome} />
          <Label htmlFor="metro" className="cursor-pointer flex items-center gap-1">
            <Volume2 className="h-4 w-4" /> Metrônomo
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="loop" checked={loop} onCheckedChange={setLoop} />
          <Label htmlFor="loop" className="cursor-pointer">Loop</Label>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={isPlaying ? handleStop : handlePlay}
          disabled={measures.length === 0}
          className="flex-1"
          variant={isPlaying ? 'destructive' : 'default'}
        >
          {isPlaying ? <><Square className="h-4 w-4 mr-2" />Parar</> : <><Play className="h-4 w-4 mr-2" />Reproduzir</>}
        </Button>
      </div>

      {isPlaying && (
        <p className="text-xs text-center text-muted-foreground animate-pulse">
          ♩ Reproduzindo em {STYLE_LABELS[style]} a {bpm} BPM…
        </p>
      )}
    </div>
  );
}
