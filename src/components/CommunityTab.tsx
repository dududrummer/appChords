import { useEffect, useState } from "react";
import { BookOpen, Dumbbell, ExternalLink, Heart, MessageCircle, Music2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import {
  loadPublicCreations,
  toggleCommunityLike,
  type CommunityCreation,
  type SavedCreation,
} from "@/lib/creations";
import { CreationSocialPanel } from "./CreationSocialPanel";

const TYPE_LABEL: Record<SavedCreation["type"], string> = {
  dictionary: "Dicionario",
  progression: "Sequencia",
  exercise: "Exercicio",
};

const TYPE_ICON = {
  dictionary: <BookOpen className="h-4 w-4" />,
  progression: <Music2 className="h-4 w-4" />,
  exercise: <Dumbbell className="h-4 w-4" />,
};

interface Props {
  onOpenCreation?: (creation: CommunityCreation) => void;
}

export function CommunityTab({ onOpenCreation }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<CommunityCreation[]>([]);
  const [selected, setSelected] = useState<CommunityCreation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadPublicCreations().then((result) => {
      if (!mounted) return;
      setItems(result.creations);
      setSelected(result.creations[0] ?? null);
      setError(result.error || "");
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  function updateItem(next: CommunityCreation) {
    setItems((current) => current.map((item) => (item.id === next.id ? next : item)));
    setSelected((current) => (current?.id === next.id ? next : current));
  }

  async function handleLike(item: CommunityCreation) {
    if (!user) return;
    const result = await toggleCommunityLike(user, item);
    if (result.error) {
      setError(result.error);
      return;
    }
    updateItem({
      ...item,
      viewerHasLiked: !item.viewerHasLiked,
      likesCount: item.viewerHasLiked ? Math.max(0, item.likesCount - 1) : item.likesCount + 1,
    });
  }

  const recentItems = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const hotItems = recentItems
    .filter((item) => Date.now() - new Date(item.createdAt).getTime() <= 72 * 60 * 60 * 1000)
    .sort((a, b) => b.likesCount + b.commentsCount * 2 - (a.likesCount + a.commentsCount * 2))
    .slice(0, 3);

  const itemsByType = recentItems.reduce<Record<SavedCreation["type"], CommunityCreation[]>>(
    (acc, item) => {
      acc[item.type].push(item);
      return acc;
    },
    { dictionary: [], progression: [], exercise: [] },
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" /> Comunidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Publicacoes dos membros aparecem por area. Os destaques fixados sao os itens com mais curtidas e comentarios nas ultimas 72 horas.
        </p>

        {loading && <p className="text-sm text-muted-foreground">Carregando publicacoes...</p>}
        {error && (
          <p className="text-sm text-destructive">
            Nao foi possivel carregar a comunidade: {error}
          </p>
        )}

        {hotItems.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-bold">Fixados em alta</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {hotItems.map((item) => (
                <CommunityCard
                  key={item.id}
                  item={item}
                  compact
                  onLike={() => handleLike(item)}
                  onSelect={() => setSelected(item)}
                  onOpen={() => onOpenCreation?.(item)}
                />
              ))}
            </div>
          </section>
        )}

        <div className="grid xl:grid-cols-[1fr_360px] gap-4 items-start">
          <div className="space-y-4">
            {(["progression", "dictionary", "exercise"] as const).map((type) => (
              <section key={type} className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  {TYPE_ICON[type]}
                  {TYPE_LABEL[type]}
                </h3>
                {itemsByType[type].length === 0 ? (
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                    Nenhuma publicacao nesta area.
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {itemsByType[type].map((item) => (
                      <CommunityCard
                        key={item.id}
                        item={item}
                        onLike={() => handleLike(item)}
                        onSelect={() => setSelected(item)}
                        onOpen={() => onOpenCreation?.(item)}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          <aside className="xl:sticky xl:top-24 space-y-3">
            {selected ? (
              <CreationSocialPanel creation={selected} onStatsChange={updateItem} />
            ) : (
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                Selecione uma publicacao para ver comentarios, ou abra na ferramenta para estudar no seu ambiente.
              </div>
            )}
          </aside>
        </div>

        {!loading && !error && items.length === 0 && (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            Ainda nao ha publicacoes. Salve uma criacao como publica em Dicionario, Sequencias ou Escalas e Arpejos.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommunityCard({
  item,
  compact = false,
  onLike,
  onSelect,
  onOpen,
}: {
  item: CommunityCreation;
  compact?: boolean;
  onLike: () => void;
  onSelect: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded bg-muted px-2 py-1 text-xs font-bold">
          {TYPE_ICON[item.type]}
          {TYPE_LABEL[item.type]}
        </span>
        <span className="text-xs text-muted-foreground">por {item.authorName}</span>
      </div>

      <button type="button" onClick={onSelect} className="block w-full text-left">
        <h3 className="font-bold">{item.title}</h3>
        {item.description && !compact && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
        )}
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant={item.viewerHasLiked ? "default" : "outline"} size="sm" onClick={onLike}>
          <Heart className={`h-4 w-4 mr-1.5 ${item.viewerHasLiked ? "fill-current" : ""}`} />
          {item.likesCount}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onSelect}>
          <MessageCircle className="h-4 w-4 mr-1.5" />
          {item.commentsCount}
        </Button>
        <Button type="button" size="sm" onClick={onOpen} className="ml-auto">
          <ExternalLink className="h-4 w-4 mr-1.5" />
          Abrir
        </Button>
      </div>
    </article>
  );
}
