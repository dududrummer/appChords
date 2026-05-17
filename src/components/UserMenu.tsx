import { useAuth } from "@/lib/auth-context";
import { Link, useNavigate } from "@tanstack/react-router";
import { NeubrutalistButton } from "@/components/ui/NeubrutalistButton";
  LogOut,
  User,
  Music2,
  BookOpen,
  Users,
  Dumbbell,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { CavaquinhoIcon } from "@/components/icons/CavaquinhoIcon";
import { useState, useRef, useEffect } from "react";

const MENU_ITEMS = [
  { icon: <BookOpen className="h-4 w-4" />, label: "Dicionário Interativo", tab: "dictionary" },
  { icon: <Music2 className="h-4 w-4" />, label: "Sequências Harmônicas", tab: "progression" },
  { icon: <CavaquinhoIcon className="h-4 w-4" />, label: "Criador de Diagramas", tab: "diagram" },
  { icon: <Dumbbell className="h-4 w-4" />, label: "Escalas e Arpejos", tab: "exercises" },
  { icon: <GraduationCap className="h-4 w-4" />, label: "Plano de Estudos", tab: "plan" },
  { icon: <Users className="h-4 w-4" />, label: "Comunidade", tab: "community" },
  { icon: <User className="h-4 w-4" />, label: "Meu Perfil", tab: "profile" },
];

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-3">
        <Link to="/login">
          <NeubrutalistButton variant="white" size="sm">
            Entrar
          </NeubrutalistButton>
        </Link>
        <Link to="/register" className="hidden sm:block">
          <NeubrutalistButton size="sm">Cadastrar</NeubrutalistButton>
        </Link>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleNavigate(tab: string) {
    setOpen(false);
    navigate({ to: "/app", search: { tab } });
  }

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate({ to: "/" });
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white text-black hover:bg-neo-yellow transition-colors cursor-pointer dark:border-border dark:bg-card dark:text-card-foreground dark:hover:bg-muted"
        aria-label="Menu do usuário"
        id="user-menu-button"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full border-2 border-black object-cover dark:border-border"
          />
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-black bg-neo-orange text-white flex items-center justify-center font-display text-xs dark:border-border">
            {initials}
          </div>
        )}
        <span className="hidden md:block font-heading text-sm tracking-wider uppercase max-w-[120px] truncate">
          {user.artisticName || user.name}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white text-black border-2 border-black shadow-[4px_4px_0px_black] z-50 animate-fade-in-up dark:bg-card dark:text-card-foreground dark:border-border dark:shadow-[4px_4px_0px_rgba(255,255,255,0.14)]">
          {/* User info header */}
          <div className="px-4 py-3 border-b-2 border-black bg-neo-bg dark:bg-muted dark:border-border">
            <p className="font-display text-sm truncate">{user.name}</p>
            {user.artisticName && (
              <p className="font-accent text-xs text-black/50 truncate dark:text-muted-foreground">
                "{user.artisticName}"
              </p>
            )}
            <p className="text-xs text-black/40 truncate mt-0.5 dark:text-muted-foreground">
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <nav className="py-1">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.tab}
                onClick={() => handleNavigate(item.tab)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-neo-yellow/50 transition-colors cursor-pointer dark:hover:bg-muted"
              >
                {item.icon}
                <span className="font-heading text-sm tracking-wider uppercase">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t-2 border-black py-1 dark:border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
