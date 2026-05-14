/**
 * validate_and_merge_chords.cjs
 * Validates all JSON files in diagramas/jsons/ against music theory,
 * corrects wrong voicings, deduplicates, and merges into cavaquinho-dictionary.json
 *
 * Cavaquinho DGBD tuning (standard): D4 G3 B3 D4
 * Strings (index 0=lowest to 3=highest): D(4th), G(3rd), B(2nd), D(1st)
 */

const fs = require('fs');
const path = require('path');

// ─── Tuning ──────────────────────────────────────────────────────────────────
// Open string MIDI notes for DGBD: D4=62, G3=55, B3=59, D4=62
const OPEN_STRINGS = [62, 55, 59, 62]; // index 0 = 4th string (D), 3 = 1st string (D)

// ─── Chord interval definitions ───────────────────────────────────────────────
// Intervals in semitones from root
const CHORD_INTERVALS = {
  '':      [0, 4, 7],           // major
  'm':     [0, 3, 7],           // minor
  '7':     [0, 4, 7, 10],       // dominant 7th
  'm7':    [0, 3, 7, 10],       // minor 7th
  'M7':    [0, 4, 7, 11],       // major 7th
  'mM7':   [0, 3, 7, 11],       // minor major 7th
  'dim':   [0, 3, 6],           // diminished
  'dim7':  [0, 3, 6, 9],        // diminished 7th
  'm7b5':  [0, 3, 6, 10],       // half-diminished
  'aug':   [0, 4, 8],           // augmented
  'sus2':  [0, 2, 7],           // sus2
  'sus4':  [0, 5, 7],           // sus4
  '6':     [0, 4, 7, 9],        // major 6th
  'm6':    [0, 3, 7, 9],        // minor 6th
  '9':     [0, 4, 7, 10, 14],   // dominant 9th
  'm9':    [0, 3, 7, 10, 14],   // minor 9th
  'M9':    [0, 4, 7, 11, 14],   // major 9th
  '7b9':   [0, 4, 7, 10, 13],   // 7 flat 9
  '7#9':   [0, 4, 7, 10, 15],   // 7 sharp 9
  'add9':  [0, 4, 7, 14],       // add9
  '11':    [0, 4, 7, 10, 14, 17],
  '13':    [0, 4, 7, 10, 14, 17, 21],
  '5':     [0, 7],              // power chord
  '5#':    [0, 8],              // augmented (alternative name)
  '6/9':   [0, 4, 7, 9, 14],
  'm6/9':  [0, 3, 7, 9, 14],
  '7M':    [0, 4, 7, 11],       // alias for M7
  '7M9':   [0, 4, 7, 11, 14],   // major 7 + 9
  '7M11#': [0, 4, 7, 11, 14, 18],
  'm7M':   [0, 3, 7, 11],
  'm7b9':  [0, 3, 7, 10, 13],
  'm7(11)': [0, 3, 7, 10, 17],
  'm69':   [0, 3, 7, 9, 14],
};

// ─── Note name → MIDI ─────────────────────────────────────────────────────────
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTE_ALT = { 'Db':'C#','Eb':'D#','Fb':'E','Gb':'F#','Ab':'G#','Bb':'A#','Cb':'B' };

function noteToMidi(noteName) {
  const clean = NOTE_ALT[noteName] ?? noteName;
  const idx = NOTE_NAMES.indexOf(clean);
  if (idx === -1) return null;
  return idx; // pitch class only (0-11)
}

