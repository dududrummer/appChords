import { useState, useCallback, useRef } from 'react';
import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AUDIO_LOOPS, availableBpms, findLoop, type LoopStyle } from '@/config/audio-loops';

// Group definitions — add more as files become available
const GROUPS: { style: LoopStyle; title: string; emoji: string }[] = [
  { style: 'batucada',    title: 'Batucada de Samba e Pagode', emoji: '🥁' },
  { style: 'sambaenredo', title: 'Samba Enredo',               emoji: '🎺' },
  { style: 'jazz',        title: 'Jazz',                       emoji: '🎷' },
  { style: 'bossanova',   title: 'Bossa Nova',                 emoji: '🎸' },
  // { style: 'blues', title: 'Blues', emoji: '🎵' },
  // { style: 'pop',   title: 'Pop',   emoji: '🎤' },
];

// Only show groups that have at least one registered file
const activeGroups = GROUPS.filter(g => availableBpms(g.style).length > 0);

export function PercussionPlayers() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeStyle, setActiveStyle] = useState<LoopStyle | null>(null);
  const [activeBpm,   setActiveBpm]   = useState<number | null>(null);
  const [selectedBpm, setSelectedBpm] = useState<Partial<Record<LoopStyle, string>>>({});

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setActiveStyle(null);
    setActiveBpm(null);
  }, []);

  const play = useCallback((style: LoopStyle) => {
    const bpmStr = selectedBpm[style];
    if (!bpmStr) return;
    const bpm = Number(bpmStr);
    const entry = findLoop(style, bpm);
    if (!entry) return;

    // Stop current if any
    stop();

    const audio = new Audio(`/audio/loops/${entry.file}`);
    audio.loop = true;
    audio.volume = 0.9;
    audio.play().catch(e => console.warn('Audio error:', e));
    audioRef.current = audio;
    setActiveStyle(style);
    setActiveBpm(entry.bpm);
  }, [selectedBpm, stop]);

  const togglePlay = useCallback((style: LoopStyle) => {
    if (activeStyle === style) { stop(); } else { play(style); }
  }, [activeStyle, play, stop]);

  if (activeGroups.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <p className="text-sm font-semibold text-foreground">🎶 Levadas de Percussão</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeGroups.map(({ style, title, emoji }) => {
          const bpms    = availableBpms(style);
          const playing = activeStyle === style;

          return (
            <div key={style} className={`rounded-xl border-2 p-4 transition-all ${
              playing ? 'border-primary bg-primary/5' : 'border-border'
            }`}>
              <p className="font-semibold text-sm mb-3">
                {emoji} {title}
                {playing && activeBpm && (
                  <span className="ml-2 text-[10px] bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-mono animate-pulse">
                    ♩ {activeBpm} BPM
                  </span>
                )}
              </p>

              <div className="flex gap-2 items-center">
                <Select
                  value={selectedBpm[style] ?? ''}
                  onValueChange={val => setSelectedBpm(prev => ({ ...prev, [style]: val }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Escolha o andamento…" />
                  </SelectTrigger>
                  <SelectContent>
                    {bpms.map(bpm => (
                      <SelectItem key={bpm} value={String(bpm)}>
                        {bpm} BPM
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="icon"
                  variant={playing ? 'destructive' : 'default'}
                  disabled={!selectedBpm[style]}
                  onClick={() => togglePlay(style)}
                  className="shrink-0"
                >
                  {playing ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
