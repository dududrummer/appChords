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

export interface CommunityCreation extends SavedCreation {
  likesCount: number;
  commentsCount: number;
  viewerHasLiked: boolean;
}

export interface CreationComment {
  id: string;
  creationId: string;
  authorId: string;
  authorName: string;
  body: string;
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

  const rows = data || [];
  const ids = rows.map((row: Record<string, any>) => row.id).filter(Boolean);
  const [likesResult, commentsResult, userResult] = await Promise.all([
    ids.length
      ? supabase.from("community_creation_likes").select("creation_id").in("creation_id", ids)
      : Promise.resolve({ data: [] as Array<{ creation_id: string }>, error: null }),
    ids.length
      ? supabase.from("community_creation_comments").select("creation_id").in("creation_id", ids)
      : Promise.resolve({ data: [] as Array<{ creation_id: string }>, error: null }),
    supabase.auth.getUser(),
  ]);

  const relatedError = likesResult.error || commentsResult.error;
  if (relatedError) {
    return { creations: [] as CommunityCreation[], error: relatedError.message };
  }

  const currentUserId = userResult.data.user?.id;
  const viewerLikesResult =
    currentUserId && ids.length
      ? await supabase
          .from("community_creation_likes")
          .select("creation_id")
          .eq("user_id", currentUserId)
          .in("creation_id", ids)
      : { data: [] as Array<{ creation_id: string }>, error: null };

  const likesCount = new Map<string, number>();
  for (const like of likesResult.data || []) {
    likesCount.set(like.creation_id, (likesCount.get(like.creation_id) || 0) + 1);
  }

  const commentsCount = new Map<string, number>();
  for (const comment of commentsResult.data || []) {
    commentsCount.set(comment.creation_id, (commentsCount.get(comment.creation_id) || 0) + 1);
  }

  const viewerLikes = new Set((viewerLikesResult.data || []).map((like) => like.creation_id));

  return {
    creations: rows.map((row: Record<string, any>): CommunityCreation => ({
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description || undefined,
      payload: row.payload || {},
      visibility: "public" as const,
      authorId: row.author_id,
      authorName: row.author_name,
      createdAt: row.created_at,
      likesCount: likesCount.get(row.id) || 0,
      commentsCount: commentsCount.get(row.id) || 0,
      viewerHasLiked: viewerLikes.has(row.id),
    })),
  };
}

export async function toggleCommunityLike(user: UserProfile, creation: CommunityCreation) {
  if (!supabase) return { error: "Supabase não configurado." };

  if (creation.viewerHasLiked) {
    const { error } = await supabase
      .from("community_creation_likes")
      .delete()
      .eq("creation_id", creation.id)
      .eq("user_id", user.id);
    return { error: error?.message };
  }

  const { error } = await supabase.from("community_creation_likes").insert({
    creation_id: creation.id,
    user_id: user.id,
  });
  return { error: error?.message };
}

export async function deleteCommunityCreation(user: UserProfile, creationId: string) {
  if (!supabase) return { error: "Supabase não configurado." };

  const { error } = await supabase
    .from("community_creations")
    .delete()
    .eq("id", creationId)
    .eq("author_id", user.id);

  return { error: error?.message };
}

export async function loadCommunityComments(creationId: string) {
  if (!supabase) {
    return { comments: [] as CreationComment[], error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("community_creation_comments")
    .select("*")
    .eq("creation_id", creationId)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) return { comments: [] as CreationComment[], error: error.message };

  return {
    comments: (data || []).map((row: Record<string, any>) => ({
      id: row.id,
      creationId: row.creation_id,
      authorId: row.author_id,
      authorName: row.author_name,
      body: row.body,
      createdAt: row.created_at,
    })),
  };
}

export async function addCommunityComment(user: UserProfile, creationId: string, body: string) {
  if (!supabase) return { error: "Supabase não configurado." };

  const authorName = getAuthorName(user);
  const { data, error } = await supabase.from("community_creation_comments").insert({
    creation_id: creationId,
    author_id: user.id,
    author_name: authorName,
    body,
  }).select("*").single();

  return {
    comment: error || !data
      ? null
      : ({
          id: data.id,
          creationId: data.creation_id,
          authorId: data.author_id,
          authorName: data.author_name,
          body: data.body,
          createdAt: data.created_at,
        } satisfies CreationComment),
    error: error?.message,
  };
}
