import { useEffect, useState } from "react";
import { Heart, MessageCircle, Send, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import {
  addCommunityComment,
  loadCommunityComments,
  toggleCommunityLike,
  type CommunityCreation,
  type CreationComment,
} from "@/lib/creations";

interface Props {
  creation: CommunityCreation;
  onStatsChange?: (creation: CommunityCreation) => void;
}

export function CreationSocialPanel({ creation, onStatsChange }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CreationComment[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [localCreation, setLocalCreation] = useState(creation);

  useEffect(() => {
    setLocalCreation(creation);
    setLoading(true);
    loadCommunityComments(creation.id).then((result) => {
      setComments(result.comments);
      setError(result.error || "");
      setLoading(false);
    });
  }, [creation]);

  async function handleLike() {
    if (!user) return;
    const result = await toggleCommunityLike(user, localCreation);
    if (result.error) {
      setError(result.error);
      return;
    }

    const next = {
      ...localCreation,
      viewerHasLiked: !localCreation.viewerHasLiked,
      likesCount: localCreation.viewerHasLiked
        ? Math.max(0, localCreation.likesCount - 1)
        : localCreation.likesCount + 1,
    };
    setLocalCreation(next);
    onStatsChange?.(next);
  }

  async function handleComment() {
    if (!user || !body.trim()) return;
    setSubmitting(true);
    const result = await addCommunityComment(user, localCreation.id, body.trim());
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setBody("");
    const nextComments = result.comment ? [...comments, result.comment] : comments;
    setComments(nextComments);
    const next = { ...localCreation, commentsCount: nextComments.length };
    setLocalCreation(next);
    onStatsChange?.(next);
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Publicado por</p>
          <div className="mt-1 flex items-center gap-2 text-sm font-bold">
            <UserRound className="h-4 w-4" />
            {localCreation.authorName}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant={localCreation.viewerHasLiked ? "default" : "outline"} size="sm" onClick={handleLike} disabled={!user}>
            <Heart className={`h-4 w-4 mr-2 ${localCreation.viewerHasLiked ? "fill-current" : ""}`} />
            {localCreation.likesCount}
          </Button>
          <span className="inline-flex items-center rounded-md border px-3 text-sm font-semibold">
            <MessageCircle className="h-4 w-4 mr-2" />
            {localCreation.commentsCount}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold">
          <MessageCircle className="h-4 w-4" />
          Comentários públicos
        </div>

        {loading && <p className="text-sm text-muted-foreground">Carregando comentários...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && comments.length === 0 && (
          <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            Ainda não há comentários.
          </p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="rounded-md border bg-muted/20 px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold">{comment.authorName}</span>
              <span className="text-[11px] text-muted-foreground">
                {new Date(comment.createdAt).toLocaleString("pt-BR")}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{comment.body}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Escreva um comentário público..."
          rows={2}
          disabled={!user}
        />
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={handleComment} disabled={!user || !body.trim() || submitting}>
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Enviando..." : "Comentar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
