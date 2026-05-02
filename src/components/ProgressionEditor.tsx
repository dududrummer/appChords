import { useState, useCallback, useMemo } from 'react';
import { Music2, Grid3X3, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseProgression, uniqueChords, type Measure } from '@/lib/progression';
import { analyseProgression, type HarmonicAnalysis } from '@/lib/harmony';
import { INSTRUMENT_PRESETS } from '@/lib/music-theory';
import { ProgressionGrid } from './ProgressionGrid';
import { ChordDictionary } from './ChordDictionary';
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

  const handleVoicingSelect = useCallback((chordName: string, voicing: StoredVoicing) => {
    setVoicings(prev => ({ ...prev, [chordName]: voicing }));
  }, []);

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

        {/* Tabs: Progressão | Dicionário */}
        <Tabs defaultValue="progression">
          <TabsList className="w-full">
            <TabsTrigger value="progression" className="flex-1 gap-1.5">
              <Grid3X3 className="h-4 w-4" /> Progressão
            </TabsTrigger>
            <TabsTrigger value="dictionary" className="flex-1 gap-1.5">
              <BookOpen className="h-4 w-4" /> Dicionário de Acordes
            </TabsTrigger>
          </TabsList>

          {/* ── Aba Progressão ── */}
          <TabsContent value="progression" className="pt-3 space-y-6">
            {/* Grade harmônica */}
            <ProgressionGrid
              measures={measures}
              analysis={analysis}
              activeMeasure={null}
              voicings={voicings}
              stringCount={stringCount}
              markerColor={markerColor}
              primaryColor={primaryColor}
            />


            {/* Separador */}
            {measures.length > 0 && (
              <div className="border-t pt-4">
                <PercussionPlayers />
              </div>
            )}
          </TabsContent>

          {/* ── Aba Dicionário ── */}
          <TabsContent value="dictionary" className="pt-3">
            <ChordDictionary
              chordNames={chordNames}
              instrument={instrument}
              stringNames={stringNames}
              stringCount={stringCount}
              markerColor={markerColor}
              primaryColor={primaryColor}
              voicings={voicings}
              onVoicingSelect={handleVoicingSelect}
            />
          </TabsContent>
        </Tabs>

      </CardContent>
    </Card>
  );
}
