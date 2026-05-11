import { useState, useCallback, useMemo, useEffect } from 'react';
import { Music2, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseProgression, uniqueChords, type Measure } from '@/lib/progression';
import { analyseProgression, type HarmonicAnalysis } from '@/lib/harmony';
import { INSTRUMENT_PRESETS } from '@/lib/music-theory';
import { resolveAutoVoicings, searchVoicings } from '@/lib/voicing-search';
import {
  PROGRESSION_TEMPLATES, KEY_OPTIONS, CATEGORIES,
  transposeDegrees, type Category,
} from '@/lib/degree-progressions';
import { ProgressionGrid } from './ProgressionGrid';
import { PercussionPlayers } from './PercussionPlayers';
import type { Voicing } from '@/lib/chord-finder';
import { startPlayback, stopPlayback, setBpm as setAudioBpm } from '@/lib/audio';

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
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedKey, setSelectedKey]           = useState('');
  const [input, setInput]                       = useState('');
  const [voicings, setVoicings]                 = useState<Record<string, StoredVoicing>>({});
  
  const [isPlaying, setIsPlaying]               = useState(false);
  const [activeMeasure, setActiveMeasure]       = useState<number | null>(null);
  const [bpm, setBpm]                           = useState(90);

  // Stop playback on unmount
  useEffect(() => {
    return () => { stopPlayback(); };
  }, []);

  const measures: Measure[] = useMemo(() => parseProgression(input), [input]);
  const analysis: HarmonicAnalysis | null = useMemo(
    () => (measures.length > 0 ? analyseProgression(measures) : null),
    [measures]
  );
  const chordNames = useMemo(() => uniqueChords(measures), [measures]);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      stopPlayback();
      setIsPlaying(false);
      setActiveMeasure(null);
    } else {
      if (measures.length === 0) return;
      setIsPlaying(true);
      try {
        await startPlayback(
          measures,
          "metronome",
          bpm,
          true,
          "harmony",
          voicings,
          (mi) => setActiveMeasure(mi),
          true
        );
      } catch (err) {
        console.error(err);
        setIsPlaying(false);
      }
    }
  }, [isPlaying, measures, bpm, voicings]);

  // Templates filtered by selected category
  const filteredTemplates = useMemo(
    () =>
      selectedCategory
        ? PROGRESSION_TEMPLATES.filter((t) => t.category === selectedCategory)
        : [],
    [selectedCategory]
  );

  // Reset template when category changes
  useEffect(() => {
    setSelectedTemplate("");
  }, [selectedCategory]);

  // Transpose when template + key are both set
  useEffect(() => {
    if (!selectedTemplate || !selectedKey) return;
    const tpl = PROGRESSION_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (!tpl) return;
    const transposed = transposeDegrees(tpl.degrees, selectedKey);
    setInput(transposed);
    setVoicings({});
  }, [selectedTemplate, selectedKey]);

  const getActiveTuning = useCallback((): string[] => {
    const filled = stringNames.slice(0, stringCount).filter(n => n.trim());
    if (filled.length === stringCount) return stringNames.slice(0, stringCount);
    return INSTRUMENT_PRESETS[instrument]?.tuning ?? INSTRUMENT_PRESETS.cavaquinho.tuning;
  }, [stringNames, stringCount, instrument]);

  // Auto-voicing
  useEffect(() => {
    const tuning = getActiveTuning();
    const auto = resolveAutoVoicings(chordNames, { instrument, tuning });
    setVoicings(prev => {
      const next: Record<string, StoredVoicing> = {};
      for (const name of chordNames) {
        next[name] = prev[name] ?? (auto[name] ? { ...auto[name], tuning } : prev[name]);
      }
      return next;
    });
  }, [chordNames, instrument, getActiveTuning]);

  const getVoicingsForChord = useCallback((chordName: string): Voicing[] => {
    return searchVoicings(chordName, { instrument, tuning: getActiveTuning() });
  }, [getActiveTuning, instrument]);

  const handleVoicingSelect = useCallback((chordName: string, voicing: Voicing) => {
    setVoicings(prev => ({ ...prev, [chordName]: { ...voicing, tuning: getActiveTuning() } }));
  }, [getActiveTuning]);

  const selectedTpl = PROGRESSION_TEMPLATES.find(t => t.id === selectedTemplate);

  // Separate keys for grouped display
  const majorKeys = KEY_OPTIONS.filter(k => !k.isMinor);
  const minorKeys = KEY_OPTIONS.filter(k => k.isMinor);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Music2 className="h-5 w-5" /> Estudo de Sequências
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Instrumento */}
        <div className="flex items-center gap-3">
          <Label className="shrink-0">Instrumento</Label>
          <Select value={instrument} onValueChange={v => onInstrumentChange?.(v)}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(INSTRUMENT_PRESETS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 1️⃣ Categoria — botões */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Sequências</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                    : 'bg-card border-border hover:border-primary/50 hover:bg-muted text-muted-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2️⃣ Sequência + Tom (aparecem após escolher categoria) */}
        {selectedCategory && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Sequência</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredTemplates.map(tpl => (
                    <SelectItem key={tpl.id} value={tpl.id} className="font-mono text-xs">
                      {tpl.degreesClean}
                    </SelectItem>
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
                  <SelectItem value="_sep_maj" disabled>── Maiores ──</SelectItem>
                  {majorKeys.map(k => (
                    <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                  ))}
                  <SelectItem value="_sep_min" disabled>── Menores ──</SelectItem>
                  {minorKeys.map(k => (
                    <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Graus da sequência selecionada */}
        {selectedTpl && (
          <div className="rounded-md bg-muted/50 px-3 py-2 text-xs font-mono text-muted-foreground">
            <span className="font-semibold text-foreground">Graus:</span> {selectedTpl.degreesClean}
          </div>
        )}

        {/* Textarea editável */}
        <div className="space-y-1.5">
          <Label>
            Progressão{' '}
            <span className="text-xs text-muted-foreground font-normal">
              — use <code className="bg-muted px-1 rounded">|</code> para separar compassos
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
          activeMeasure={activeMeasure}
          voicings={voicings}
          stringCount={stringCount}
          markerColor={markerColor}
          primaryColor={primaryColor}
          getVoicingsForChord={getVoicingsForChord}
          onVoicingSelect={handleVoicingSelect}
        />

        {measures.length > 0 && (
          <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border mt-4">
            <Button
              variant={isPlaying ? "destructive" : "default"}
              className="gap-2"
              onClick={togglePlayback}
            >
              {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Parar" : "Tocar Metrônomo"}
            </Button>
            
            <div className="flex-1 max-w-[200px] flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Andamento</span>
                <span>{bpm} BPM</span>
              </div>
              <input 
                type="range" 
                min={40} max={200} step={1} 
                value={bpm} 
                onChange={e => {
                  const val = Number(e.target.value);
                  setBpm(val);
                  if (isPlaying) setAudioBpm(val);
                }}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" 
              />
            </div>
          </div>
        )}

        {measures.length > 0 && (
          <div className="border-t pt-4">
            <PercussionPlayers />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
