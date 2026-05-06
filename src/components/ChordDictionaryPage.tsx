/**
 * Standalone Chord Dictionary page — displayed as a sidebar tab.
 * Lets users type any chord name and browse all available voicings.
 */
import { useState, useCallback } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseChord, INSTRUMENT_PRESETS } from '@/lib/music-theory';
import { searchVoicings } from '@/lib/voicing-search';
import type { Voicing } from '@/lib/chord-finder';
import { VoicingMiniSvg } from './VoicingMiniSvg';

interface Props {
  instrument: string;
  stringCount: number;
  stringNames: string[];
  markerColor: string;
  primaryColor: string;
  onInstrumentChange: (instrument: string) => void;
}

export function ChordDictionaryPage({
  instrument, stringCount, stringNames,
  markerColor, primaryColor, onInstrumentChange,
}: Props) {
  const [query, setQuery] = useState('');
  const [voicings, setVoicings] = useState<Voicing[]>([]);
  const [parsedName, setParsedName] = useState('');
  const [error, setError] = useState('');

  const getActiveTuning = useCallback((): string[] => {
    const filled = stringNames.slice(0, stringCount).filter(n => n.trim());
    if (filled.length === stringCount) return stringNames.slice(0, stringCount);
    return INSTRUMENT_PRESETS[instrument]?.tuning ?? INSTRUMENT_PRESETS.cavaquinho.tuning;
  }, [stringNames, stringCount, instrument]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setError('');

    if (!value.trim()) { setVoicings([]); setParsedName(''); return; }

    const parsed = parseChord(value);
    if (!parsed) {
      setError(`Acorde "${value}" não reconhecido. Ex: C, Am, G7, F#m7`);
      setVoicings([]); setParsedName(''); return;
    }

    setParsedName(`${parsed.displayName} — ${parsed.qualityName}`);
    const tuning = getActiveTuning();
    const results = searchVoicings(value.trim(), { instrument, tuning });

    if (results.length === 0) {
      setError('Nenhuma posição encontrada. Verifique a afinação das cordas.');
      setVoicings([]); return;
    }
    setVoicings(results);
  }, [getActiveTuning, instrument]);

  const activeTuning = getActiveTuning();
  const isSmallInstrument = (INSTRUMENT_PRESETS[instrument]?.strings ?? 6) <= 4;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Dicionário de Acordes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instrument selector */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <Label>Instrumento</Label>
            <Select value={instrument} onValueChange={v => onInstrumentChange(v)}>
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
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Afinação ativa</Label>
            <div className="flex gap-1">
              {activeTuning.map((n, i) => (
                <span key={i} className="rounded bg-muted px-2 py-1 text-xs font-mono font-bold">{n}</span>
              ))}
            </div>
          </div>
          {/* Removed omission badge */}
        </div>

        {/* Search input */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1 flex-1 min-w-48">
            <Label>Nome do acorde</Label>
            <Input
              placeholder="Ex: Am, G7, F#m7, C7b9..."
              value={query}
              onChange={e => handleSearch(e.target.value)}
              className="font-mono text-base"
            />
          </div>
        </div>

        {/* Status */}
        {parsedName && (
          <p className="text-sm font-medium text-primary">{parsedName} — {voicings.length} posição(ões)</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Voicing grid */}
        {voicings.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Diagramas de posições disponíveis
            </Label>
            <div className="flex flex-wrap gap-4 pt-2">
              {voicings.map((v, i) => (
                <div
                  key={i}
                  className="rounded-lg border-2 border-border bg-white dark:bg-zinc-900 hover:border-primary/50 transition-all hover:scale-105"
                  title={`Traste ${v.startingFret}: ${v.frets.map(f => f === -1 ? 'X' : f).join('-')}`}
                >
                  <VoicingMiniSvg
                    voicing={v}
                    stringCount={activeTuning.length}
                    markerColor={markerColor}
                    primaryColor={primaryColor}
                    width={88}
                    height={120}
                  />
                  <div className="text-[10px] text-center text-muted-foreground pb-1 px-1">
                    {v.frets.map(f => f === -1 ? 'X' : f).join(' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
