/**
 * Registro de loops de áudio disponíveis.
 * Coloque os arquivos MP3 em: public/audio/loops/
 * O app seleciona automaticamente o BPM mais próximo ao andamento escolhido.
 */

export type LoopStyle = 'batucada' | 'sambaenredo' | 'jazz' | 'bossanova';

export interface AudioLoop {
  style: LoopStyle;
  bpm: number;
  file: string;
  label?: string;
}

export const AUDIO_LOOPS: AudioLoop[] = [

  // ── Batucada / Samba / Pagode (60–120 BPM) ───────────────────────────────
  { style: 'batucada', bpm:  60, file: 'batucada_60.mp3'  },
  { style: 'batucada', bpm:  65, file: 'batucada_65.mp3'  },
  { style: 'batucada', bpm:  70, file: 'batucada_70.mp3'  },
  { style: 'batucada', bpm:  75, file: 'batucada_75.mp3'  },
  { style: 'batucada', bpm:  80, file: 'batucada_80.mp3'  },
  { style: 'batucada', bpm:  85, file: 'batucada_85.mp3'  },
  { style: 'batucada', bpm:  90, file: 'batucada_90.mp3'  },
  { style: 'batucada', bpm:  95, file: 'batucada_95.mp3'  },
  { style: 'batucada', bpm: 100, file: 'batucada_100.mp3' },
  { style: 'batucada', bpm: 105, file: 'batucada_105.mp3' },
  { style: 'batucada', bpm: 110, file: 'batucada_110.mp3' },
  { style: 'batucada', bpm: 115, file: 'batucada_115.mp3' },
  { style: 'batucada', bpm: 120, file: 'batucada_120.mp3' },

  // ── Samba Enredo (125–160 BPM) ────────────────────────────────────────────
  { style: 'sambaenredo', bpm: 125, file: 'sambaenredo_125.mp3' },
  { style: 'sambaenredo', bpm: 130, file: 'sambaenredo_130.mp3' },
  { style: 'sambaenredo', bpm: 135, file: 'sambaenredo_135.mp3' },
  { style: 'sambaenredo', bpm: 140, file: 'sambaenredo_140.mp3' },
  { style: 'sambaenredo', bpm: 145, file: 'sambaenredo_145.mp3' },
  { style: 'sambaenredo', bpm: 150, file: 'sambaenredo_150.mp3' },
  { style: 'sambaenredo', bpm: 155, file: 'sambaenredo_155.mp3' },
  { style: 'sambaenredo', bpm: 160, file: 'sambaenredo_160.mp3' },

  // ── Jazz (150–200 BPM) ──────────────────────────────────────────────────────
  { style: 'jazz', bpm: 150, file: 'jazz_150.mp3' },
  { style: 'jazz', bpm: 155, file: 'jazz_155.mp3' },
  { style: 'jazz', bpm: 160, file: 'jazz_160.mp3' },
  { style: 'jazz', bpm: 165, file: 'jazz_165.mp3' },
  { style: 'jazz', bpm: 170, file: 'jazz_170.mp3' },
  { style: 'jazz', bpm: 175, file: 'jazz_175.mp3' },
  { style: 'jazz', bpm: 180, file: 'jazz_180.mp3' },
  { style: 'jazz', bpm: 185, file: 'jazz_185.mp3' },
  { style: 'jazz', bpm: 190, file: 'jazz_190.mp3' },
  { style: 'jazz', bpm: 195, file: 'jazz_195.mp3' },
  { style: 'jazz', bpm: 200, file: 'jazz_200.mp3' },

  // ── Bossa Nova (adicionar quando tiver os arquivos) ───────────────────────
  // { style: 'bossanova', bpm: 100, file: 'bossanova_100.mp3' },
  // { style: 'bossanova', bpm: 108, file: 'bossanova_108.mp3' },
];

/** Retorna o loop com BPM mais próximo. Null se não houver arquivo para o estilo. */
export function findLoop(style: LoopStyle, targetBpm: number): AudioLoop | null {
  const matches = AUDIO_LOOPS.filter(l => l.style === style);
  if (!matches.length) return null;
  return matches.reduce((best, curr) =>
    Math.abs(curr.bpm - targetBpm) < Math.abs(best.bpm - targetBpm) ? curr : best
  );
}

/** BPMs disponíveis para um estilo */
export function availableBpms(style: LoopStyle): number[] {
  return AUDIO_LOOPS.filter(l => l.style === style).map(l => l.bpm).sort((a, b) => a - b);
}
