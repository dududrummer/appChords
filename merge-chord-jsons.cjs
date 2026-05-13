/**
 * Merge all chord JSON files from diagramas/jsons/ into a single dictionary.
 * Handles: deduplication, sorting by lowest position, enharmonic aliases, notation aliases.
 */
const fs = require('fs');
const path = require('path');

const JSONS_DIR = path.join(__dirname, 'diagramas', 'jsons');
const OUTPUT = path.join(__dirname, 'src', 'config', 'cavaquinho-dictionary.json');

const ENHARMONICS = {
  'Ab': 'G#', 'G#': 'Ab',
  'Bb': 'A#', 'A#': 'Bb',
  'Db': 'C#', 'C#': 'Db',
  'Eb': 'D#', 'D#': 'Eb',
  'Gb': 'F#', 'F#': 'Gb',
};

// Normalize root to sharp
function sharpRoot(root) {
  const map = { 'Ab': 'G#', 'Bb': 'A#', 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#' };
  return map[root] || root;
}

// Clean suffix to canonical form (what parseChord would produce)
function cleanSuffix(suffix) {
  let s = suffix.replace(/[()]/g, '');
  // Swap Brazilian notation: 11# → #11, 5# stays as 5# (handled separately)
  s = s.replace(/(\d{2})(#|b)/g, '$2$1'); // 11# → #11, 9b → b9
  return s;
}

// Create canonical key for grouping equivalent chords
function canonicalize(chordName) {
  const m = chordName.match(/^([A-G][b#]?)(.*)/);
  if (!m) return chordName;
  const root = sharpRoot(m[1]);
  const suffix = cleanSuffix(m[2]);
  
  // Known equivalences (after cleaning)
  const EQUIV = {
    'm79': 'm9',   // Cm7(9) = Cm9
    'm69': 'm6/9', // Cm6(9) = Cm6/9
    '69': '6/9',   // C6(9) = C6/9
  };
  const finalSuffix = EQUIV[suffix] || suffix;
  return root + finalSuffix;
}

// Get all lookup names a chord should be stored under
function getAllNames(chordName) {
  const names = new Set();
  const m = chordName.match(/^([A-G][b#]?)(.*)/);
  if (!m) return [chordName];
  const [, root, suffix] = m;
  
  // Original name
  names.add(chordName);
  
  // Cleaned name (no parens + notation swap)
  const cleaned = cleanSuffix(suffix);
  names.add(root + cleaned);
  
  // Enharmonic variants
  const altRoot = ENHARMONICS[root];
  if (altRoot) {
    names.add(altRoot + suffix);
    names.add(altRoot + cleaned);
  }
  
  // Known equivalences
  const EQUIV_SETS = [
    ['6(9)', '6/9', '69'],
    ['m6(9)', 'm6/9', 'm69'],
    ['m7(9)', 'm79', 'm9', 'm7/9'],
    ['m7(11)', 'm711', 'm11', 'm7/11'],
    ['7M(9)', '7M9', 'maj9', '9M'],
    ['7M(11#)', '7M#11', 'maj7#11'],
    ['5#', 'aug', '5+', 'aum'],
    ['m5#', 'maug', 'm5+'],
  ];
  
  for (const equivSet of EQUIV_SETS) {
    if (equivSet.includes(suffix) || equivSet.includes(cleaned)) {
      for (const variant of equivSet) {
        names.add(root + variant);
        if (altRoot) names.add(altRoot + variant);
      }
    }
  }
  
  return [...names];
}

// ── Main ────────────────────────────────────────────────────────────────────

// 1. Read all JSON files
const files = fs.readdirSync(JSONS_DIR).filter(f => f.endsWith('.json'));
const allEntries = [];
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(JSONS_DIR, file), 'utf-8'));
  allEntries.push(...data);
}
console.log(`Read ${allEntries.length} entries from ${files.length} files`);

// 2. Group by canonical key, remove duplicates
const canonical = {};
for (const entry of allEntries) {
  const key = canonicalize(entry.chordName);
  if (!canonical[key]) canonical[key] = { names: new Set(), voicings: [] };
  canonical[key].names.add(entry.chordName);
  
  const fretStr = entry.frets.join(',');
  if (!canonical[key].voicings.some(v => v.frets.join(',') === fretStr)) {
    canonical[key].voicings.push({ chordName: entry.chordName, frets: entry.frets });
  }
}

// 3. Sort voicings: lowest position first, but bass string (frets[0]) NOT open
for (const key of Object.keys(canonical)) {
  canonical[key].voicings.sort((a, b) => {
    // Penalize open bass string (frets[0] === 0)
    const openBassA = a.frets[0] === 0 ? 1 : 0;
    const openBassB = b.frets[0] === 0 ? 1 : 0;
    if (openBassA !== openBassB) return openBassA - openBassB;
    
    const pressedA = a.frets.filter(f => f > 0);
    const pressedB = b.frets.filter(f => f > 0);
    const minA = pressedA.length > 0 ? Math.min(...pressedA) : 0;
    const minB = pressedB.length > 0 ? Math.min(...pressedB) : 0;
    return minA - minB;
  });
}

// 4. Build dictionary with all aliases
const dictionary = {};

// Define sort order for roots (chromatic)
const ROOT_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const TYPE_ORDER = ['', 'm', '5#', 'm5#', '7', 'm7', '7M', 'm7M', '6', 'm6',
  '6/9', 'm6/9', '9', 'm9', '7M9', '7M#11', 'm711', 'm79'];

// Sort canonical keys
const sortedKeys = Object.keys(canonical).sort((a, b) => {
  const rootA = a.match(/^[A-G]#?/)?.[0] || '';
  const rootB = b.match(/^[A-G]#?/)?.[0] || '';
  const suffA = a.slice(rootA.length);
  const suffB = b.slice(rootB.length);
  const ri = ROOT_ORDER.indexOf(rootA) - ROOT_ORDER.indexOf(rootB);
  if (ri !== 0) return ri;
  const ti = (TYPE_ORDER.indexOf(suffA) === -1 ? 999 : TYPE_ORDER.indexOf(suffA)) -
             (TYPE_ORDER.indexOf(suffB) === -1 ? 999 : TYPE_ORDER.indexOf(suffB));
  return ti;
});

// Populate dictionary
for (const key of sortedKeys) {
  const { names, voicings } = canonical[key];
  
  // Get all possible lookup names from all original names
  const allNames = new Set();
  for (const name of names) {
    for (const alias of getAllNames(name)) {
      allNames.add(alias);
    }
  }
  
  // Normalize chordName in each voicing to the canonical key's first original name
  const primaryName = [...names][0];
  const normalizedVoicings = voicings.map(v => ({
    chordName: primaryName,
    frets: v.frets
  }));
  
  for (const alias of allNames) {
    if (!dictionary[alias]) {
      dictionary[alias] = normalizedVoicings;
    }
  }
}

// 5. Write output
fs.writeFileSync(OUTPUT, JSON.stringify(dictionary, null, 2));

const uniqueChords = Object.keys(canonical).length;
const totalAliases = Object.keys(dictionary).length;
const totalVoicings = Object.values(canonical).reduce((s, c) => s + c.voicings.length, 0);

console.log(`\n✅ Dictionary written to ${OUTPUT}`);
console.log(`   Unique chord types: ${uniqueChords}`);
console.log(`   Total aliases (dictionary keys): ${totalAliases}`);
console.log(`   Total voicings: ${totalVoicings}`);
console.log(`   File size: ${(fs.statSync(OUTPUT).size / 1024).toFixed(1)} KB`);
