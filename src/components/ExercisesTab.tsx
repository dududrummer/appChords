import { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreationSavePanel } from './CreationSavePanel';
import type { SavedCreation } from '@/lib/creations';

interface Props {
  openedCreation?: SavedCreation | null;
}

export function ExercisesTab({ openedCreation }: Props) {
  const [title, setTitle] = useState('Treino de sequência e regiões');
  const [focus, setFocus] = useState('Troca de acordes com arpejos por região');
  const [routine, setRoutine] = useState(
    '1. Escolha uma sequência curta\n2. Toque os acordes em uma região\n3. Aplique arpejos em cada acorde\n4. Repita com metrônomo ou batucada',
  );
  const [bpm, setBpm] = useState(80);
  const [duration, setDuration] = useState(15);

  useEffect(() => {
    if (!openedCreation || openedCreation.type !== "exercise") return;
    const payload = openedCreation.payload;
    setTitle(typeof payload.title === "string" ? payload.title : openedCreation.title);
    setFocus(typeof payload.focus === "string" ? payload.focus : openedCreation.description || "");
    setRoutine(typeof payload.routine === "string" ? payload.routine : "");
    setBpm(typeof payload.bpm === "number" ? payload.bpm : 80);
    setDuration(typeof payload.duration === "number" ? payload.duration : 15);
  }, [openedCreation]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          Escalas e Arpejos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {openedCreation?.type === "exercise" && (
          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            <span className="font-bold">{openedCreation.title}</span>
            <span className="text-muted-foreground"> por {openedCreation.authorName}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Título do exercício</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Foco</Label>
            <Input value={focus} onChange={(e) => setFocus(e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_140px_140px] gap-4">
          <div className="space-y-1">
            <Label>Roteiro de prática</Label>
            <Textarea
              value={routine}
              onChange={(e) => setRoutine(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
          <div className="space-y-1">
            <Label>BPM</Label>
            <Input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <Label>Minutos</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
        </div>

        <CreationSavePanel
          type="exercise"
          defaultTitle={title}
          defaultDescription={focus}
          disabled={!title.trim() || !routine.trim()}
          payload={{ title, focus, routine, bpm, duration }}
        />
      </CardContent>
    </Card>
  );
}