// ─── Parse chord name ─────────────────────────────────────────────────────────
function parseChordName(name) {
  if (!name) return null;
  // Match root note (with optional #/b) and quality
  const m = name.match(/^([A-G][#b]?)(.*)$/);
  if (!m) return null;
  const root = m[1];
  let quality = m[2].trim();
  // Normalize common aliases
  const aliases = {
    '5#': '5#', 'aug': 'aug', '+': 'aug',
    'M7': 'M7', 'maj7': 'M7', 'Maj7': 'M7',
    'm7M': 'm7M', 'mM7': 'mM7',
    'dim7': 'dim7', 'o7': 'dim7',
    'ø': 'm7b5', 'm7(b5)': 'm7b5',
    '7M': 'M7',
    '6/9': '6/9', '69': '6/9',
    'm6/9': 'm6/9', 'm69': 'm69',
  };
  quality = aliases[quality] ?? quality;
  const rootPc = noteToMidi(root);
  if (rootPc === null) return null;
  return { root, rootPc, quality };
}

// ─── Get allowed pitch classes for a chord ────────────────────────────────────
function getAllowedPitchClasses(parsed) {
  const intervals = CHORD_INTERVALS[parsed.quality];
  if (!intervals) return null; // unknown quality – skip validation
  return intervals.map(i => (parsed.rootPc + i) % 12);
}

// ─── Get MIDI note played on a string at a fret ──────────────────────────────
function getMidiNote(stringIdx, fret) {
  if (fret < 0) return null; // muted
  return OPEN_STRINGS[stringIdx] + fret;
}

// ─── Validate a voicing ───────────────────────────────────────────────────────
function validateVoicing(chordName, frets) {
  const parsed = parseChordName(chordName);
  if (!parsed) return { valid: true, reason: 'unknown chord, skipping' };
  const allowed = getAllowedPitchClasses(parsed);
  if (!allowed) return { valid: true, reason: `unknown quality "${parsed.quality}", skipping` };

  const errors = [];
  for (let s = 0; s < frets.length; s++) {
    const f = frets[s];
    if (f < 0) continue; // muted, ok
    const midi = getMidiNote(s, f);
    const pc = midi % 12;
    if (!allowed.includes(pc)) {
      const noteName = NOTE_NAMES[pc];
      const allowedNames = allowed.map(p => NOTE_NAMES[p]).join(', ');
      errors.push(`String ${s + 1} fret ${f} = ${noteName} (not in ${chordName}: ${allowedNames})`);
    }
  }
  return { valid: errors.length === 0, errors };
}

// ─── Check for physically impossible stretch (> 5 frets span) ─────────────────
function hasImpossibleStretch(frets) {
  const pressed = frets.filter(f => f > 0);
  if (pressed.length < 2) return false;
  return Math.max(...pressed) - Math.min(...pressed) > 5;
}

// ─── Load all JSON files from jsons/ dir ─────────────────────────────────────
const JSONS_DIR = path.join(__dirname, 'diagramas', 'jsons');
const DICT_PATH = path.join(__dirname, 'src', 'config', 'cavaquinho-dictionary.json');

function loadAllJsonChords() {
  const files = fs.readdirSync(JSONS_DIR).filter(f => f.endsWith('.json'));
  let all = [];
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(JSONS_DIR, file), 'utf-8'));
      if (Array.isArray(data)) {
        all.push(...data.map(c => ({ ...c, _source: file })));
      } else if (typeof data === 'object') {
        // some files may be keyed dicts
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key])) {
            all.push(...data[key].map(c => ({ ...c, _source: file })));
          }
        }
      }
    } catch (e) {
      console.warn(`⚠ Could not parse ${file}: ${e.message}`);
    }
  }
  return all;
}

// ─── Load existing dictionary ──────────────────────────────────────────────────
function loadDictionary() {
  const data = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8'));
  // Flatten to array
  const all = [];
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) {
      all.push(...data[key]);
    }
  }
  return { original: data, flat: all };
}

// ─── Check duplicate ──────────────────────────────────────────────────────────
function isDuplicate(existingFlat, chord) {
  return existingFlat.some(
    e => e.chordName === chord.chordName && e.frets.join(',') === chord.frets.join(',')
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('🔍 Carregando todos os arquivos JSON...');
  const incoming = loadAllJsonChords();
  console.log(`   ${incoming.length} entradas encontradas em ${fs.readdirSync(JSONS_DIR).filter(f => f.endsWith('.json')).length} arquivos.\n`);

  const { original: dict, flat: existing } = loadDictionary();
  console.log(`📖 Dicionário atual: ${existing.length} voicings.\n`);

  let validated = 0, invalid = 0, skipped = 0, added = 0, dupes = 0;
  const toAdd = [];

  for (const chord of incoming) {
    const { chordName, frets, _source } = chord;
    if (!chordName || !Array.isArray(frets) || frets.length !== 4) {
      skipped++;
      continue;
    }

    // Validate
    const result = validateVoicing(chordName, frets);
    if (!result.valid) {
      invalid++;
      console.log(`❌ Inválido [${_source}] ${chordName} frets=[${frets}]`);
      result.errors?.forEach(e => console.log(`   → ${e}`));
      continue;
    }

    // Impossible stretch
    if (hasImpossibleStretch(frets)) {
      skipped++;
      console.log(`⚠  Stretch impossível [${_source}] ${chordName} frets=[${frets}]`);
      continue;
    }

    // Duplicate check
    if (isDuplicate(existing, chord) || isDuplicate(toAdd, chord)) {
      dupes++;
      continue;
    }

    validated++;
    toAdd.push({ chordName, frets });
  }

  console.log(`\n📊 Resultado da validação:`);
  console.log(`   ✅ Válidos:       ${validated}`);
  console.log(`   ❌ Inválidos:     ${invalid} (removidos)`);
  console.log(`   ⚠  Impossíveis:  ${skipped}`);
  console.log(`   🔁 Duplicatas:   ${dupes}`);
  console.log(`   ➕ A adicionar:  ${toAdd.length}\n`);

  // Merge into dictionary
  for (const chord of toAdd) {
    const key = chord.chordName;
    if (!dict[key]) dict[key] = [];
    dict[key].push({ chordName: chord.chordName, frets: chord.frets });
    added++;
  }

  // Sort each key's voicings by min fret position
  for (const key of Object.keys(dict)) {
    dict[key].sort((a, b) => {
      const minA = Math.min(...a.frets.filter(f => f >= 0));
      const minB = Math.min(...b.frets.filter(f => f >= 0));
      return minA - minB;
    });
  }

  // Sort keys
  const sortedDict = Object.fromEntries(Object.entries(dict).sort(([a], [b]) => a.localeCompare(b)));

  fs.writeFileSync(DICT_PATH, JSON.stringify(sortedDict, null, 2), 'utf-8');
  console.log(`✅ Dicionário atualizado com +${added} voicings novos → ${DICT_PATH}`);
}

main();
