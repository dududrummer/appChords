import React, { createContext, useContext, useState, useCallback } from "react";

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
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
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

const MOCK_USER: UserProfile = {
  id: "mock-user-001",
  email: "musico@appchords.com",
  name: "João da Silva",
  artisticName: "João Cavaco",
  phoneWhatsapp: "11999887766",
  age: 28,
  gender: "male",
  instrument: "cavaquinho",
  avatarUrl: undefined,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = useCallback(async (_email: string, _password: string) => {
    setState((s) => ({ ...s, isLoading: true }));
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setState({
      user: { ...MOCK_USER, email: _email },
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    await new Promise((r) => setTimeout(r, 800));
    setState({
      user: {
        ...MOCK_USER,
        name: "Google User",
        email: "user@gmail.com",
        avatarUrl: "https://ui-avatars.com/api/?name=G+U&background=random",
      },
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setState((s) => ({ ...s, isLoading: true }));
    await new Promise((r) => setTimeout(r, 1000));
    setState({
      user: {
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.name,
        artisticName: data.artisticName,
        phoneWhatsapp: data.phoneWhatsapp,
        age: data.age,
        gender: data.gender,
        instrument: data.instrument,
        avatarUrl: data.avatarFile
          ? URL.createObjectURL(data.avatarFile)
          : undefined,
        createdAt: new Date().toISOString(),
      },
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setState((s) => ({
      ...s,
      user: s.user ? { ...s.user, ...data } : null,
    }));
  }, []);

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
