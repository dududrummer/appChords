import { useEffect, useState } from "react";
import { BookOpen, Dumbbell, Music2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadPublicCreations, type SavedCreation } from "@/lib/creations";

const TYPE_LABEL: Record<SavedCreation["type"], string> = {
  dictionary: "Dicionário",
  progression: "Sequência",
  exercise: "Exercício",
};

const TYPE_ICON = {
  dictionary: <BookOpen className="h-4 w-4" />,
  progression: <Music2 className="h-4 w-4" />,
  exercise: <Dumbbell className="h-4 w-4" />,
};

export function CommunityTab() {
  const [items, setItems] = useState<SavedCreation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadPublicCreations().then((result) => {
      if (!mounted) return;
      setItems(result.creations);
      setError(result.error || "");
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" /> Comunidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sequências, acordes e exercícios publicados pelos membros aparecem aqui com o nickname do autor.
        </p>

        {loading && <p className="text-sm text-muted-foreground">Carregando publicações...</p>}
        {error && (
          <p className="text-sm text-destructive">
            Não foi possível carregar a comunidade. Verifique se a tabela `community_creations` já foi criada no Supabase.
          </p>
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded bg-muted px-2 py-1 text-xs font-bold">
                  {TYPE_ICON[item.type]}
                  {TYPE_LABEL[item.type]}
                </span>
                <span className="text-xs text-muted-foreground">
                  por {item.authorName}
                </span>
              </div>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
              </div>
            </article>
          ))}
        </div>

        {!loading && !error && items.length === 0 && (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            Ainda não há publicações. Salve uma criação como pública em Dicionário, Sequências ou Escalas e Arpejos.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
