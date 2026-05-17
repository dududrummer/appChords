import { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreationSavePanel } from './CreationSavePanel';

export function ExercisesTab() {
  const [title, setTitle] = useState('Treino de sequência e regiões');
  const [focus, setFocus] = useState('Troca de acordes com arpejos por região');
  const [routine, setRoutine] = useState(
    '1. Escolha uma sequência curta\n2. Toque os acordes em uma região\n3. Aplique arpejos em cada acorde\n4. Repita com metrônomo ou batucada',
  );
  const [bpm, setBpm] = useState(80);
  const [duration, setDuration] = useState(15);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          Escalas e Arpejos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
