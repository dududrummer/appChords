import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Dumbbell, ExternalLink, Heart, MessageCircle, Music2, Sparkles, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import {
  deleteCommunityCreation,
  loadPublicCreations,
  toggleCommunityLike,
  type CommunityCreation,
  type SavedCreation,
} from "@/lib/creations";
import { CreationSocialPanel } from "./CreationSocialPanel";

type CommunitySection = "progression" | "dictionary" | "scales" | "arpeggios";

const SECTION_META: Record<CommunitySection, { label: string; description: string; icon: React.ReactNode }> = {
  progression: {
    label: "Sequencias",
    description: "Progressões harmonicas e estudos de encadeamento.",
    icon: <Music2 className="h-5 w-5" />,
  },
  dictionary: {
    label: "Dicionario",
    description: "Acordes e posicoes publicados pela comunidade.",
    icon: <BookOpen className="h-5 w-5" />,
  },
  scales: {
    label: "Escalas",
    description: "Rotinas e ideias de treino melodico.",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  arpeggios: {
    label: "Arpejos",
    description: "Exercicios de arpejo por regiao e acorde.",
    icon: <Sparkles className="h-5 w-5" />,
  },
};

const SECTION_ORDER: CommunitySection[] = ["progression", "dictionary", "scales", "arpeggios"];

interface Props {
  onOpenCreation?: (creation: CommunityCreation) => void;
}

export function CommunityTab({ onOpenCreation }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<CommunityCreation[]>([]);
  const [selected, setSelected] = useState<CommunityCreation | null>(null);
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<CommunitySection | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function refresh() {
      const result = await loadPublicCreations();
      if (!mounted) return;
      setItems(result.creations);
      setSelected(result.creations[0] ?? null);
      setError(result.error || "");
      setLoading(false);
    }

    refresh();

    function handleCommunityUpdated() {
      setLoading(true);
      void refresh();
    }

    window.addEventListener("sambatune:community-updated", handleCommunityUpdated);
    return () => {
      mounted = false;
      window.removeEventListener("sambatune:community-updated", handleCommunityUpdated);
    };
  }, []);

  function updateItem(next: CommunityCreation) {
    setItems((current) => current.map((item) => (item.id === next.id ? next : item)));
    setSelected((current) => (current?.id === next.id ? next : current));
  }

  function handleComments(item: CommunityCreation) {
    setSelected(item);
    setExpandedCommentsId((current) => (current === item.id ? null : item.id));
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
    window.dispatchEvent(new CustomEvent("sambatune:community-updated"));
  }

  async function handleDelete(item: CommunityCreation) {
    if (!user || item.authorId !== user.id) return;
    const confirmed = window.confirm("Remover esta publicacao da comunidade?");
    if (!confirmed) return;

    const result = await deleteCommunityCreation(user, item.id);
    if (result.error) {
      setError(result.error);
      return;
    }

    setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
    setSelected((current) => (current?.id === item.id ? null : current));
    window.dispatchEvent(new CustomEvent("sambatune:community-updated"));
  }

  const recentItems = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const itemsBySection = recentItems.reduce<Record<CommunitySection, CommunityCreation[]>>(
    (acc, item) => {
      acc[getCommunitySection(item)].push(item);
      return acc;
    },
    { progression: [], dictionary: [], scales: [], arpeggios: [] },
  );

  const sectionStats = SECTION_ORDER.map((section) => {
    const sectionItems = itemsBySection[section];
    const totalLikes = sectionItems.reduce((sum, item) => sum + item.likesCount, 0);
    const totalComments = sectionItems.reduce((sum, item) => sum + item.commentsCount, 0);
    const hotItem = [...sectionItems].sort((a, b) => getHeatScore(b) - getHeatScore(a))[0] ?? null;
    return { section, sectionItems, totalLikes, totalComments, hotItem };
  });

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

        {!activeSection ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {sectionStats.map(({ section, sectionItems, totalLikes, totalComments, hotItem }) => (
              <button
                key={section}
                type="button"
                onClick={() => {
                  setActiveSection(section);
                  setExpandedCommentsId(null);
                }}
                className="min-h-56 rounded-lg border bg-card p-5 text-left transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-md border bg-muted">
                    {SECTION_META[section].icon}
                  </span>
                  <span className="text-3xl font-bold">{sectionItems.length}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold">{SECTION_META[section].label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{SECTION_META[section].description}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <span className="rounded-md border bg-muted/30 px-2 py-1 font-semibold">{totalLikes} curtidas</span>
                  <span className="rounded-md border bg-muted/30 px-2 py-1 font-semibold">{totalComments} comentarios</span>
                </div>
                <div className="mt-4 rounded-md border bg-muted/20 p-2">
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">Mais quente</p>
                  <p className="mt-1 truncate text-sm font-bold">{hotItem?.title || "Sem publicacoes"}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  {SECTION_META[activeSection].icon}
                  {SECTION_META[activeSection].label}
                </h3>
                <p className="text-sm text-muted-foreground">{SECTION_META[activeSection].description}</p>
              </div>
              <Button type="button" variant="outline" onClick={() => setActiveSection(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>

            {itemsBySection[activeSection].length === 0 ? (
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                Nenhuma publicacao nesta secao.
              </div>
            ) : (
              <div className="space-y-3">
                {itemsBySection[activeSection].map((item) => (
                  <CommunityCard
                    key={item.id}
                    item={item}
                    section={getCommunitySection(item)}
                    onLike={() => handleLike(item)}
                    onSelect={() => setSelected(item)}
                    onComments={() => handleComments(item)}
                    onOpen={() => onOpenCreation?.(item)}
                    onDelete={() => handleDelete(item)}
                    canDelete={item.authorId === user?.id}
                    commentsOpen={expandedCommentsId === item.id}
                    onStatsChange={updateItem}
                  />
                ))}
              </div>
            )}
          </section>
        )}

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
  section,
  onLike,
  onSelect,
  onComments,
  onOpen,
  onDelete,
  canDelete,
  commentsOpen,
  onStatsChange,
}: {
  item: CommunityCreation;
  section: CommunitySection;
  onLike: () => void;
  onSelect: () => void;
  onComments: () => void;
  onOpen: () => void;
  onDelete: () => void;
  canDelete: boolean;
  commentsOpen: boolean;
  onStatsChange: (creation: CommunityCreation) => void;
}) {
  return (
    <article className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded bg-muted px-2 py-1 text-xs font-bold">
              {SECTION_META[section].icon}
              {SECTION_META[section].label}
            </span>
            <span className="text-xs text-muted-foreground">por {item.authorName}</span>
          </div>
          <h3 className="mt-2 font-bold">{item.title}</h3>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
          )}
        </button>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <Button type="button" variant={item.viewerHasLiked ? "default" : "outline"} size="sm" onClick={onLike}>
          <Heart className={`h-4 w-4 mr-1.5 ${item.viewerHasLiked ? "fill-current" : ""}`} />
          {item.likesCount}
        </Button>
        <Button type="button" variant={commentsOpen ? "default" : "outline"} size="sm" onClick={onComments}>
          <MessageCircle className="h-4 w-4 mr-1.5" />
          {item.commentsCount}
        </Button>
        <Button type="button" size="sm" onClick={onOpen}>
          <ExternalLink className="h-4 w-4 mr-1.5" />
          Abrir
        </Button>
        {canDelete && (
          <Button type="button" size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remover</span>
          </Button>
        )}
        </div>
      </div>

      {commentsOpen && (
        <CreationSocialPanel creation={item} onStatsChange={onStatsChange} showComposer />
      )}
    </article>
  );
}

function getCommunitySection(item: CommunityCreation): CommunitySection {
  if (item.type === "progression") return "progression";
  if (item.type === "dictionary") return "dictionary";

  const text = [
    item.title,
    item.description,
    String(item.payload.focus || ""),
    String(item.payload.routine || ""),
  ].join(" ").toLowerCase();

  return text.includes("arpej") ? "arpeggios" : "scales";
}

function getHeatScore(item: CommunityCreation) {
  const recentBoost = Date.now() - new Date(item.createdAt).getTime() <= 72 * 60 * 60 * 1000 ? 5 : 0;
  return item.likesCount + item.commentsCount * 2 + recentBoost;
}
