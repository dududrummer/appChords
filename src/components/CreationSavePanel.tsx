import { useRef, useState } from "react";
import { ExternalLink, Globe2, Lock, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import {
  deleteLocalCreation,
  loadLocalCreations,
  publishCreation,
  saveLocalCreation,
  type CreationType,
  type SavedCreation,
} from "@/lib/creations";

interface Props {
  type: CreationType;
  defaultTitle: string;
  defaultDescription?: string;
  payload: Record<string, unknown>;
  disabled?: boolean;
}

export function CreationSavePanel({
  type,
  defaultTitle,
  defaultDescription = "",
  payload,
  disabled = false,
}: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [saved, setSaved] = useState<SavedCreation[]>(() =>
    user ? loadLocalCreations(user.id).filter((item) => item.type === type) : [],
  );
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const publishInFlightRef = useRef(false);
  const lastPublishedSignatureRef = useRef("");

  function refreshSaved() {
    if (!user) return;
    setSaved(loadLocalCreations(user.id).filter((item) => item.type === type));
  }

  function handlePrivateSave() {
    if (!user || disabled || !title.trim()) return;
    saveLocalCreation(user, {
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      payload,
    });
    refreshSaved();
    setMessage("Salvo somente no seu perfil.");
  }

  async function handlePublish() {
    if (!user || disabled || !title.trim() || publishInFlightRef.current) return;
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim() || undefined;
    const signature = JSON.stringify({
      type,
      title: normalizedTitle,
      description: normalizedDescription || "",
      payload,
    });

    if (lastPublishedSignatureRef.current === signature) {
      setMessage("Esta criação já foi publicada na comunidade.");
      return;
    }

    publishInFlightRef.current = true;
    setPublishing(true);
    const result = await publishCreation(user, {
      type,
      title: normalizedTitle,
      description: normalizedDescription,
      payload,
    });
    publishInFlightRef.current = false;
    setPublishing(false);
    if (!result.error) {
      lastPublishedSignatureRef.current = signature;
    }
    setMessage(
      result.error
        ? `Não foi possível publicar: ${result.error}`
        : "Publicado na comunidade com seu nickname.",
    );
  }

  function handleOpen(item: SavedCreation) {
    window.dispatchEvent(new CustomEvent("sambatune:open-creation", { detail: item }));
  }

  function handleDelete(item: SavedCreation) {
    if (!user) return;
    const confirmed = window.confirm(`Excluir "${item.title}" dos salvos no seu perfil?`);
    if (!confirmed) return;
    deleteLocalCreation(user.id, item.id);
    refreshSaved();
    setMessage("Item removido dos salvos no seu perfil.");
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm">Salvar criação</h3>
          <p className="text-xs text-muted-foreground">
            Guarde só para você ou publique na comunidade.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Título</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Descrição</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={1}
            className="resize-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrivateSave}
          disabled={disabled || !user}
        >
          <Lock className="h-4 w-4 mr-2" />
          Salvar no meu perfil
        </Button>
        <Button type="button" onClick={handlePublish} disabled={disabled || !user || publishing}>
          <Globe2 className="h-4 w-4 mr-2" />
          {publishing ? "Publicando..." : "Publicar na comunidade"}
        </Button>
      </div>

      {message && <p className="text-sm font-medium text-primary">{message}</p>}

      {saved.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Salvos no meu perfil</Label>
          <div className="grid md:grid-cols-2 gap-2">
            {saved.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-md border bg-muted/30 px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Save className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => handleOpen(item)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="sr-only">Abrir</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
