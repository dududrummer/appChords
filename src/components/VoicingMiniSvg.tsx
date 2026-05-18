import type { Voicing } from '@/lib/chord-finder';

interface Props {
  voicing: Voicing;
  stringCount: number;
  markerColor?: string;
  primaryColor?: string;
  arpeggioColor?: string;
  width?: number;
  height?: number;
}

export function VoicingMiniSvg({
  voicing, stringCount,
  markerColor = '#000', primaryColor = '#000', arpeggioColor = '#f97316',
  width = 64, height = 110,
}: Props) {
  const ml = 9, mr = 9, mt = 14, mb = 5;
  const iW = width - ml - mr, iH = height - mt - mb;
  const FRETS = 8, fretH = iH / FRETS;
  const strSp = stringCount > 1 ? iW / (stringCount - 1) : iW;
  const sx = (s: number) => ml + s * strSp;
  const sf = voicing.startingFret;
  const showNut = sf === 1;
  const r = Math.min(fretH, strSp) * 0.3;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{display:'block'}}>
      {/* Frets */}
      {Array.from({ length: FRETS + 1 }, (_, f) => (
        <line key={f} x1={ml} y1={mt + f * fretH} x2={ml + iW} y2={mt + f * fretH}
          stroke={primaryColor} strokeWidth={f === 0 && showNut ? 3 : 0.8} />
      ))}
      {/* Strings */}
      {Array.from({ length: stringCount }, (_, s) => (
        <line key={s} x1={sx(s)} y1={mt} x2={sx(s)} y2={mt + iH}
          stroke={primaryColor} strokeWidth={0.7} />
      ))}
      {/* Fret label */}
      {sf > 1 && (
        <text x={ml - 2} y={mt + fretH * 0.55} textAnchor="end" dominantBaseline="middle"
          fill={primaryColor} fontSize={6}>{sf}ª</text>
      )}
      {/* Arpeggio Notes */}
      {voicing.arpeggioFrets && voicing.arpeggioFrets.map((stringFrets, s) => {
        return stringFrets.map((fret) => {
          if (fret === 0) {
            return <circle key={`arp-0-${s}`} cx={sx(s)} cy={mt - 4} r={2.5} fill={arpeggioColor} stroke="none" />;
          }
          const rel = fret - sf + 1;
          if (rel < 1 || rel > FRETS) return null;
          return <circle key={`arp-${fret}-${s}`} cx={sx(s)} cy={mt + (rel - 0.5) * fretH} r={r * 0.8} fill={arpeggioColor} />;
        });
      })}
      {/* Markers */}
      {voicing.frets.map((fret, s) => {
        if (fret === -1) return (
          <text key={s} x={sx(s)} y={mt - 4} textAnchor="middle" fill={primaryColor} fontSize={7} fontWeight="bold">✕</text>
        );
        if (fret === 0) return (
          <circle key={s} cx={sx(s)} cy={mt - 4} r={2.5} fill="none" stroke={primaryColor} strokeWidth={0.8} />
        );
        const rel = fret - sf + 1;
        if (rel < 1 || rel > FRETS) return null;
        return <circle key={s} cx={sx(s)} cy={mt + (rel - 0.5) * fretH} r={r} fill={markerColor} />;
      })}
      {/* Barres */}
      {voicing.barres.map((b, i) => {
        const rel = b.fret - sf + 1;
        if (rel < 1 || rel > FRETS) return null;
        const cy = mt + (rel - 0.5) * fretH;
        return <rect key={i} x={sx(b.startString) - r} y={cy - r}
          width={sx(b.endString) - sx(b.startString) + r * 2} height={r * 2} rx={r} fill={markerColor} />;
      })}
    </svg>
  );
}
