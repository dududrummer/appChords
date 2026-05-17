import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/lib/auth-context";

export type CreationType = "dictionary" | "progression" | "exercise";
export type CreationVisibility = "private" | "public";

export interface SavedCreation {
  id: string;
  type: CreationType;
  title: string;
  description?: string;
  payload: Record<string, unknown>;
  visibility: CreationVisibility;
  authorId: string;
  authorName: string;
  createdAt: string;
}

const STORAGE_PREFIX = "sambatune_creations";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function getAuthorName(user: UserProfile | null) {
  return user?.artisticName || user?.name || user?.email?.split("@")[0] || "Músico";
}

export function loadLocalCreations(userId: string): SavedCreation[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalCreation(
  user: UserProfile,
  input: Omit<SavedCreation, "id" | "authorId" | "authorName" | "createdAt" | "visibility">,
) {
  const creation: SavedCreation = {
    ...input,
    id: crypto.randomUUID(),
    visibility: "private",
    authorId: user.id,
    authorName: getAuthorName(user),
    createdAt: new Date().toISOString(),
  };
  const current = loadLocalCreations(user.id);
  localStorage.setItem(storageKey(user.id), JSON.stringify([creation, ...current]));
  return creation;
}

export async function publishCreation(
  user: UserProfile,
  input: Omit<SavedCreation, "id" | "authorId" | "authorName" | "createdAt" | "visibility">,
) {
  if (!supabase) {
    return { error: "Supabase não configurado." };
  }

  const { error } = await supabase.from("community_creations").insert({
    type: input.type,
    title: input.title,
    description: input.description || null,
    payload: input.payload,
    author_id: user.id,
    author_name: getAuthorName(user),
  });

  return { error: error?.message };
}

export async function loadPublicCreations() {
  if (!supabase) {
    return { creations: [] as SavedCreation[], error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("community_creations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { creations: [] as SavedCreation[], error: error.message };
  }

  return {
    creations: (data || []).map((row: Record<string, any>) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description || undefined,
      payload: row.payload || {},
      visibility: "public" as const,
      authorId: row.author_id,
      authorName: row.author_name,
      createdAt: row.created_at,
    })),
  };
}
