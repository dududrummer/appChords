/**
 * Shared voicing-search utility.
 * Used by ChordSearch, ChordDictionary AND ProgressionEditor for auto-voicing.
 */
import { parseChord, INSTRUMENT_PRESETS } from './music-theory';
import { findVoicings, type Voicing } from './chord-finder';

type DictEntry = { chordName: string; frets: number[] };
type DictType = Record<string, DictEntry[]>;

// Lazy-load dictionaries so every consumer shares the same data
let _cavaquinhoDict: DictType | null = null;
async function getCavaquinhoDict(): Promise<DictType> {
  if (!_cavaquinhoDict) {
    const mod = await import('@/config/cavaquinho-dictionary.json');
    _cavaquinhoDict = mod.default as DictType;
  }
  return _cavaquinhoDict;
}

// Synchronous import for consumers that need it right away
import cavaquinhoDictRaw from '@/config/cavaquinho-dictionary.json';
const DICTIONARIES: Record<string, DictType> = {
  cavaquinho: cavaquinhoDictRaw as DictType,
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function getRegion(sf: number): number {
  if (sf <= 3) return 1;
  if (sf <= 6) return 2;
  if (sf <= 9) return 3;
  return 4;
}

function dictEntryToVoicing(c: DictEntry): Voicing {
  const pressed = c.frets.filter(f => f > 0);
  const startingFret = pressed.length > 0 ? Math.min(...pressed) : 1;
  return {
    frets: c.frets,
    startingFret,
    barres: [],
    mutedStrings: c.frets.map((f, i) => (f === -1 ? i : -1)).filter(i => i !== -1),
    omitted: [],
    fingerCount: pressed.length,
  };
}

function mergeAndGroupByRegion(
  dictVoicings: Voicing[],
  baseResults: Voicing[],
  maxPerRegion = 4,
): Voicing[] {
  const dictFretStrings = new Set(dictVoicings.map(v => v.frets.join(',')));
  const others = baseResults.filter(v => !dictFretStrings.has(v.frets.join(',')));
  const allVoicings = [...dictVoicings, ...others];

  const regionMap: Record<number, Voicing[]> = { 1: [], 2: [], 3: [], 4: [] };
  allVoicings.forEach(v => {
    const reg = getRegion(v.startingFret);
    if (regionMap[reg] && regionMap[reg].length < maxPerRegion) {
      regionMap[reg].push(v);
    }
  });
  return [...regionMap[1], ...regionMap[2], ...regionMap[3], ...regionMap[4]];
}

// ── Public: get all voicings for a chord name ───────────────────────────────
export interface SearchVoicingsOptions {
  instrument: string;
  tuning: string[];
  maxPerRegion?: number;
}

export function searchVoicings(
  chordName: string,
  opts: SearchVoicingsOptions,
): Voicing[] {
  const { instrument, tuning, maxPerRegion = 4 } = opts;
  const parsed = parseChord(chordName);
  if (!parsed) return [];

  const smallInstrument = (INSTRUMENT_PRESETS[instrument]?.strings ?? 6) <= 4;

  const baseResults = findVoicings(parsed.noteIndices, tuning, {
    maxFret: 12,
    maxResults: smallInstrument ? 48 : 24,
    maxInternalResults: smallInstrument ? 150 : 200,
    allowOmissions: smallInstrument,
    allowMuted: !smallInstrument,
    rootNoteIndex: parsed.noteIndices[0],
    bassNoteIndex: smallInstrument
      ? parsed.bassNoteIndex
      : (parsed.bassNoteIndex ?? parsed.noteIndices[0]),
    minBarreStrings: smallInstrument ? 3 : 4,
  });

  const activeDict = DICTIONARIES[instrument];
  if (activeDict && activeDict[chordName]) {
    const dictVoicings = activeDict[chordName].map(dictEntryToVoicing);
    return mergeAndGroupByRegion(dictVoicings, baseResults, maxPerRegion);
  }

  // Fallback: group algorithmic results by region
  return mergeAndGroupByRegion([], baseResults, maxPerRegion);
}

// ── Public: pick the best default voicing (region 1 priority) ───────────────
export function pickDefaultVoicing(
  chordName: string,
  opts: SearchVoicingsOptions,
): Voicing | null {
  const all = searchVoicings(chordName, opts);
  if (all.length === 0) return null;

  // Prefer region 1 (frets 1-3), then lowest startingFret
  const region1 = all.filter(v => getRegion(v.startingFret) === 1);
  if (region1.length > 0) return region1[0];
  return all[0];
}

// ── Public: resolve auto-voicings for a list of chord names ─────────────────
export function resolveAutoVoicings(
  chordNames: string[],
  opts: SearchVoicingsOptions,
): Record<string, Voicing> {
  const result: Record<string, Voicing> = {};
  for (const name of chordNames) {
    const v = pickDefaultVoicing(name, opts);
    if (v) result[name] = v;
  }
  return result;
}
