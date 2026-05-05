import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseChord, INSTRUMENT_PRESETS } from "@/lib/music-theory";
import { findVoicings, Voicing } from "@/lib/chord-finder";
import cavaquinhoDictRaw from '@/config/cavaquinho-dictionary.json';
import violaoDictRaw from '@/config/violao-dictionary.json';
import ukuleleDictRaw from '@/config/ukulele-dictionary.json';

type DictType = Record<string, { chordName: string, frets: number[] }[]>;
const DICTIONARIES: Record<string, DictType> = {
  cavaquinho: cavaquinhoDictRaw as DictType,
  violao: violaoDictRaw as DictType,
  ukulele: ukuleleDictRaw as DictType,
};

interface Marker { string: number; fret: number; label?: string; color?: string }
interface NutIndicator { string: number; type: "none" | "open" | "muted" }
interface Barre { fret: number; startString: number; endString: number; label?: string; color?: string }

interface ChordSearchProps {
  stringCount: number;
  stringNames: string[];
  markerColor: string;
  primaryColor: string;
  bgColor: string;
  markerShape: string;
  markerSize: number[];
  instrument: string;
  onInstrumentChange: (instrument: string) => void;
  onSelectVoicing: (data: {
    markers: Marker[];
    barres: Barre[];
    nutIndicators: NutIndicator[];
    startingFret: number;
    chordName: string;
  }) => void;
  onTuningChange: (tuning: string[], stringCount: number) => void;
}

