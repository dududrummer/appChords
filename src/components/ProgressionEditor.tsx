import { useState, useCallback, useMemo } from 'react';
import { Music2, Grid3X3, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { parseProgression, uniqueChords, type Measure } from '@/lib/progression';
import { analyseProgression, type HarmonicAnalysis } from '@/lib/harmony';
import { ProgressionGrid } from './ProgressionGrid';
import { ProgressionAudio } from './ProgressionAudio';
import { ChordDictionary } from './ChordDictionary';
import type { Voicing } from '@/lib/chord-finder';

interface StoredVoicing extends Voicing { tuning: string[] }

interface Props {
  instrument: string;
  stringCount: number;
  stringNames: string[];
  markerColor: string;
  primaryColor: string;
}

const EXAMPLE = 'C7M | Em7 | Gm7 C7 | F7M Fm6 | Em7 A7 | D7 | Dm7 G7 | C7M';

export function ProgressionEditor({
  instrument, stringCount, stringNames, markerColor, primaryColor
}: Props) {
  const [input, setInput]               = useState(EXAMPLE);
  const [activeMeasure, setActiveMeasure] = useState<number | null>(null);
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
        {/* Input */}
        <div className="space-y-1.5">
          <Label>
            Progressão{' '}
            <span className="text-xs text-muted-foreground font-normal">
              — use <code className="bg-muted px-1 rounded">|</code> para separar compassos,{' '}
              <code className="bg-muted px-1 rounded">||</code> para 2 compassos, espaço entre acordes no mesmo compasso
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

        {/* Tabs */}
        <Tabs defaultValue="progression">
          <TabsList className="w-full">
            <TabsTrigger value="progression" className="flex-1 gap-1.5">
              <Grid3X3 className="h-4 w-4" /> Progressão
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex-1 gap-1.5">
              <Music2 className="h-4 w-4" /> Áudio
            </TabsTrigger>
            <TabsTrigger value="dictionary" className="flex-1 gap-1.5">
              <BookOpen className="h-4 w-4" /> Dicionário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progression" className="pt-3">
            <ProgressionGrid
              measures={measures}
              analysis={analysis}
              activeMeasure={activeMeasure}
            />
          </TabsContent>

          <TabsContent value="audio" className="pt-3">
            <ProgressionAudio
              measures={measures}
              voicings={voicings}
              onMeasureChange={setActiveMeasure}
            />
          </TabsContent>

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
