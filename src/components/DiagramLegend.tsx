/**
 * DiagramLegend — compact color legend for chord/arpeggio diagrams.
 * Shows: red = fundamental, orange = arpeggio notes, black = chord shape.
 */
interface Props {
  showArpeggio?: boolean;
}

export function DiagramLegend({ showArpeggio = true }: Props) {
  return (
    <div className="flex items-center gap-3 text-[10px] text-muted-foreground select-none">
      <span className="flex items-center gap-1">
        <span
          style={{
            display: 'inline-block',
            width: 10, height: 10,
            borderRadius: '50%',
            background: '#dc2626',
            flexShrink: 0,
          }}
        />
        Fundamental
      </span>
      {showArpeggio && (
        <span className="flex items-center gap-1">
          <span
            style={{
              display: 'inline-block',
              width: 10, height: 10,
              borderRadius: '50%',
              background: '#f97316',
              flexShrink: 0,
            }}
          />
          Arpejo
        </span>
      )}
      <span className="flex items-center gap-1">
        <span
          style={{
            display: 'inline-block',
            width: 10, height: 10,
            borderRadius: '50%',
            background: '#18181b',
            flexShrink: 0,
          }}
        />
        Shape
      </span>
    </div>
  );
}