// ── Mini SVG Chord Diagram ──────────────────────────────────────────────────
function MiniDiagram({
  voicing, stringCount, primaryColor, markerColor, bgColor, selected, onClick
}: {
  voicing: Voicing; stringCount: number; primaryColor: string;
  markerColor: string; bgColor: string; selected: boolean; onClick: () => void;
}) {
  const W = 88, H = 140;
  const ml = 14, mr = 14, mt = 22, mb = 10;
  const iW = W - ml - mr;
  const iH = H - mt - mb;
  const FRETS = 6;
  const fretH = iH / FRETS;
  const strSp = stringCount > 1 ? iW / (stringCount - 1) : iW;

  const sx = (s: number) => ml + s * strSp;
  const fy = (f: number) => mt + f * fretH;

  const startFret = voicing.startingFret;
  const showNut = startFret === 1;
  const elements: React.ReactNode[] = [];

  // Fret lines
  for (let f = 0; f <= FRETS; f++) {
    const isNut = f === 0 && showNut;
    elements.push(
      <line key={`f${f}`} x1={ml} y1={fy(f)} x2={ml + iW} y2={fy(f)}
        stroke={primaryColor} strokeWidth={isNut ? 2.5 : 1} />
    );
  }

  // String lines
  for (let s = 0; s < stringCount; s++) {
    elements.push(
      <line key={`s${s}`} x1={sx(s)} y1={mt} x2={sx(s)} y2={mt + iH}
        stroke={primaryColor} strokeWidth={0.8} />
    );
  }

  // Starting fret label
  if (startFret > 1) {
    elements.push(
      <text key="sf" x={ml - 4} y={mt + fretH * 0.5}
        textAnchor="end" dominantBaseline="middle"
        fill={primaryColor} fontSize={7}>{startFret}ª</text>
    );
  }

  // Nut indicators and dots
  for (let s = 0; s < stringCount; s++) {
    const fret = voicing.frets[s];
    const cx = sx(s);
    if (fret === -1) {
      elements.push(
        <text key={`mut${s}`} x={cx} y={mt - 8} textAnchor="middle"
          fill={primaryColor} fontSize={9} fontWeight="bold">✕</text>
      );
    } else if (fret === 0) {
      elements.push(
        <circle key={`open${s}`} cx={cx} cy={mt - 8} r={4}
          fill="none" stroke={primaryColor} strokeWidth={1} />
      );
    } else {
      const relFret = fret - startFret + 1;
      if (relFret >= 1 && relFret <= FRETS) {
        const cy = mt + (relFret - 0.5) * fretH;
        elements.push(
          <circle key={`dot${s}`} cx={cx} cy={cy} r={Math.min(fretH, strSp) * 0.32}
            fill={markerColor} />
        );
      }
    }
  }

  // Barre
  voicing.barres.forEach((b, i) => {
    const relFret = b.fret - startFret + 1;
    if (relFret >= 1 && relFret <= FRETS) {
      const cy = mt + (relFret - 0.5) * fretH;
      const r = Math.min(fretH, strSp) * 0.32;
      elements.push(
        <rect key={`barre${i}`}
          x={sx(b.startString) - r} y={cy - r}
          width={sx(b.endString) - sx(b.startString) + r * 2}
          height={r * 2} rx={r} fill={markerColor} />
      );
    }
  });

  const hasOmissions = voicing.omitted.length > 0;

  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg border-2 transition-all hover:scale-105 cursor-pointer bg-white dark:bg-zinc-900 ${selected ? "border-primary shadow-md shadow-primary/30 scale-105" : "border-border"}`}
      title={`Traste ${voicing.startingFret}: ${voicing.frets.map(f => f === -1 ? "X" : f).join("-")}${hasOmissions ? ` (${voicing.omitted.join(", ")})` : ""}`}
    >
      {hasOmissions && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1 flex-wrap justify-center">
          {voicing.omitted.map((tag, i) => (
            <span key={i} className="rounded-full bg-amber-500 text-white text-[8px] px-1.5 py-0.5 whitespace-nowrap font-bold leading-none">
              {tag}
            </span>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ backgroundColor: "transparent" }}>
        {elements}
      </svg>
      <div className="text-center text-[10px] text-muted-foreground pb-1">
        {voicing.frets.map(f => f === -1 ? "X" : f).join(" ")}
      </div>
    </button>
  );
}

// ── Main ChordSearch Component ──────────────────────────────────────────────
export function ChordSearch({
  stringCount, stringNames, markerColor, primaryColor, bgColor,
  markerShape, markerSize, instrument, onInstrumentChange, onSelectVoicing, onTuningChange
}: ChordSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [voicings, setVoicings] = useState<Voicing[]>([]);
  const [parsedName, setParsedName] = useState("");
  const [error, setError] = useState("");

  // Auto-enable omissions for 4-string instruments
  const isSmallInstrument = INSTRUMENT_PRESETS[instrument]?.strings <= 4;

  const getActiveTuning = useCallback((): string[] => {
    const filled = stringNames.slice(0, stringCount).filter(n => n.trim());
    if (filled.length === stringCount) return stringNames.slice(0, stringCount);
    return INSTRUMENT_PRESETS[instrument]?.tuning ?? INSTRUMENT_PRESETS.violao.tuning;
  }, [stringNames, stringCount, instrument]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setSelectedIdx(null);
    setError("");

    if (!value.trim()) { setVoicings([]); setParsedName(""); return; }

    const parsed = parseChord(value);
    if (!parsed) {
      setError(`Acorde "${value}" não reconhecido. Ex: C, Am, G7, F#m7`);
      setVoicings([]); setParsedName(""); return;
    }

    setParsedName(`${parsed.displayName} — ${parsed.qualityName}`);
    const tuning = getActiveTuning();
    const isCavaquinho = INSTRUMENT_PRESETS[instrument]?.strings <= 4;

    const baseResults = findVoicings(parsed.noteIndices, tuning, {
      allowMuted: !isCavaquinho,
      maxFret: 12,
      maxResults: isCavaquinho ? 12 : 24,
      maxInternalResults: isCavaquinho ? 80 : 200,
      allowOmissions: isCavaquinho,
      rootNoteIndex: parsed.noteIndices[0],
      bassNoteIndex: isCavaquinho
        ? parsed.bassNoteIndex
        : (parsed.bassNoteIndex ?? parsed.noteIndices[0]),
      minBarreStrings: isCavaquinho ? 3 : 4,
    });

    const activeDict = DICTIONARIES[instrument];
    const searchName = value.trim();

    let finalResults = baseResults;

    if (activeDict && activeDict[searchName]) {
      const dictVoicings: Voicing[] = activeDict[searchName].map(c => {
        const pressed = c.frets.filter(f => f > 0);
        const startingFret = pressed.length > 0 ? Math.min(...pressed) : 1;
        return {
          frets: c.frets,
          startingFret,
          barres: [],
          mutedStrings: c.frets.map((f, i) => f === -1 ? i : -1).filter(i => i !== -1),
          omitted: [],
          fingerCount: pressed.length
        };
      });

      const dictFretStrings = dictVoicings.map(v => v.frets.join(','));
      const others = baseResults.filter(v => !dictFretStrings.includes(v.frets.join(',')));
      finalResults = [...dictVoicings, ...others].slice(0, 16);
    }

    if (finalResults.length === 0) {
      setError("Nenhuma posição encontrada. Verifique a afinação das cordas.");
      setVoicings([]); return;
    }
    setVoicings(finalResults);
  }, [getActiveTuning, instrument]);

  const handleSelectVoicing = useCallback((voicing: Voicing, idx: number) => {
    setSelectedIdx(idx);

    const markers: Marker[] = [];
    const nutIndicators: NutIndicator[] = [];
    const sf = voicing.startingFret;

    voicing.frets.forEach((fret, s) => {
      if (fret === 0) {
        nutIndicators.push({ string: s, type: "open" });
      } else if (fret === -1) {
        nutIndicators.push({ string: s, type: "muted" });
      } else {
        // Converte fret absoluto → relativo ao startingFret
        // Ex: startingFret=3, fret=3 → slot 1 (topo); fret=5 → slot 3
        // Assim o diagrama principal renderiza corretamente sem deslocar
        markers.push({ string: s, fret: fret - sf + 1 });
      }
    });

    // Barres também convertidos para relativos
    const barres: Barre[] = voicing.barres.map(b => ({
      fret: b.fret - sf + 1,
      startString: b.startString,
      endString: b.endString
    }));

    onSelectVoicing({ markers, barres, nutIndicators, startingFret: sf, chordName: query.trim() });
  }, [onSelectVoicing, query]);

  const handleInstrumentChange = (value: string) => {
    onInstrumentChange(value);
    const preset = INSTRUMENT_PRESETS[value];
    if (preset) onTuningChange(preset.tuning, preset.strings);
    setVoicings([]); setSelectedIdx(null); setParsedName(""); setError("");
  };

  const activeTuning = getActiveTuning();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5" /> Buscar Acorde Automaticamente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instrument + Tuning */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <Label>Instrumento</Label>
            <Select value={instrument} onValueChange={handleInstrumentChange}>
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
          {isSmallInstrument && (
            <div className="flex items-center gap-1.5 pb-1">
              <span className="rounded-full bg-amber-500 text-white text-[10px] px-2 py-0.5 font-bold">Auto</span>
              <span className="text-xs text-muted-foreground">Omissões de 5ª/fund. ativadas para instrumento de 4 cordas</span>
            </div>
          )}
        </div>

        {/* Search */}
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
          <p className="text-sm font-medium text-primary">{parsedName} — {voicings.length} posição(ões) encontrada(s)</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Voicing Grid */}
        {voicings.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Clique numa posição para carregar no diagrama principal
              {isSmallInstrument && " · Tags amarelas indicam notas omitidas"}
            </Label>
            <div className="flex flex-wrap gap-4 pt-2">
              {voicings.map((v, i) => (
                <MiniDiagram
                  key={i}
                  voicing={v}
                  stringCount={activeTuning.length}
                  primaryColor={primaryColor}
                  markerColor={markerColor}
                  bgColor={bgColor}
                  selected={selectedIdx === i}
                  onClick={() => handleSelectVoicing(v, i)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
