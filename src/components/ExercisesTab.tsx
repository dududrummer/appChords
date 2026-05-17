import { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
          Exercícios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {openedCreation?.type === "exercise" && (
          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm mb-4">
            <span className="font-bold">{openedCreation.title}</span>
            <span className="text-muted-foreground"> por {openedCreation.authorName}</span>
          </div>
        )}

        <Tabs defaultValue="digitacao" className="w-full">
          <TabsList className="w-full flex overflow-x-auto justify-start sm:justify-center mb-6 border-b rounded-none bg-transparent p-0">
            <TabsTrigger value="digitacao" className="rounded-none border-b-2 border-transparent data-[state=active]:border-neo-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">Digitação</TabsTrigger>
            <TabsTrigger value="acordes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-neo-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">Acordes</TabsTrigger>
            <TabsTrigger value="frases" className="rounded-none border-b-2 border-transparent data-[state=active]:border-neo-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">Frases</TabsTrigger>
            <TabsTrigger value="arpejos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-neo-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">Arpejos</TabsTrigger>
            <TabsTrigger value="mecanicos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-neo-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none">Mecânicos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="digitacao" className="space-y-4 outline-none">
            <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_black] dark:border-border dark:bg-card dark:shadow-[4px_4px_0px_rgba(255,255,255,0.14)]">
              <h3 className="font-display text-lg mb-2">Exercícios de Digitação</h3>
              <p className="text-muted-foreground text-sm">Melhore sua agilidade, força e independência dos dedos com exercícios cromáticos, padrões 1-2-3-4 e saltos de casas. (Módulo em desenvolvimento)</p>
            </div>
          </TabsContent>

          <TabsContent value="acordes" className="space-y-4 outline-none">
            <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_black] dark:border-border dark:bg-card dark:shadow-[4px_4px_0px_rgba(255,255,255,0.14)]">
              <h3 className="font-display text-lg mb-2">Exercícios de Acordes</h3>
              <p className="text-muted-foreground text-sm">Treine trocas rápidas, montagem de shapes complexos e progressões nas tonalidades maiores e menores. (Módulo em desenvolvimento)</p>
            </div>
          </TabsContent>

          <TabsContent value="frases" className="space-y-4 outline-none">
            <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_black] dark:border-border dark:bg-card dark:shadow-[4px_4px_0px_rgba(255,255,255,0.14)]">
              <h3 className="font-display text-lg mb-2">Exercícios de Frases</h3>
              <p className="text-muted-foreground text-sm">Estude licks, levadas tradicionais, baixarias e frases melódicas essenciais do samba e choro. (Módulo em desenvolvimento)</p>
            </div>
          </TabsContent>

          <TabsContent value="arpejos" className="space-y-4 outline-none">
            <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_black] dark:border-border dark:bg-card dark:shadow-[4px_4px_0px_rgba(255,255,255,0.14)]">
              <h3 className="font-display text-lg mb-2">Exercícios de Arpejos</h3>
              <p className="text-muted-foreground text-sm">Domine as notas do acorde tocadas sucessivamente por todo o braço do instrumento (Tétades, Tríades). (Módulo em desenvolvimento)</p>
            </div>
          </TabsContent>

          <TabsContent value="mecanicos" className="space-y-4 outline-none">
            <div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0px_black] dark:border-border dark:bg-card dark:shadow-[4px_4px_0px_rgba(255,255,255,0.14)]">
              <h3 className="font-display text-lg mb-2">Exercícios Mecânicos</h3>
              <p className="text-muted-foreground text-sm">Foco puro na palhetada alternada, sweep, velocidade e precisão rítmica com metrônomo. (Módulo em desenvolvimento)</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t-2 border-dashed border-black/20 pt-6 mt-6 dark:border-border">
          <h3 className="font-display text-xl mb-4">Criar Roteiro Personalizado</h3>
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
