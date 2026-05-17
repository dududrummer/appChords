import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { NeubrutalistButton } from "@/components/ui/NeubrutalistButton";
import { NeubrutalistCard } from "@/components/ui/NeubrutalistCard";
import { useAuth } from "@/lib/auth-context";
import { CavaquinhoIcon } from "@/components/icons/CavaquinhoIcon";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, loginWithGoogle, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [authAction, setAuthAction] = useState<"email" | "google" | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/app" });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setAuthAction("email");
    const result = await login(email, password);
    if (result.error) {
      setAuthAction(null);
      setError(result.error);
      return;
    }
  }

  async function handleGoogle() {
    setError("");
    setAuthAction("google");
    const result = await loginWithGoogle();
    if (result.error) {
      setAuthAction(null);
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="fixed inset-0 dot-grid pointer-events-none z-0" />
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="rounded-lg bg-primary p-2 shadow-sm">
            <CavaquinhoIcon className="h-6 w-6" color="#FF6B35" />
          </div>
          <span className="text-3xl font-bold tracking-tight">
            <span className="text-neo-orange">Samba</span>
            <span className="text-foreground">Tune</span>
          </span>
        </div>

        <NeubrutalistCard className="p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Entrar</h1>
          <p className="text-center text-muted-foreground mb-8">
            Acesse sua conta e continue estudando
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 rounded-lg border bg-white px-4 py-3 font-semibold text-sm shadow-sm hover:bg-muted transition-colors cursor-pointer disabled:opacity-50 mb-6"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {authAction === "google" ? "Conectando..." : "Continuar com Google"}
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-0.5 bg-black/10" />
            <span className="text-xs font-semibold text-muted-foreground">ou com email</span>
            <div className="flex-1 h-0.5 bg-black/10" />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 px-4 py-2 mb-4 font-bold text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border bg-white pl-10 pr-4 py-3 font-medium text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                  id="login-email"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border bg-white pl-10 pr-12 py-3 font-medium text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-2 border-black accent-neo-orange"
                />
                <span className="text-xs font-bold text-black/60">Lembrar de mim</span>
              </label>
              <a href="#" className="text-xs font-bold text-neo-orange hover:underline">
                Esqueci a senha
              </a>
            </div>
            <NeubrutalistButton type="submit" size="lg" className="w-full" disabled={isLoading}>
              {authAction === "email" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </NeubrutalistButton>
          </form>

          <p className="text-center mt-6 text-sm font-bold text-black/60">
            Não tem conta?{" "}
            <Link to="/register" className="text-neo-orange hover:underline font-black">
              Experimente grátis
            </Link>
          </p>
        </NeubrutalistCard>
      </div>
    </div>
  );
}
