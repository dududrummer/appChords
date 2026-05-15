import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  BookOpen,
  Dumbbell,
  Music2,
  GraduationCap,
  Users,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import { CavaquinhoIcon } from "@/components/icons/CavaquinhoIcon";

const TOUR_STEPS = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "Dicionário de Acordes",
    description:
      "Busque qualquer acorde por nome e veja todas as posições no braço. Cavaquinho e Banjo.",
    color: "#FF6B35",
    tab: "dictionary" as const,
  },
  {
    icon: <Dumbbell className="h-8 w-8" />,
    title: "Exercícios Técnicos",
    description:
      "Pratique escalas, arpejos e técnicas com exercícios interativos para desenvolver sua velocidade.",
    color: "#22c55e",
    tab: "exercises" as const,
  },
  {
    icon: <Music2 className="h-8 w-8" />,
    title: "Estudo de Sequências",
    description:
      "Monte progressões harmônicas, escolha tonalidades e descubra encadeamentos que funcionam.",
    color: "#3b82f6",
    tab: "progression" as const,
  },
  {
    icon: <GraduationCap className="h-8 w-8" />,
    title: "Plano de Estudos",
    description:
      "Organize sua rotina musical com metas semanais e acompanhe seu progresso de evolução.",
    color: "#eab308",
    tab: "plan" as const,
  },
  {
    icon: <CavaquinhoIcon className="h-8 w-8" />,
    title: "Criador de Diagramas",
    description:
      "Crie diagramas de acordes personalizados e exporte em SVG ou PNG de alta qualidade.",
    color: "#f43f5e",
    tab: "diagram" as const,
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Comunidade",
    description:
      "Em breve: compartilhe suas criações, descubra sequências de outros músicos e aprenda junto.",
    color: "#8b5cf6",
    tab: "community" as const,
  },
];

const WELCOME_KEY = "sambatune_welcome_seen";

interface WelcomeTourProps {
  onNavigate: (tab: string) => void;
}

export function WelcomeTour({ onNavigate }: WelcomeTourProps) {
  const { user, isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(-1); // -1 = welcome screen, 0+ = tour steps

  useEffect(() => {
    if (!isAuthenticated) return;
    const seen = localStorage.getItem(WELCOME_KEY);
    if (!seen) {
      setVisible(true);
    }
  }, [isAuthenticated]);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(WELCOME_KEY, "true");
  }

  function handleStartTour() {
    setStep(0);
  }

  function handleSkipTour() {
    dismiss();
  }

  function handleNext() {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onNavigate(TOUR_STEPS[0].tab);
      dismiss();
    }
  }

  function handlePrev() {
    if (step > 0) setStep(step - 1);
    else setStep(-1);
  }

  function handleGoToTab(tab: string) {
    onNavigate(tab);
    dismiss();
  }

  if (!visible) return null;

  const firstName = user?.name?.split(" ")[0] || "Músico";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white border-3 border-black shadow-[8px_8px_0px_black] w-full max-w-lg overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleSkipTour}
          className="absolute top-3 right-3 z-10 p-1.5 hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {step === -1 ? (
          /* ── Welcome Screen ── */
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neo-orange/10 border-3 border-neo-orange mb-6">
              <PartyPopper className="h-10 w-10 text-neo-orange" />
            </div>

            <h2
              className="font-display text-3xl mb-2"
              style={{ fontFamily: "'Luckiest Guy', cursive" }}
            >
              Bem-vindo, {firstName}! 🎸
            </h2>

            <p
              className="text-black/60 mb-6 text-lg"
              style={{ fontFamily: "'Gochi Hand', cursive" }}
            >
              Sua conta foi criada com sucesso! Pronto para dominar cada acorde
              do seu instrumento?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleStartTour}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-neo-orange text-white border-2 border-black font-bold text-sm uppercase tracking-wider shadow-[4px_4px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <Sparkles className="h-5 w-5" />
                Fazer Tour Rápido (30s)
              </button>

              <button
                onClick={handleSkipTour}
                className="w-full px-6 py-3 border-2 border-black bg-white font-bold text-sm uppercase tracking-wider shadow-[3px_3px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_black] transition-all cursor-pointer"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Pular e Começar a Usar
              </button>
            </div>

            <p className="text-xs text-black/30 mt-4">
              Você pode acessar o tour a qualquer momento nas configurações.
            </p>
          </div>
        ) : (
          /* ── Tour Steps ── */
          <div>
            {/* Progress bar */}
            <div className="h-1.5 bg-black/10">
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: `${((step + 1) / TOUR_STEPS.length) * 100}%`,
                  backgroundColor: TOUR_STEPS[step].color,
                }}
              />
            </div>

            <div className="p-8 text-center">
              {/* Step counter */}
              <div className="flex items-center justify-center gap-1.5 mb-6">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: i === step ? 24 : 8,
                      backgroundColor:
                        i === step ? TOUR_STEPS[step].color : "#d1d5db",
                    }}
                  />
                ))}
              </div>

              {/* Icon */}
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border-2 border-black mb-4 text-white shadow-[3px_3px_0px_black]"
                style={{ backgroundColor: TOUR_STEPS[step].color }}
              >
                {TOUR_STEPS[step].icon}
              </div>

              {/* Content */}
              <h3
                className="font-display text-2xl mb-2"
                style={{ fontFamily: "'Luckiest Guy', cursive" }}
              >
                {TOUR_STEPS[step].title}
              </h3>
              <p
                className="text-black/60 mb-8 text-base max-w-sm mx-auto"
                style={{ fontFamily: "'Gochi Hand', cursive" }}
              >
                {TOUR_STEPS[step].description}
              </p>

              {/* Action: go directly to this tab */}
              <button
                onClick={() => handleGoToTab(TOUR_STEPS[step].tab)}
                className="inline-flex items-center gap-1 text-sm font-bold mb-6 hover:underline cursor-pointer"
                style={{ color: TOUR_STEPS[step].color }}
              >
                Abrir agora <ChevronRight className="h-4 w-4" />
              </button>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-black/40 hover:text-black transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {step === 0 ? "Voltar" : "Anterior"}
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-5 py-2.5 border-2 border-black font-bold text-sm shadow-[3px_3px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_black] transition-all cursor-pointer"
                  style={{
                    backgroundColor: TOUR_STEPS[step].color,
                    color: "white",
                  }}
                >
                  {step === TOUR_STEPS.length - 1 ? (
                    "Começar! 🎉"
                  ) : (
                    <>
                      Próximo <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
