import { useState, useCallback, useMemo, useEffect } from 'react';
import { Music2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseProgression, uniqueChords, type Measure } from '@/lib/progression';
import { analyseProgression, type HarmonicAnalysis } from '@/lib/harmony';
import { INSTRUMENT_PRESETS } from '@/lib/music-theory';
import { resolveAutoVoicings, searchVoicings } from '@/lib/voicing-search';
import { ProgressionGrid } from './ProgressionGrid';
import { PercussionPlayers } from './PercussionPlayers';
import type { Voicing } from '@/lib/chord-finder';

interface StoredVoicing extends Voicing { tuning: string[] }

interface Props {
  instrument: string;
  stringCount: number;
  stringNames: string[];
  markerColor: string;
  primaryColor: string;
  onInstrumentChange?: (instrument: string) => void;
}

const EXAMPLE = 'C7M | Em7 | Gm7 C7 | F7M Fm6 | Em7 A7 | D7 | Dm7 G7 | C7M';

export function ProgressionEditor({
  instrument, stringCount, stringNames, markerColor, primaryColor, onInstrumentChange
}: Props) {
  const [input, setInput]               = useState(EXAMPLE);
  const [voicings, setVoicings]         = useState<Record<string, StoredVoicing>>({});

  const measures: Measure[] = useMemo(() => parseProgression(input), [input]);
  const analysis: HarmonicAnalysis | null = useMemo(
    () => measures.length > 0 ? analyseProgression(measures) : null,
    [measures]
  );
  const chordNames = useMemo(() => uniqueChords(measures), [measures]);

  // ── Active tuning helper ──────────────────────────────────────────────────
  const getActiveTuning = useCallback((): string[] => {
    const filled = stringNames.slice(0, stringCount).filter(n => n.trim());
    if (filled.length === stringCount) return stringNames.slice(0, stringCount);
    return INSTRUMENT_PRESETS[instrument]?.tuning ?? INSTRUMENT_PRESETS.cavaquinho.tuning;
  }, [stringNames, stringCount, instrument]);

  // ── Auto-voicing: whenever chordNames / instrument change, pick defaults ──
  useEffect(() => {
    const tuning = getActiveTuning();
    const autoVoicings = resolveAutoVoicings(chordNames, { instrument, tuning });

    // Merge: keep user-selected voicings, fill missing with auto
    setVoicings(prev => {
      const next: Record<string, StoredVoicing> = {};
      for (const name of chordNames) {
        if (prev[name]) {
          next[name] = prev[name]; // user already chose — keep it
        } else if (autoVoicings[name]) {
          next[name] = { ...autoVoicings[name], tuning };
        }
      }
      return next;
    });
  }, [chordNames, instrument, getActiveTuning]);

  // ── Get all voicings for a specific chord (for the picker popover) ────────
  const getVoicingsForChord = useCallback((chordName: string): Voicing[] => {
    const tuning = getActiveTuning();
    return searchVoicings(chordName, { instrument, tuning });
  }, [getActiveTuning, instrument]);

  // ── Handle user selecting a specific voicing ──────────────────────────────
  const handleVoicingSelect = useCallback((chordName: string, voicing: Voicing) => {
    const tuning = getActiveTuning();
    setVoicings(prev => ({ ...prev, [chordName]: { ...voicing, tuning } }));
  }, [getActiveTuning]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Music2 className="h-5 w-5" /> Progressão de Acordes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Seletor de instrumento */}
        <div className="flex items-center gap-3">
          <Label className="shrink-0">Instrumento</Label>
          <Select value={instrument} onValueChange={v => onInstrumentChange?.(v)}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(INSTRUMENT_PRESETS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <Label>
            Progressão{' '}
            <span className="text-xs text-muted-foreground font-normal">
              — use <code className="bg-muted px-1 rounded">|</code> para separar compassos,{' '}
              <code className="bg-muted px-1 rounded">||</code> para 2 compassos
            </span>
          </Label>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ex: C7M | Em7 | Gm7 C7 | F7M"
            className="font-mono text-base resize-none"
            rows={2}
          />
        </div>

        {/* Grade harmônica com diagramas clicáveis */}
        <ProgressionGrid
          measures={measures}
          analysis={analysis}
          activeMeasure={null}
          voicings={voicings}
          stringCount={stringCount}
          markerColor={markerColor}
          primaryColor={primaryColor}
          getVoicingsForChord={getVoicingsForChord}
          onVoicingSelect={handleVoicingSelect}
        />

        {/* Separador + Percussão */}
        {measures.length > 0 && (
          <div className="border-t pt-4">
            <PercussionPlayers />
          </div>
        )}

      </CardContent>
    </Card>
  );
}
