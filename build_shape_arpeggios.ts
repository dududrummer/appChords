/**
 * build_shape_arpeggios.ts
 * Reads the new arpejos.json (with explicit fundamental + arpeggio fields)
 * and generates arpeggio-shapes.json keyed by quality, with rootString and direction.
 *
 * JSON string ordering (1=D high, 2=B, 3=G, 4=D low) → our internal 0-indexed (0=D low, 3=D high):
 *   JSON "1" → idx 3  (D aguda, MIDI 74)
 *   JSON "2" → idx 2  (B,       MIDI 71)
 *   JSON "3" → idx 1  (G,       MIDI 67)
 *   JSON "4" → idx 0  (D grave, MIDI 62)
 */
import fs from 'fs';
import path from 'path';

const INPUT  = path.resolve('diagramas/Shapes e arpejos/arpejos.json');
const OUTPUT = path.resolve('src/config/arpeggio-shapes.json');

// Map JSON string number → our 0-indexed string
const STR_MAP: Record<number, number> = { 1: 3, 2: 2, 3: 1, 4: 0 };

// Map quality code in JSON → internal quality key (matches CHORD_FORMULAS)
const QUALITY_MAP: Record<string, string> = {
  'X':        '',
  'Xm':       'm',
  'X7':       '7',
  'X7M':      '7M',
  'Xm7':      'm7',
  'Xm7M':     'm7M',
  'Xm7(b5)':  'm7b5',
  'Xm(b5)':   'm(b5)',
  'Xº':       'dim',
  'Xdim':     'dim',
  'X(b5)':    '(b5)',
  'X(#5)':    '+',
  'X7M(#5)':  '7M#5',
  'X7M(b5)':  '7Mb5',
};

interface Shape {
  name: string;
  rootString: number;      // 0-indexed internal
  rootFretOnRef: number;   // absolute fret on the reference note used in JSON
  relativeFrets: number[][];
  direction: 'frente' | 'tras' | 'neutral';
}

function detectDirection(name: string): 'frente' | 'tras' | 'neutral' {
  const lower = name.toLowerCase();
  if (lower.includes('frente')) return 'frente';
  if (lower.includes('tras') || lower.includes('trás')) return 'tras';
  return 'neutral';
}

function main() {
  const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const arpeggios: any[] = raw.arpeggios;

  // Result: quality → array of Shape
  const result: Record<string, Shape[]> = {};

  for (const entry of arpeggios) {
    const qualityKey = QUALITY_MAP[entry.quality];
    if (qualityKey === undefined) {
      console.warn(`  [skip] Unknown quality: ${entry.quality} in ${entry.name}`);
      continue;
    }

    const fundJsonStr: number = entry.fundamental?.string;
    const fundFret: number    = entry.fundamental?.fret;
    if (fundJsonStr === undefined || fundFret === undefined) {
      console.warn(`  [skip] Missing fundamental in ${entry.name}`);
      continue;
    }

    const rootString = STR_MAP[fundJsonStr];
    if (rootString === undefined) {
      console.warn(`  [skip] Bad string number ${fundJsonStr} in ${entry.name}`);
      continue;
    }

    // Build 4-element array of fret-arrays (our 0-indexed)
    const absoluteFrets: number[][] = [[], [], [], []];
    const arpObj: Record<string, number[]> = entry.arpeggio || {};
    for (const [jsonStrStr, frets] of Object.entries(arpObj)) {
      const jsonStr = parseInt(jsonStrStr, 10);
      const idx = STR_MAP[jsonStr];
      if (idx !== undefined && Array.isArray(frets)) {
        absoluteFrets[idx] = frets as number[];
      }
    }

    // Convert to relative frets (relative to the fundamental fret)
    const relativeFrets = absoluteFrets.map(arr => arr.map(f => f - fundFret));

    const direction = detectDirection(entry.name);

    const shape: Shape = {
      name: entry.name,
      rootString,
      rootFretOnRef: fundFret,
      relativeFrets,
      direction,
    };

    if (!result[qualityKey]) result[qualityKey] = [];
    result[qualityKey].push(shape);
  }

  const counts = Object.entries(result).map(([k, v]) => `${k || 'major'}(${v.length})`).join(', ');
  console.log(`Shapes built: ${counts}`);

  fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Saved → ${OUTPUT}`);
}

main();
