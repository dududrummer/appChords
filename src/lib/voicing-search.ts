/**
 * Shared voicing-search utility.
 * Used by ChordSearch, ChordDictionary AND ProgressionEditor for auto-voicing.
 *
 * Priority layers (highest → lowest):
 *   1. PRIORITY dict  — curated "the best" shapes from acordes_cavaquinho_dgbd.json
 *   2. GENERAL  dict  — full cavaquinho-dictionary.json
 *   3. ALGORITHMIC     — findVoicings() fallback for unknown chords
 *
 * Auto-voicing for progressions picks the closest priority shape to the
 * previous chord, minimising hand movement (voice leading).
 */
import { parseChord, INSTRUMENT_PRESETS } from './music-theory';
import { findVoicings, type Voicing } from './chord-finder';

type DictEntry = { chordName: string; frets: number[] };
type DictType = Record<string, DictEntry[]>;

import cavaquinhoDictRaw from '@/config/cavaquinho-dictionary.json';
import cavaquinhoPriorityRaw from '@/config/cavaquinho-priority.json';

const DICTIONARIES: Record<string, DictType> = {
  cavaquinho: cavaquinhoDictRaw as DictType,
};

const PRIORITY_DICTS: Record<string, DictType> = {
  cavaquinho: cavaquinhoPriorityRaw as DictType,
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function getRegion(sf: number): number {
  if (sf <= 3) return 1;
  if (sf <= 6) return 2;
  if (sf <= 9) return 3;
  return 4;
}

function dictEntryToVoicing(c: DictEntry, isPriority = false): Voicing {
  const pressed = c.frets.filter(f => f > 0);
  const startingFret = pressed.length > 0 ? Math.min(...pressed) : 1;
  return {
    frets: c.frets,
    startingFret,
    barres: [],
    mutedStrings: c.frets.map((f, i) => (f === -1 ? i : -1)).filter(i => i !== -1),
    omitted: [],
    fingerCount: pressed.length,
    isPriority,
  };
}

/** Calculate distance between two voicings for voice leading (minimal movement) */
function calculateVoicingDistance(v1: Voicing, v2: Voicing): number {
  let distance = 0;
  for (let i = 0; i < v1.frets.length; i++) {
    const f1 = v1.frets[i];
    const f2 = v2.frets[i];
    if (f1 === -1 || f2 === -1) {
      if (f1 === f2) continue;
      distance += 4;
    } else {
      distance += Math.abs(f1 - f2);
    }
  }
  distance += Math.abs(v1.startingFret - v2.startingFret) * 1.5;
  return distance;
}

/** Look up chord in a dictionary, trying multiple name variants */
function lookupDict(dict: DictType, chordName: string, normalizedName?: string): DictEntry[] | null {
  if (dict[chordName]) return dict[chordName];
  if (normalizedName && dict[normalizedName]) return dict[normalizedName];

  // Try BR ↔ US swaps: (4) ↔ /4, (9) ↔ /9, (b5) ↔ /b5, etc.
  const variants = [chordName, normalizedName].filter(Boolean) as string[];
  for (const name of variants) {
    // (X) → /X
    const slashForm = name.replace(/\(([^)]+)\)/g, '/$1');
    if (slashForm !== name && dict[slashForm]) return dict[slashForm];
    // /X → (X)  — only for suffixes like /4, /9, /b9 (not slash bass like C/G)
    const parenForm = name.replace(/\/(\d+|[b#]\d+|[b#]\w+)(?=$)/g, '($1)');
    if (parenForm !== name && dict[parenForm]) return dict[parenForm];
  }
  return null;
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
  const normalizedName = parsed.displayName;

  // 1. Check PRIORITY dict first
  const priorityDict = PRIORITY_DICTS[instrument];
  const priorityEntries = priorityDict ? lookupDict(priorityDict, chordName, normalizedName) : null;

  // 2. Check GENERAL dict
  const generalDict = DICTIONARIES[instrument];
  const generalEntries = generalDict ? lookupDict(generalDict, chordName, normalizedName) : null;

  // Build combined list: priority first (marked), then general (deduped)
  const priorityVoicings = (priorityEntries ?? []).map(e => dictEntryToVoicing(e, true));
  const priorityFretKeys = new Set(priorityVoicings.map(v => v.frets.join(',')));

  const generalVoicings = (generalEntries ?? [])
    .filter(e => !priorityFretKeys.has(e.frets.join(',')))
    .map(e => dictEntryToVoicing(e, false));

  const dictVoicings = [...priorityVoicings, ...generalVoicings];

  if (dictVoicings.length > 0) {
    return dictVoicings;
  }

  // 3. Fallback: algorithmic
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

  const regionMap: Record<number, Voicing[]> = { 1: [], 2: [], 3: [], 4: [] };
  baseResults.forEach(v => {
    const reg = getRegion(v.startingFret);
    if (regionMap[reg] && regionMap[reg].length < maxPerRegion) {
      regionMap[reg].push(v);
    }
  });
  return [...regionMap[1], ...regionMap[2], ...regionMap[3], ...regionMap[4]];
}

// ── Public: pick the best default voicing (lowest position, priority first) ─
export function pickDefaultVoicing(
  chordName: string,
  opts: SearchVoicingsOptions,
): Voicing | null {
  const all = searchVoicings(chordName, opts);
  if (all.length === 0) return null;

  // Always prefer the first priority voicing (already sorted by lowest position)
  const priority = all.filter(v => v.isPriority);
  if (priority.length > 0) {
    return priority.reduce((a, b) => a.startingFret <= b.startingFret ? a : b);
  }

  const region1 = all.filter(v => getRegion(v.startingFret) === 1);
  if (region1.length > 0) return region1[0];

  return all[0];
}

// ── Public: resolve auto-voicings for a progression (voice-leading) ─────────
export function resolveAutoVoicings(
  chordNames: string[],
  opts: SearchVoicingsOptions,
): Record<string, Voicing> {
  const result: Record<string, Voicing> = {};
  let lastVoicing: Voicing | null = null;

  for (const name of chordNames) {
    const all = searchVoicings(name, opts);
    if (all.length === 0) continue;

    let best: Voicing;
    const priorityVoicings = all.filter(v => v.isPriority);

    if (!lastVoicing) {
      // First chord: pick the lowest-position priority shape
      if (priorityVoicings.length > 0) {
        best = priorityVoicings.reduce((a, b) => a.startingFret <= b.startingFret ? a : b);
      } else {
        const region1 = all.filter(v => getRegion(v.startingFret) === 1);
        best = region1.length > 0 ? region1[0] : all[0];
      }
    } else {
      // Subsequent chords: find the closest shape to lastVoicing
      // Strong preference for priority shapes — only fall back if none exist
      const candidates = priorityVoicings.length > 0 ? priorityVoicings : all;

      best = candidates.reduce((prev, curr) => {
        const prevDist = calculateVoicingDistance(prev, lastVoicing!);
        const currDist = calculateVoicingDistance(curr, lastVoicing!);
        return currDist < prevDist ? curr : prev;
      });
    }

    result[name] = best;
    lastVoicing = best;
  }
  return result;
}
