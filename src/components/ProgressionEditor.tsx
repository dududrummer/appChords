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
import { PROGRESSION_TEMPLATES, KEY_OPTIONS, transposeDegrees } from '@/lib/degree-progressions';
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

export function ProgressionEditor({
  instrument, stringCount, stringNames, markerColor, primaryColor, onInstrumentChange
}: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedKey, setSelectedKey]           = useState('');
  const [input, setInput]                       = useState('');
  const [voicings, setVoicings]                 = useState<Record<string, StoredVoicing>>({});

  // ── When template + key change, transpose and fill the textarea ────────
  useEffect(() => {
    if (!selectedTemplate || !selectedKey) return;
    const tpl = PROGRESSION_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!tpl) return;
    const transposed = transposeDegrees(tpl.degrees, selectedKey);
    setInput(transposed);
    setVoicings({}); // reset voicings to trigger auto-voicing
  }, [selectedTemplate, selectedKey]);

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

  // ── Auto-voicing ──────────────────────────────────────────────────────────
  useEffect(() => {
    const tuning = getActiveTuning();
    const autoVoicings = resolveAutoVoicings(chordNames, { instrument, tuning });
    setVoicings(prev => {
      const next: Record<string, StoredVoicing> = {};
      for (const name of chordNames) {
        if (prev[name]) {
          next[name] = prev[name];
        } else if (autoVoicings[name]) {
          next[name] = { ...autoVoicings[name], tuning };
        }
      }
      return next;
    });
  }, [chordNames, instrument, getActiveTuning]);

  const getVoicingsForChord = useCallback((chordName: string): Voicing[] => {
    const tuning = getActiveTuning();
    return searchVoicings(chordName, { instrument, tuning });
  }, [getActiveTuning, instrument]);

  const handleVoicingSelect = useCallback((chordName: string, voicing: Voicing) => {
    const tuning = getActiveTuning();
    setVoicings(prev => ({ ...prev, [chordName]: { ...voicing, tuning } }));
  }, [getActiveTuning]);

  // ── Group templates by category ───────────────────────────────────────────
  const categories = useMemo(() => {
    const map = new Map<string, typeof PROGRESSION_TEMPLATES>();
    for (const tpl of PROGRESSION_TEMPLATES) {
      if (!map.has(tpl.category)) map.set(tpl.category, []);
      map.get(tpl.category)!.push(tpl);
    }
    return map;
  }, []);

  // Separate major and minor keys for grouped display
  const majorKeys = KEY_OPTIONS.filter(k => !k.isMinor);
  const minorKeys = KEY_OPTIONS.filter(k => k.isMinor);

  // Get the selected template's degree pattern for display
  const selectedTpl = PROGRESSION_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Music2 className="h-5 w-5" /> Estudo de Sequências
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

        {/* Seletores de sequência e tom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Sequência (graus)</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma sequência..." />
              </SelectTrigger>
              <SelectContent>
                {[...categories.entries()].map(([cat, templates]) => (
                  templates.map(tpl => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </SelectItem>
                  ))
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Tom</Label>
            <Select value={selectedKey} onValueChange={setSelectedKey}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tom..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_divider_major" disabled>── Maiores ──</SelectItem>
                {majorKeys.map(k => (
                  <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                ))}
                <SelectItem value="_divider_minor" disabled>── Menores ──</SelectItem>
                {minorKeys.map(k => (
                  <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Graus da sequência selecionada */}
        {selectedTpl && (
          <div className="rounded-md bg-muted/50 px-3 py-2 text-xs font-mono text-muted-foreground">
            <span className="font-semibold text-foreground">Graus:</span> {selectedTpl.degrees}
          </div>
        )}

        {/* Input editável */}
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
            placeholder="Selecione uma sequência e tom acima, ou digite livremente..."
            className="font-mono text-base resize-none"
            rows={2}
          />
        </div>

        {/* Grade harmônica */}
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

        {/* Percussão */}
        {measures.length > 0 && (
          <div className="border-t pt-4">
            <PercussionPlayers />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
