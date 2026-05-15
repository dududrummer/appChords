import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { NeubrutalistButton } from "@/components/ui/NeubrutalistButton";
import { NeubrutalistCard } from "@/components/ui/NeubrutalistCard";
import { useAuth, type RegisterData } from "@/lib/auth-context";
import { Guitar, ArrowLeft, Loader2, Upload, Camera } from "lucide-react";
import { useState, useRef } from "react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const INSTRUMENTS = ["Cavaquinho", "Banjo", "Outro"];

function RegisterPage() {
  const { register, loginWithGoogle, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<RegisterData>({
    email: "", password: "", name: "", artisticName: "",
    phoneWhatsapp: "", age: undefined, gender: undefined,
    instrument: "", avatarFile: null,
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  if (isAuthenticated) { navigate({ to: "/app" }); return null; }

  function updateForm(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      updateForm("avatarFile", file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  function validateStep1() {
    if (!form.name || !form.email || !form.password) {
      setError("Nome, email e senha são obrigatórios."); return false;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres."); return false;
    }
    if (form.password !== confirmPassword) {
      setError("As senhas não coincidem."); return false;
    }
    setError(""); return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = await register(form);
    if (result.error) { setError(result.error); return; }
    navigate({ to: "/app" });
  }

  async function handleGoogle() {
    const result = await loginWithGoogle();
    if (result.error) { setError(result.error); }
  }

  return (
    <div className="min-h-screen bg-neo-bg flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="fixed inset-0 dot-grid pointer-events-none z-0" />
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 font-heading text-sm tracking-wider uppercase text-black/60 hover:text-black transition-colors z-10">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black p-2 border-2 border-black shadow-[3px_3px_0px_theme(colors.neo-orange)]">
            <Guitar className="h-6 w-6 text-neo-orange" />
          </div>
          <span className="font-display text-3xl tracking-tight"><span className="text-neo-orange">Samba</span><span className="text-black">Tune</span></span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className={`h-2 rounded-full transition-all ${step === s ? "w-12 bg-neo-orange" : "w-6 bg-black/20"}`} />
          ))}
        </div>

        <NeubrutalistCard className="p-8">
          <h1 className="font-display text-3xl text-center mb-2">
            {step === 1 ? "Criar Conta" : "Sobre Você"}
          </h1>
          <p className="font-accent text-center text-black/50 mb-6">
            {step === 1 ? "Passo 1 de 2 — dados de acesso" : "Passo 2 de 2 — perfil musical"}
          </p>

          {error && <div className="bg-red-50 border-2 border-red-500 px-4 py-2 mb-4 font-bold text-sm text-red-600">{error}</div>}

          {step === 1 ? (
            <>
              {/* Google */}
              <button onClick={handleGoogle} disabled={isLoading} className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-black bg-white font-bold text-sm hover:bg-neo-bg transition-colors cursor-pointer shadow-[3px_3px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 mb-6">
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Cadastrar com Google
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-0.5 bg-black/10" />
                <span className="font-heading text-xs tracking-wider uppercase text-black/40">ou com email</span>
                <div className="flex-1 h-0.5 bg-black/10" />
              </div>

              <div className="space-y-4">
                <FormField label="Nome Completo *" value={form.name} onChange={(v) => updateForm("name", v)} placeholder="Seu nome completo" id="register-name" />
                <FormField label="Email *" type="email" value={form.email} onChange={(v) => updateForm("email", v)} placeholder="seu@email.com" id="register-email" />
                <FormField label="Senha *" type="password" value={form.password} onChange={(v) => updateForm("password", v)} placeholder="Mínimo 6 caracteres" id="register-password" />
                <FormField label="Confirmar Senha *" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repita a senha" id="register-confirm-password" />
              </div>

              <NeubrutalistButton size="lg" className="w-full mt-6" onClick={() => { if (validateStep1()) setStep(2); }}>
                Próximo Passo →
              </NeubrutalistButton>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full border-3 border-black object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-3 border-dashed border-black/30 flex flex-col items-center justify-center bg-neo-bg group-hover:border-neo-orange transition-colors">
                      <Camera className="h-6 w-6 text-black/30 group-hover:text-neo-orange" />
                      <span className="text-[10px] font-bold text-black/30 mt-1">Foto</span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-neo-orange text-white p-1.5 rounded-full border-2 border-black">
                    <Upload className="h-3 w-3" />
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <p className="text-xs text-black/40 mt-2 font-heading tracking-wider uppercase">
                  Opcional · foto de perfil
                </p>
              </div>

              <FormField label="Nome Artístico" value={form.artisticName || ""} onChange={(v) => updateForm("artisticName", v)} placeholder="Como quer ser chamado?" id="register-artistic-name" />

              <FormField label="WhatsApp" value={form.phoneWhatsapp || ""} onChange={(v) => updateForm("phoneWhatsapp", v)} placeholder="(11) 99999-9999" id="register-phone" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-heading text-xs tracking-wider uppercase text-black/60 block mb-1.5">Idade</label>
                  <input type="number" min="10" max="99" value={form.age || ""} onChange={(e) => updateForm("age", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Ex: 25" className="w-full px-4 py-3 border-2 border-black bg-white font-medium text-sm placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-neo-orange" id="register-age" />
                </div>
                <div>
                  <label className="font-heading text-xs tracking-wider uppercase text-black/60 block mb-1.5">Sexo</label>
                  <select value={form.gender || ""} onChange={(e) => updateForm("gender", e.target.value || undefined)} className="w-full px-4 py-3 border-2 border-black bg-white font-medium text-sm text-black/70 focus:outline-none focus:ring-2 focus:ring-neo-orange cursor-pointer" id="register-gender">
                    <option value="">Selecione</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                    <option value="prefer_not_to_say">Prefiro não dizer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-heading text-xs tracking-wider uppercase text-black/60 block mb-1.5">Instrumento Principal</label>
                <div className="grid grid-cols-4 gap-2">
                  {INSTRUMENTS.map((inst) => (
                    <button key={inst} type="button" onClick={() => updateForm("instrument", inst)} className={`px-2 py-2 border-2 border-black text-xs font-bold transition-all cursor-pointer ${form.instrument === inst ? "bg-neo-orange text-white shadow-[2px_2px_0px_black]" : "bg-white hover:bg-neo-yellow"}`}>
                      {inst}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <NeubrutalistButton variant="white" size="lg" className="flex-1" type="button" onClick={() => setStep(1)}>
                  ← Voltar
                </NeubrutalistButton>
                <NeubrutalistButton size="lg" className="flex-1" type="submit" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Criando...</> : "Criar Conta"}
                </NeubrutalistButton>
              </div>
            </form>
          )}

          <p className="text-center mt-6 text-sm font-bold text-black/60">
            Já tem conta?{" "}
            <Link to="/login" className="text-neo-orange hover:underline font-black">Entrar</Link>
          </p>
        </NeubrutalistCard>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text", id }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; id: string;
}) {
  return (
    <div>
      <label className="font-heading text-xs tracking-wider uppercase text-black/60 block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 border-2 border-black bg-white font-medium text-sm placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-neo-orange" id={id} />
    </div>
  );
}
