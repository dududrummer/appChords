import sharp from 'sharp';
import { readdirSync, writeFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname$ = dirname(fileURLToPath(import.meta.url));
const DIAGRAMS_DIR = join(__dirname$, 'diagramas');
const OUTPUT_FILE = join(__dirname$, 'extracted-chords.json');

const TUNING = ['D', 'G', 'B', 'D'];
const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

const CHORD_FORMULAS = {
  '':     { intervals: [0, 4, 7],          name: 'Maior' },
  'M':    { intervals: [0, 4, 7],          name: 'Maior' },
  'm':    { intervals: [0, 3, 7],          name: 'Menor' },
  '7':    { intervals: [0, 4, 7, 10],        name: 'Dominante 7' },
  'm7':   { intervals: [0, 3, 7, 10],       name: 'Menor 7' },
  '7M':   { intervals: [0, 4, 7, 11],        name: 'Maior 7' },
  'maj7': { intervals: [0, 4, 7, 11],        name: 'Maior 7' },
  'dim':  { intervals: [0, 3, 6],           name: 'Diminuto' },
  'dim7': { intervals: [0, 3, 6, 9],         name: 'Diminuto 7' },
  'aug':  { intervals: [0, 4, 8],           name: 'Aumentado' },
  'sus2': { intervals: [0, 2, 7],            name: 'Sus2' },
  'sus4': { intervals: [0, 5, 7],            name: 'Sus4' },
  '6':    { intervals: [0, 4, 7, 9],         name: 'Maior 6' },
  'm6':   { intervals: [0, 3, 7, 9],         name: 'Menor 6' },
  '7sus4':{ intervals: [0, 5, 7, 10],        name: 'Dominante 7 Sus4' },
  '7sus2':{ intervals: [0, 2, 7, 10],        name: 'Dominante 7 Sus2' },
  'm7b5': { intervals: [0, 3, 6, 10],       name: 'Menor 7b5' },
  '7b5':  { intervals: [0, 4, 6, 10],       name: 'Dominante 7b5' },
  '7#5':  { intervals: [0, 4, 8, 10],        name: 'Dominante 7#5' },
  '7b9':  { intervals: [0, 4, 7, 10, 1],    name: 'Dominante 7(b9)' },
  '7#9':  { intervals: [0, 4, 7, 10, 3],    name: 'Dominante 7(#9)' },
  '9':    { intervals: [0, 4, 7, 10, 2],     name: 'Dominante 9' },
  'm9':   { intervals: [0, 3, 7, 10, 2],     name: 'Menor 9' },
  'maj9': { intervals: [0, 4, 7, 11, 2],     name: 'Maior 9' },
  '6/9':  { intervals: [0, 4, 7, 9, 2],      name: 'Maior 6/9' },
  'add9': { intervals: [0, 4, 7, 2],        name: 'Add9' },
};

function isOrangeRed(r, g, b) {
  return r > 140 && g < 150 && b < 130 && r > g && r > b;
}

function identifyChord(frets) {
  const noteIndices = [];
  for (let s = 0; s < 4; s++) {
    const f = frets[s];
    if (f === -1) continue;
    const openIdx = CHROMATIC.indexOf(TUNING[s]);
    noteIndices.push((openIdx + f) % 12);
  }

  if (noteIndices.length < 2) return null;
  const unique = [...new Set(noteIndices)].sort((a, b) => a - b);

  for (const rootIdx of unique) {
    const rootName = CHROMATIC[rootIdx];
    const intervals = unique.map(n => (n - rootIdx + 12) % 12).sort((a, b) => a - b);

    for (const [quality, formula] of Object.entries(CHORD_FORMULAS)) {
      const fi = [...new Set(formula.intervals)].sort((a, b) => a - b);
      if (intervals.length !== fi.length) continue;
      if (intervals.every((v, i) => v === fi[i])) {
        return { root: rootName, quality, qualityName: formula.name };
      }
    }
  }
  return null;
}

function findCirclesInRegion(pixels, width, height, channels, rx, ry, rw, rh) {
  const found = [];
  const x1 = Math.max(0, rx), y1 = Math.max(0, ry);
  const x2 = Math.min(width, rx + rw), y2 = Math.min(height, ry + rh);
  const VISITED = Buffer.alloc(width * height);

  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      if (VISITED[y * width + x]) continue;
      const i = (y * width + x) * channels;
      if (!isOrangeRed(pixels[i], pixels[i + 1], pixels[i + 2])) continue;

      const region = [[x, y]];
      VISITED[y * width + x] = 1;
      let head = 0;

      while (head < region.length && region.length < 800) {
        const [cx, cy] = region[head++];
        const dirs = [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]];
        for (const [nx, ny] of dirs) {
          if (nx < x1 || nx >= x2 || ny < y1 || ny >= y2) continue;
          if (VISITED[ny * width + nx]) continue;
          const ni = (ny * width + nx) * channels;
          if (isOrangeRed(pixels[ni], pixels[ni+1], pixels[ni+2])) {
            VISITED[ny * width + nx] = 1;
            region.push([nx, ny]);
          }
        }
      }

      if (region.length < 15) continue;

      let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
      for (const [rx2, ry2] of region) {
        if (rx2 < minX) minX = rx2;
        if (rx2 > maxX) maxX = rx2;
        if (ry2 < minY) minY = ry2;
        if (ry2 > maxY) maxY = ry2;
      }

      const bw = maxX - minX + 1, bh = maxY - minY + 1;
      const ratio = Math.max(bw, bh) / Math.min(bw, bh);
      if (ratio > 2.5) continue;

      const cx = Math.round((minX + maxX) / 2);
      const cy = Math.round((minY + maxY) / 2);

      let borderDark = 0;
      for (let a = 0; a < 360; a += 20) {
        const rad = (a * Math.PI) / 180;
        const bx = Math.round(cx + Math.cos(rad) * (Math.max(bw, bh) / 2 + 3));
        const by = Math.round(cy + Math.sin(rad) * (Math.max(bw, bh) / 2 + 3));
        if (bx < 0 || bx >= width || by < 0 || by >= height) continue;
        const bi = (by * width + bx) * channels;
        if (pixels[bi] < 80) borderDark++;
      }

      if (borderDark < 4) continue;

      const dup = found.find(c => Math.hypot(c.x - cx, c.y - cy) < 10);
      if (!dup) found.push({ x: cx, y: cy });
    }
  }

  return found;
}

