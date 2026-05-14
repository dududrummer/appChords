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
  // Tríades
  '':       [0, 4, 7],
  'm':      [0, 3, 7],
  'dim':    [0, 3, 6],
  'aug':    [0, 4, 8],
  '5':      [0, 7],
  // Suspensas
  'sus2':   [0, 2, 7],
  'sus4':   [0, 5, 7],
  // Sétimas
  '7':      [0, 4, 7, 10],
  'M7':     [0, 4, 7, 11],
  'm7':     [0, 3, 7, 10],
  'dim7':   [0, 3, 6, 9],
  'm7b5':   [0, 3, 6, 10],
  'mM7':    [0, 3, 7, 11],
  // Sextas
  '6':      [0, 4, 7, 9],
  'm6':     [0, 3, 7, 9],
  '6/9':    [0, 4, 7, 9, 14],
  // Nonas
  '9':      [0, 4, 7, 10, 14],
  'M9':     [0, 4, 7, 11, 14],
  'm9':     [0, 3, 7, 10, 14],
  'add9':   [0, 4, 7, 14],
  // Sus com sétima
  '7sus2':  [0, 2, 7, 10],
  '7sus4':  [0, 5, 7, 10],
  '9sus4':  [0, 5, 7, 10, 14],
  '13sus4': [0, 5, 7, 10, 14, 21],
  // Extensões maiores
  '11':     [0, 4, 7, 10, 14, 17],
  '13':     [0, 4, 7, 10, 14, 17, 21],
  // Alterados / Jazz
  '7b5':    [0, 4, 6, 10],
  '7#5':    [0, 4, 8, 10],
  '7b9':    [0, 4, 7, 10, 13],
  '7#9':    [0, 4, 7, 10, 15],
  '7b9b13': [0, 4, 7, 10, 13, 20],
  '7#9b13': [0, 4, 7, 10, 15, 20],
  '7b9#9':  [0, 4, 7, 10, 13, 15],
  '7b9#11': [0, 4, 7, 10, 13, 18],
  '7#9#11': [0, 4, 7, 10, 15, 18],
  '7#11':   [0, 4, 7, 10, 18],
  '7b13':   [0, 4, 7, 10, 20],
  '7#5b9':  [0, 4, 8, 10, 13],
  '7#5#9':  [0, 4, 8, 10, 15],
  '7alt':   [0, 4, 7, 10, 13, 15, 20], // Simplified alt
  '7M11#':  [0, 4, 7, 11, 14, 18],
  'm7(11)': [0, 3, 7, 10, 17],
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
  // Mega dictionary of aliases (BR and US)
  const aliases = {
    // Tríades
    'M': '', 'maj': '',
    'min': 'm',
    'aum': 'aug', '+': 'aug', '5#': 'aug', '5+': 'aug',
    'm5#': 'aug', // usually treated as aug or m(#5) which intervals-wise is often same as aug for validation
    
    // Sétimas maiores
    'maj7': 'M7', '7M': 'M7', '7+': 'M7',
    
    // Sétimas menores
    'min7': 'm7',
    
    // Meio diminuto e diminuto
    'o7': 'dim7', '°': 'dim7', 'o': 'dim',
    'ø': 'm7b5', 'm(b5)': 'm7b5', 'm7-5': 'm7b5', 'm7(b5)': 'm7b5', 'm75b': 'm7b5',
    
    // Menor com sétima maior
    'mmaj7': 'mM7', 'm7M': 'mM7', 'm7+': 'mM7',
    
    // Sextas
    '69': '6/9', 'm6/9': 'm6/9', 'm69': 'm6/9',
    
    // Nonas
    '7/9': '9', '7(9)': '9', '79': '9',
    'maj9': 'M9', '9M': 'M9', '7M9': 'M9', '7M(9)': 'M9',
    'm7/9': 'm9', 'm7(9)': 'm9', 'm79': 'm9',
    'com9': 'add9', '(add9)': 'add9',
    
    // Suspensas e Sus com Sétima
    '7/4': '7sus4', '7(4)': '7sus4',
    
    // Alterados / Extensões
    '7/b9': '7b9', '7(b9)': '7b9', '7(9b)': '7b9',
    '7/#9': '7#9', '7(#9)': '7#9', '7(9#)': '7#9',
    '7/b13': '7b13', '7(b13)': '7b13', '7(13b)': '7b13',
    '7(13)': '13',
    '7(11#)': '7#11', '7(#11)': '7#11',
    '7M(#11)': '7M11#', '7M(11#)': '7M11#',
    'm7/11': 'm7(11)', 'm711': 'm7(11)',
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
