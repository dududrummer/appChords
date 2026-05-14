import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  artisticName?: string;
  phoneWhatsapp?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  instrument?: string;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthState {
  user: UserProfile | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error?: string }>;
  loginWithGoogle: () => Promise<{ error?: string }>;
  register: (data: RegisterData) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  artisticName?: string;
  phoneWhatsapp?: string;
  age?: number;
  gender?: UserProfile["gender"];
  instrument?: string;
  avatarFile?: File | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const NO_SUPABASE_MSG = "Supabase não configurado. Funcionalidade de autenticação indisponível.";

function mapSupabaseUser(user: User, profile?: Record<string, unknown> | null): UserProfile {
  return {
    id: user.id,
    email: user.email || "",
    name: (profile?.name as string) || user.user_metadata?.full_name || user.email?.split("@")[0] || "",
    artisticName: (profile?.artistic_name as string) || undefined,
    phoneWhatsapp: (profile?.phone_whatsapp as string) || undefined,
    age: (profile?.age as number) || undefined,
    gender: (profile?.gender as UserProfile["gender"]) || undefined,
    instrument: (profile?.instrument as string) || undefined,
    avatarUrl: (profile?.avatar_url as string) || user.user_metadata?.avatar_url || undefined,
    createdAt: user.created_at,
  };
}

async function fetchProfile(userId: string): Promise<Record<string, unknown> | null> {
  if (!supabase) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

async function upsertProfile(userId: string, profileData: Record<string, unknown>) {
  if (!supabase) return;
  await supabase.from("profiles").upsert({ id: userId, ...profileData, updated_at: new Date().toISOString() });
}

async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  if (!supabase) return null;
  const ext = file.name.split(".").pop();
  const path = `avatars/${userId}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) { console.error("Avatar upload error:", error); return null; }
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, supabaseUser: null, session: null,
    isAuthenticated: false, isLoading: !!supabase,
  });

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: mapSupabaseUser(session.user, profile),
          supabaseUser: session.user, session,
          isAuthenticated: true, isLoading: false,
        });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: mapSupabaseUser(session.user, profile),
            supabaseUser: session.user, session,
            isAuthenticated: true, isLoading: false,
          });
        } else {
          setState({
            user: null, supabaseUser: null, session: null,
            isAuthenticated: false, isLoading: false,
          });
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: NO_SUPABASE_MSG };
    setState((s) => ({ ...s, isLoading: true }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState((s) => ({ ...s, isLoading: false }));
      return { error: error.message };
    }
    return {};
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!supabase) return { error: NO_SUPABASE_MSG };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    if (!supabase) return { error: NO_SUPABASE_MSG };
    setState((s) => ({ ...s, isLoading: true }));

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.name } },
    });

    if (error) {
      setState((s) => ({ ...s, isLoading: false }));
      return { error: error.message };
    }

    if (authData.user) {
      let avatarUrl: string | undefined;
      if (data.avatarFile) {
        const url = await uploadAvatar(authData.user.id, data.avatarFile);
        if (url) avatarUrl = url;
      }

      await upsertProfile(authData.user.id, {
        name: data.name,
        artistic_name: data.artisticName || null,
        phone_whatsapp: data.phoneWhatsapp || null,
        age: data.age || null,
        gender: data.gender || null,
        instrument: data.instrument || null,
        avatar_url: avatarUrl || null,
        email: data.email,
      });
    }

    return {};
  }, []);

  const logout = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!supabase || !state.supabaseUser) return;
    const profileData: Record<string, unknown> = {};
    if (data.name !== undefined) profileData.name = data.name;
    if (data.artisticName !== undefined) profileData.artistic_name = data.artisticName;
    if (data.phoneWhatsapp !== undefined) profileData.phone_whatsapp = data.phoneWhatsapp;
    if (data.age !== undefined) profileData.age = data.age;
    if (data.gender !== undefined) profileData.gender = data.gender;
    if (data.instrument !== undefined) profileData.instrument = data.instrument;
    if (data.avatarUrl !== undefined) profileData.avatar_url = data.avatarUrl;

    await upsertProfile(state.supabaseUser.id, profileData);
    setState((s) => ({
      ...s,
      user: s.user ? { ...s.user, ...data } : null,
    }));
  }, [state.supabaseUser]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, loginWithGoogle, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