function mapCircle(circle, cellX, cellY, cellW, cellH) {
  const x = circle.x - cellX;
  const y = circle.y - cellY;

  const dLeft  = cellW * 0.15;
  const dTop   = cellH * 0.10;
  const dRight = cellW * 0.85;
  const dBot   = cellH * 0.85;

  if (x < dLeft || x > dRight || y < dTop || y > dBot) return null;

  const strW = (dRight - dLeft) / 4;
  const stringIdx = Math.round((x - dLeft) / strW);
  if (stringIdx < 0 || stringIdx > 3) return null;

  const fretH = (dBot - dTop) / 5;

  if (y < dTop + 8) return { string: stringIdx, fret: 0 };
  if (y < dTop + fretH + fretH * 0.5) return { string: stringIdx, fret: 1 };

  const fretIdx = Math.round((y - (dTop + fretH)) / fretH) + 1;
  return { string: stringIdx, fret: fretIdx };
}

function detectBarres(circles, cellX, cellY, cellW, cellH) {
  const byFret = new Map();
  for (const c of circles) {
    const pos = mapCircle(c, cellX, cellY, cellW, cellH);
    if (!pos || pos.fret === 0) continue;
    if (!byFret.has(pos.fret)) byFret.set(pos.fret, []);
    byFret.get(pos.fret).push(pos.string);
  }

  const barres = [];
  for (const [fret, strs] of byFret) {
    if (strs.length < 2) continue;
    strs.sort((a, b) => a - b);
    const start = strs[0], end = strs[strs.length - 1];
    let contig = true;
    for (let s = start; s <= end; s++) {
      if (!strs.includes(s)) { contig = false; break; }
    }
    if (contig) barres.push({ fret, startString: start, endString: end });
  }
  return barres;
}

function buildFrets(circles, barres, cellX, cellY, cellW, cellH) {
  const frets = [-1, -1, -1, -1];

  for (const c of circles) {
    const pos = mapCircle(c, cellX, cellY, cellW, cellH);
    if (!pos) continue;
    if (pos.fret === 0) { frets[pos.string] = 0; continue; }
    const inBarre = barres.find(b => b.fret === pos.fret &&
      pos.string >= b.startString && pos.string <= b.endString);
    if (inBarre) continue;
    if (frets[pos.string] === -1 || frets[pos.string] === 0) {
      frets[pos.string] = pos.fret;
    }
  }

  for (const b of barres) {
    for (let s = b.startString; s <= b.endString; s++) {
      if (s < 4) frets[s] = b.fret;
    }
  }

  return frets;
}

async function processImage(filePath) {
  const img = sharp(filePath);
  const info = await img.metadata();
  const data = await img.ensureAlpha().raw().toBuffer();
  const pixels = data;
  const { width, height } = info;
  const channels = 4;

  const GRID = 3;
  const cellW = Math.floor(width / GRID);
  const cellH = Math.floor(height / GRID);

  const voicings = [];

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const cx = col * cellW;
      const cy = row * cellH;

      const circles = findCirclesInRegion(pixels, width, height, channels, cx, cy, cellW, cellH);
      if (circles.length < 2) continue;

      const barres = detectBarres(circles, cx, cy, cellW, cellH);
      const frets = buildFrets(circles, barres, cx, cy, cellW, cellH);
      if (frets.every(f => f === -1)) continue;

      const identified = identifyChord(frets);
      if (!identified) continue;

      voicings.push({ chordName: `${identified.root}${identified.quality}`, frets });
    }
  }

  return voicings;
}

async function main() {
  const files = readdirSync(DIAGRAMS_DIR)
    .filter(f => extname(f).toLowerCase() === '.jpg')
    .filter(f => f.includes('Dicionario_Cavaquinho-images'))
    .sort((a, b) => {
      const na = parseInt(a.match(/images-(\d+)/)?.[1] || '0');
      const nb = parseInt(b.match(/images-(\d+)/)?.[1] || '0');
      return na - nb;
    });

  console.log(`Found ${files.length} images.\n`);
  const allChords = new Map();

  for (const file of files) {
    const filePath = join(DIAGRAMS_DIR, file);
    process.stdout.write(`${file} ... `);

    try {
      const results = await processImage(filePath);
      console.log(`${results.length} voicings`);
      for (const r of results) {
        if (!allChords.has(r.chordName)) allChords.set(r.chordName, []);
        allChords.get(r.chordName).push({ chordName: r.chordName, frets: r.frets });
      }
    } catch (err) {
      console.error(`ERROR: ${err.message}`);
    }
  }

  const output = {};
  for (const [chordName, voicings] of allChords) {
    output[chordName] = voicings;
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\nWritten: ${OUTPUT_FILE}`);
  console.log(`Unique chords: ${Object.keys(output).length}`);
  console.log(`Total voicings: ${Object.values(output).reduce((s, v) => s + v.length, 0)}`);
}

main().catch(console.error);
