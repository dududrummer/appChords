import type { Measure } from '@/lib/progression';
import type { HarmonicAnalysis } from '@/lib/harmony';

const FUNC_COLORS: Record<string, string> = {
  blue:   'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-200',
  yellow: 'bg-yellow-50 border-yellow-400 text-yellow-900 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-200',
  red:    'bg-red-100 border-red-400 text-red-900 dark:bg-red-900/30 dark:border-red-600 dark:text-red-200',
  orange: 'bg-orange-100 border-orange-400 text-orange-900 dark:bg-orange-900/30 dark:border-orange-500 dark:text-orange-200',
  purple: 'bg-purple-100 border-purple-400 text-purple-900 dark:bg-purple-900/30 dark:border-purple-500 dark:text-purple-200',
  zinc:   'bg-zinc-100 border-zinc-300 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-300',
};

const FUNC_BADGE: Record<string, string> = {
  blue:   'bg-blue-500 text-white',
  yellow: 'bg-yellow-500 text-white',
  red:    'bg-red-500 text-white',
  orange: 'bg-orange-500 text-white',
  purple: 'bg-purple-500 text-white',
  zinc:   'bg-zinc-400 text-white',
};

interface Props {
  measures: Measure[];
  analysis: HarmonicAnalysis | null;
  activeMeasure: number | null;
}

export function ProgressionGrid({ measures, analysis, activeMeasure }: Props) {
  if (measures.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-sm py-8">
        Digite uma progressão acima e pressione Enter para visualizar.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {analysis && (
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <span className="font-semibold">Tonalidade detectada:</span>
          <span className="rounded-full bg-primary text-primary-foreground px-3 py-0.5 font-bold text-sm">
            {analysis.keyName}
          </span>
          <span className="flex gap-2 ml-2">
            {[
              { color: 'blue',   label: 'T — Tônica' },
              { color: 'yellow', label: 'SD — Subdominante' },
              { color: 'red',    label: 'D — Dominante' },
              { color: 'orange', label: 'Dom. Sec.' },
              { color: 'purple', label: 'Empréstimo' },
            ].map(({ color, label }) => (
              <span key={color} className={`rounded px-2 py-0.5 text-[10px] font-medium ${FUNC_BADGE[color]}`}>
                {label}
              </span>
            ))}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {measures.map((measure) => {
          const isActive = activeMeasure === measure.index;
          return (
            <div
              key={measure.index}
              className={`rounded-lg border-2 p-2 transition-all ${
                isActive ? 'ring-2 ring-primary ring-offset-1 scale-105' : ''
              } bg-card`}
            >
              <div className="text-[9px] text-muted-foreground mb-1 font-mono">
                c.{measure.index + 1}
              </div>
              <div className="flex gap-1 flex-wrap">
                {measure.beats.map((beat, bi) => {
                  const a = analysis?.analyses[beat.chordName];
                  const color = a?.color ?? 'zinc';
                  return (
                    <div
                      key={bi}
                      className={`flex-1 min-w-0 rounded border px-1.5 py-1 ${FUNC_COLORS[color]}`}
                      style={{ minWidth: '40px' }}
                    >
                      {a && (
                        <div className="text-[9px] font-bold opacity-70 leading-none mb-0.5">
                          {a.romanNumeral}
                        </div>
                      )}
                      <div className="text-xs font-bold truncate leading-tight">
                        {beat.chordName}
                      </div>
                      {a && (
                        <div className="text-[8px] opacity-60 leading-none mt-0.5">
                          {a.harmonicFunction}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
