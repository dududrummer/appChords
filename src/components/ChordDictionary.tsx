import { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { parseChord, INSTRUMENT_PRESETS } from '@/lib/music-theory';
import { findVoicings, type Voicing } from '@/lib/chord-finder';
import cavaquinhoDictRaw from '@/config/cavaquinho-dictionary.json';

const cavaquinhoDict: Record<string, { chordName: string, frets: number[] }[]> = cavaquinhoDictRaw;

interface StoredVoicing extends Voicing {
  tuning: string[];
}

interface Props {
  chordNames: string[];
  instrument: string;
  stringNames: string[];
  stringCount: number;
  markerColor: string;
  primaryColor: string;
  voicings: Record<string, StoredVoicing>;
  onVoicingSelect: (chordName: string, voicing: StoredVoicing) => void;
}

function MiniSvg({ voicing, stringCount, markerColor, primaryColor }: {
  voicing: Voicing; stringCount: number; markerColor: string; primaryColor: string;
}) {
  const W = 72, H = 90, ml = 10, mr = 10, mt = 16, mb = 6;
  const iW = W - ml - mr, iH = H - mt - mb;
  const FRETS = 5, fretH = iH / FRETS;
  const strSp = stringCount > 1 ? iW / (stringCount - 1) : iW;
  const sx = (s: number) => ml + s * strSp;
  const sf = voicing.startingFret;
  const showNut = sf === 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      {Array.from({ length: FRETS + 1 }, (_, f) => (
        <line key={f} x1={ml} y1={mt + f * fretH} x2={ml + iW} y2={mt + f * fretH}
          stroke={primaryColor} strokeWidth={f === 0 && showNut ? 2.5 : 0.8} />
      ))}
      {Array.from({ length: stringCount }, (_, s) => (
        <line key={s} x1={sx(s)} y1={mt} x2={sx(s)} y2={mt + iH}
          stroke={primaryColor} strokeWidth={0.7} />
      ))}
      {sf > 1 && <text x={ml - 3} y={mt + fretH * 0.5} textAnchor="end" dominantBaseline="middle" fill={primaryColor} fontSize={6}>{sf}ª</text>}
      {voicing.frets.map((fret, s) => {
        if (fret === -1) return <text key={s} x={sx(s)} y={mt - 5} textAnchor="middle" fill={primaryColor} fontSize={7} fontWeight="bold">✕</text>;
        if (fret === 0)  return <circle key={s} cx={sx(s)} cy={mt - 5} r={3} fill="none" stroke={primaryColor} strokeWidth={0.8} />;
        const rel = fret - sf + 1;
        if (rel < 1 || rel > FRETS) return null;
        return <circle key={s} cx={sx(s)} cy={mt + (rel - 0.5) * fretH} r={Math.min(fretH, strSp) * 0.3} fill={markerColor} />;
      })}
      {voicing.barres.map((b, i) => {
        const rel = b.fret - sf + 1;
        if (rel < 1 || rel > FRETS) return null;
        const r = Math.min(fretH, strSp) * 0.3;
        const cy = mt + (rel - 0.5) * fretH;
        return <rect key={i} x={sx(b.startString) - r} y={cy - r}
          width={sx(b.endString) - sx(b.startString) + r * 2} height={r * 2} rx={r} fill={markerColor} />;
      })}
    </svg>
  );
}

export function ChordDictionary({
  chordNames, instrument, stringNames, stringCount,
  markerColor, primaryColor, voicings, onVoicingSelect
}: Props) {
  const [searches, setSearches] = useState<Record<string, string>>({});

  const getActiveTuning = useCallback((): string[] => {
    const filled = stringNames.slice(0, stringCount).filter(n => n.trim());
    if (filled.length === stringCount) return stringNames.slice(0, stringCount);
    return INSTRUMENT_PRESETS[instrument]?.tuning ?? INSTRUMENT_PRESETS.violao.tuning;
  }, [stringNames, stringCount, instrument]);

  const getVoicings = useCallback((chordName: string): Voicing[] => {
    const parsed = parseChord(chordName);
    if (!parsed) return [];
    const tuning = getActiveTuning();
    const smallInstrument = (INSTRUMENT_PRESETS[instrument]?.strings ?? 6) <= 4;
    const baseResults = findVoicings(parsed.noteIndices, tuning, {
      maxFret: 12, maxResults: 12,
      allowOmissions: smallInstrument,
      rootNoteIndex: parsed.noteIndices[0],
      bassNoteIndex: parsed.bassNoteIndex,
    });

    if (instrument === 'cavaquinho' && cavaquinhoDict[chordName]) {
      const dictVoicings: Voicing[] = cavaquinhoDict[chordName].map(c => {
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
      return [...dictVoicings, ...others].slice(0, 8);
    }

    return baseResults.slice(0, 8);
  }, [getActiveTuning, instrument]);

  if (chordNames.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Nenhum acorde na progressão.</p>;
  }

  return (
    <div className="space-y-6">
      {chordNames.map(name => {
        const results = getVoicings(name);
        const selected = voicings[name];
        const tuning = getActiveTuning();

        return (
          <div key={name} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold font-mono">{name}</span>
              {selected && (
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full px-2 py-0.5 font-medium">
                  ✓ Posição selecionada: {selected.frets.map(f => f === -1 ? 'X' : f).join('-')}
                </span>
              )}
            </div>

            {results.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma posição encontrada.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {results.map((v, i) => {
                  const isSelected = selected?.frets.join(',') === v.frets.join(',');
                  return (
                    <button
                      key={i}
                      onClick={() => onVoicingSelect(name, { ...v, tuning })}
                      className={`rounded-lg border-2 transition-all hover:scale-105 cursor-pointer bg-white dark:bg-zinc-900 ${
                        isSelected ? 'border-primary shadow-md scale-105' : 'border-border'
                      }`}
                      title={v.frets.map(f => f === -1 ? 'X' : f).join('-')}
                    >
                      <MiniSvg voicing={v} stringCount={tuning.length} markerColor={markerColor} primaryColor={primaryColor} />
                      <div className="text-[9px] text-center text-muted-foreground pb-1 px-1">
                        {v.frets.map(f => f === -1 ? 'X' : f).join(' ')}
                      </div>
                      {v.omitted.length > 0 && (
                        <div className="flex justify-center gap-0.5 pb-1">
                          {v.omitted.map((tag, ti) => (
                            <span key={ti} className="text-[7px] bg-amber-500 text-white rounded-full px-1">{tag}</span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
