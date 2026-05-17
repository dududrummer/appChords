import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "@tanstack/react-router";
import {
  User,
  Camera,
  Save,
  LogOut,
  Mail,
  Phone,
  Music,
  Calendar,
  Loader2,
  CheckCircle,
} from "lucide-react";

const INSTRUMENTS = [
  "Cavaquinho",
  "Banjo",
  "Outro",
];

export function ProfileTab() {
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    artisticName: user?.artisticName || "",
    phoneWhatsapp: user?.phoneWhatsapp || "",
    age: user?.age || undefined as number | undefined,
    gender: user?.gender || undefined as string | undefined,
    instrument: user?.instrument || "",
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl opacity-60">
        <User className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">Faça login para ver seu perfil</h2>
        <button
          onClick={() => navigate({ to: "/login" })}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold cursor-pointer"
        >
          Entrar
        </button>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSave() {
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleLogout() {
    await logout();
    navigate({ to: "/" });
  }

  return (
    <div className="w-full space-y-6">
      {/* Profile Header */}
      <div className="bg-card border rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-primary/20 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
          )}
          {editing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={() => {
              /* TODO: avatar upload */
            }}
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          {user.artisticName && (
            <p className="text-muted-foreground">"{user.artisticName}"</p>
          )}
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-start mt-1">
            <Mail className="h-3.5 w-3.5" />
            {user.email}
          </p>
          {user.instrument && (
            <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
              🎸 {user.instrument}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Editar Perfil
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Salvando..." : "Salvar"}
            </button>
          )}
        </div>
      </div>

      {/* Success message */}
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Perfil atualizado com sucesso!
        </div>
      )}

      {/* Profile Details */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Informações Pessoais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileField
            icon={<User className="h-4 w-4" />}
            label="Nome Completo"
            value={form.name}
            editing={editing}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          />
          <ProfileField
            icon={<Music className="h-4 w-4" />}
            label="Nome Artístico"
            value={form.artisticName}
            editing={editing}
            onChange={(v) => setForm((f) => ({ ...f, artisticName: v }))}
            placeholder="Como quer ser chamado?"
          />
          <ProfileField
            icon={<Phone className="h-4 w-4" />}
            label="WhatsApp"
            value={form.phoneWhatsapp}
            editing={editing}
            onChange={(v) => setForm((f) => ({ ...f, phoneWhatsapp: v }))}
            placeholder="(11) 99999-9999"
          />
          <ProfileField
            icon={<Calendar className="h-4 w-4" />}
            label="Idade"
            value={form.age?.toString() || ""}
            editing={editing}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                age: v ? parseInt(v) : undefined,
              }))
            }
            type="number"
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <User className="h-4 w-4" />
              Sexo
            </label>
            {editing ? (
              <select
                value={form.gender || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    gender: e.target.value || undefined,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm cursor-pointer"
              >
                <option value="">Selecione</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
                <option value="prefer_not_to_say">Prefiro não dizer</option>
              </select>
            ) : (
              <p className="text-sm font-medium px-3 py-2">
                {form.gender === "male"
                  ? "Masculino"
                  : form.gender === "female"
                    ? "Feminino"
                    : form.gender === "other"
                      ? "Outro"
                      : form.gender === "prefer_not_to_say"
                        ? "Prefiro não dizer"
                        : "—"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Instrument Selection */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Instrumento Principal</h3>
        <div className="flex flex-wrap gap-2">
          {INSTRUMENTS.map((inst) => (
            <button
              key={inst}
              onClick={() => editing && setForm((f) => ({ ...f, instrument: inst }))}
              className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                form.instrument === inst
                  ? "bg-primary text-primary-foreground border-primary"
                  : editing
                    ? "bg-background hover:bg-muted border-border cursor-pointer"
                    : "bg-background border-border opacity-60"
              } ${editing ? "cursor-pointer" : ""}`}
            >
              {inst}
            </button>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Conta</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-bold">Email da conta</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-bold">Membro desde</p>
              <p className="text-xs text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
  editing,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
        />
      ) : (
        <p className="text-sm font-medium px-3 py-2">{value || "—"}</p>
      )}
    </div>
  );
}
