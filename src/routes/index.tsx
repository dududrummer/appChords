import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Download,
  Gauge,
  Music2,
  Play,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { CavaquinhoIcon } from "@/components/icons/CavaquinhoIcon";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const landingVars = {
  "--paper": "#FBF5E5",
  "--cream": "#FFF8E7",
  "--cream-dark": "#FFE8B0",
  "--ink": "#1A1A1A",
  "--ink-soft": "#2D2D2D",
  "--orange": "#FF5722",
  "--orange-dark": "#D84315",
  "--yellow": "#FFC107",
  "--blue": "#2196F3",
  "--green": "#4CAF50",
  "--pink": "#EC407A",
  "--display": "'Bowlby One', sans-serif",
  "--display-light": "'Anton', sans-serif",
  "--body": "'DM Sans', sans-serif",
  "--shadow": "6px 6px 0 #1A1A1A",
  "--shadow-lift": "10px 10px 0 #1A1A1A",
} as CSSProperties;

function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border-[3px] border-[var(--ink)] px-4 py-2 text-xs font-black uppercase tracking-wide shadow-[var(--shadow)] ${className}`}
    >
      {children}
    </span>
  );
}

function ComicCard({
  children,
  className = "",
  rotate = "0deg",
}: {
  children: ReactNode;
  className?: string;
  rotate?: string;
}) {
  return (
    <div
      className={`rounded-xl border-[3px] border-[var(--ink)] bg-white p-6 shadow-[var(--shadow)] transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${className}`}
      style={{ transform: `rotate(${rotate})` }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <Pill className="mb-5 bg-[var(--yellow)] text-[var(--ink)]">{eyebrow}</Pill>
      <h2 className="text-balance text-4xl leading-[1.05] text-[var(--ink)] md:text-6xl [font-family:var(--display-light)]">
        {children}
      </h2>
    </div>
  );
}

function LandingPage() {
  const features = [
    {
      icon: <BookOpen className="h-7 w-7" />,
      title: "Dicionário Interativo",
      text: "Encontre shapes por região, compare voicings e leve o acorde certo para a sequência.",
      color: "bg-[var(--yellow)]",
    },
    {
      icon: <Music2 className="h-7 w-7" />,
      title: "Sequências Harmônicas",
      text: "Monte caminhos clássicos do samba ou crie progressões próprias com encadeamento inteligente.",
      color: "bg-[var(--orange)] text-white",
    },
    {
      icon: <Gauge className="h-7 w-7" />,
      title: "Prática com Ritmo",
      text: "Toque com batucadas, metrônomo e exercícios para transformar teoria em som real.",
      color: "bg-[var(--blue)] text-white",
    },
  ];

  const steps = [
    "Escolha cavaquinho ou banjo e procure o acorde.",
    "Compare posições próximas no braço do instrumento.",
    "Monte uma sequência e pratique com ritmo.",
    "Salve, compartilhe ou exporte seus diagramas.",
  ];

  const tools = [
    { icon: <Sparkles className="h-5 w-5" />, label: "Arpejos por região" },
    { icon: <Download className="h-5 w-5" />, label: "Exportação SVG/PNG" },
    { icon: <Users className="h-5 w-5" />, label: "Comunidade musical" },
    { icon: <Zap className="h-5 w-5" />, label: "Shapes essenciais" },
  ];

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[var(--paper)] text-[var(--ink)] selection:bg-[var(--orange)] selection:text-white [font-family:var(--body)]"
      style={landingVars}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bowlby+One&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,600&display=swap');
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-0 hidden bg-[radial-gradient(circle,rgba(26,26,26,0.045)_1.5px,transparent_1.5px)] [background-size:14px_14px] md:block" />
      <div className="fixed left-0 top-0 z-[60] h-1 w-full bg-[var(--orange)]" />

      <nav className="fixed left-1/2 top-4 z-50 flex max-w-[calc(100%-24px)] -translate-x-1/2 items-center gap-3 rounded-full border-[3px] border-[var(--ink)] bg-white px-4 py-3 shadow-[var(--shadow)] md:gap-5 md:px-6">
        <Link to="/" className="flex items-center gap-2 whitespace-nowrap">
          <CavaquinhoIcon className="h-5 w-5 text-[var(--orange)]" color="currentColor" />
          <span className="text-xs tracking-wide md:text-sm [font-family:var(--display)]">
            <span className="hidden sm:inline">Samba</span>
            <span className="text-[var(--orange)]">Tune</span>
          </span>
        </Link>
        <div className="hidden h-7 w-px bg-black/15 sm:block" />
        <a href="#recursos" className="hidden text-xs font-black uppercase tracking-wide md:block">
          Recursos
        </a>
        <a
          href="#como-funciona"
          className="hidden text-xs font-black uppercase tracking-wide lg:block"
        >
          Como funciona
        </a>
        <Link
          to="/app"
          className="rounded-full border-[3px] border-[var(--ink)] bg-[var(--orange)] px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] md:px-6"
        >
          Abrir App
        </Link>
      </nav>

      <main className="relative z-10">
        <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_82%_30%,rgba(255,87,34,0.14),transparent_48%),radial-gradient(circle_at_10%_78%,rgba(255,193,7,0.18),transparent_42%)] px-6 pb-20 pt-32 md:pt-40">
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="mb-7 flex flex-col leading-none">
                <span className="mb-3 text-[11px] font-black uppercase tracking-[0.55em] text-black/70">
                  Cavaquinho · Banjo
                </span>
                <span className="inline-flex origin-left -rotate-2 flex-wrap text-5xl leading-[0.9] [font-family:var(--display)] sm:text-6xl lg:text-7xl">
                  <span className="text-[var(--ink)] [text-shadow:4px_4px_0_var(--orange)]">
                    Samba
                  </span>
                  <span className="text-[var(--orange)] [text-shadow:4px_4px_0_var(--ink)]">
                    Tune
                  </span>
                </span>
              </div>

              <Pill className="mb-6 -rotate-1 bg-[var(--ink)] text-[var(--yellow)]">
                <Zap className="h-4 w-4" /> Menos teoria solta, mais prática organizada.
              </Pill>

              <h1 className="max-w-2xl text-balance text-4xl uppercase leading-[1.08] text-[var(--ink)] sm:text-5xl lg:text-6xl [font-family:var(--display-light)]">
                Acordes,{" "}
                <span className="inline-block -rotate-1 bg-[var(--orange)] px-3 text-white">
                  sequências
                </span>{" "}
                e ritmo para tocar melhor.
              </h1>

              <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-black/70">
                Um app prático para estudar samba, pagode e repertório real: dicionário de acordes,
                progressões harmônicas, diagramas e treino guiado no mesmo lugar.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {["DGBD", "Shapes", "Batucadas", "SVG + PNG"].map((tag, index) => (
                  <span
                    key={tag}
                    className={`rounded-md border-2 border-[var(--ink)] bg-white px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_var(--ink)] ${
                      index % 2 ? "rotate-1" : "-rotate-1"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  to="/app"
                  className="inline-flex items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-[var(--orange)] px-8 py-4 text-base font-black uppercase tracking-wide text-white shadow-[var(--shadow)] transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                >
                  Começar agora <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-white px-7 py-4 text-base font-black uppercase tracking-wide shadow-[var(--shadow)] transition-transform hover:-translate-x-1 hover:-translate-y-1"
                >
                  Ver fluxo <Play className="ml-2 h-4 w-4 fill-current" />
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -right-5 -top-5 rotate-6 rounded-lg border-[3px] border-[var(--ink)] bg-[var(--yellow)] px-4 py-3 text-sm font-black uppercase shadow-[var(--shadow)]">
                prático
              </div>
              <div className="absolute -bottom-4 -left-4 z-20 -rotate-3 rounded-lg border-[3px] border-[var(--ink)] bg-white px-4 py-3 text-sm font-black uppercase shadow-[var(--shadow)]">
                samba real
              </div>
              <div className="rounded-3xl border-[4px] border-[var(--ink)] bg-[var(--cream)] p-5 shadow-[var(--shadow-lift)]">
                <div className="mb-4 flex items-center justify-between rounded-full border-[3px] border-[var(--ink)] bg-white px-4 py-2">
                  <span className="text-xs font-black uppercase tracking-wide">modo estudo</span>
                  <span className="h-3 w-3 rounded-full bg-[var(--green)]" />
                </div>
                <img
                  src="/hero-cavaquinho.png?v=20260515"
                  alt="Ilustração de jovem tocando cavaquinho"
                  className="mx-auto max-h-[430px] object-contain drop-shadow-[6px_6px_0_rgba(26,26,26,0.22)]"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="px-6 py-20">
          <SectionTitle eyebrow="recursos principais">
            Tudo que você precisa para sair do shape solto e chegar no som.
          </SectionTitle>

          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <ComicCard key={feature.title} className={index === 1 ? "md:-mt-5" : ""}>
                <div
                  className={`mb-5 inline-flex rounded-xl border-[3px] border-[var(--ink)] p-4 shadow-[4px_4px_0_var(--ink)] ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-2xl uppercase leading-tight [font-family:var(--display-light)]">
                  {feature.title}
                </h3>
                <p className="font-semibold leading-7 text-black/70">{feature.text}</p>
              </ComicCard>
            ))}
          </div>
        </section>

        <section className="bg-[var(--ink)] px-6 py-12 text-white">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => (
              <div
                key={tool.label}
                className="flex items-center gap-3 rounded-xl border-[3px] border-white bg-white/10 p-4 shadow-[5px_5px_0_var(--orange)]"
              >
                <span className="rounded-lg bg-[var(--orange)] p-2 text-white">{tool.icon}</span>
                <span className="text-sm font-black uppercase tracking-wide">{tool.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="px-6 py-20">
          <SectionTitle eyebrow="fluxo de estudo">
            Quatro passos para transformar acorde em repertório.
          </SectionTitle>

          <div className="mx-auto max-w-4xl">
            {steps.map((step, index) => (
              <div key={step} className="relative pl-12">
                {index < steps.length - 1 && (
                  <div className="absolute left-[19px] top-12 h-full w-1 bg-[var(--ink)]" />
                )}
                <div className="mb-6 rounded-xl border-[3px] border-[var(--ink)] bg-white p-5 shadow-[var(--shadow)]">
                  <div className="absolute left-0 top-4 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--orange)] text-sm font-black text-white shadow-[3px_3px_0_var(--ink)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="text-lg font-black">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-8 rounded-3xl border-[4px] border-[var(--ink)] bg-[var(--orange)] p-8 text-white shadow-[var(--shadow-lift)] md:grid-cols-[0.9fr_1.1fr] md:p-12">
            <div className="rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--cream)] p-5 shadow-[var(--shadow)]">
              <div className="grid grid-cols-2 gap-3">
                {["C7M", "Am7", "Dm7", "G7"].map((chord) => (
                  <div
                    key={chord}
                    className="rounded-xl border-[3px] border-[var(--ink)] bg-white p-4 text-center text-2xl text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] [font-family:var(--display-light)]"
                  >
                    {chord}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Pill className="mb-5 bg-[var(--yellow)] text-[var(--ink)]">comece grátis</Pill>
              <h2 className="text-balance text-4xl uppercase leading-[1.05] md:text-6xl [font-family:var(--display-light)]">
                Abra o app e monte sua primeira sequência.
              </h2>
              <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-white/85">
                Teste o dicionário, escolha os shapes e pratique com ritmo sem depender de material
                espalhado.
              </p>
              <Link
                to="/app"
                className="mt-8 inline-flex items-center rounded-xl border-[3px] border-[var(--ink)] bg-white px-8 py-4 text-base font-black uppercase tracking-wide text-[var(--ink)] shadow-[var(--shadow)] transition-transform hover:-translate-x-1 hover:-translate-y-1"
              >
                Experimentar SambaTune <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <SectionTitle eyebrow="por que funciona">
            Menos teoria solta, mais prática organizada.
          </SectionTitle>

          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
            {[
              "Visualize acordes de forma clara.",
              "Treine progressões que aparecem em músicas reais.",
              "Crie material limpo para estudo, aula ou repertório.",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-xl border-[3px] border-[var(--ink)] bg-white p-5 font-bold shadow-[var(--shadow)]"
              >
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--orange)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t-[3px] border-[var(--ink)] bg-[var(--ink)] px-6 py-10 text-center text-sm font-bold text-white/70">
        © 2026 SambaTune · Acordes, sequências e ritmo
      </footer>
    </div>
  );
}
