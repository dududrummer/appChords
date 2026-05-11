import { Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ExercisesTab() {
  return (
    <Card className="w-full max-w-4xl mx-auto mt-6 shadow-md border-border/50">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          Exercícios
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <p className="text-muted-foreground text-sm">
          Aba de exercícios em construção. Em breve, você poderá configurar treinos de percepção, troca de acordes e rotinas de prática aqui.
        </p>
      </CardContent>
    </Card>
  );
}
