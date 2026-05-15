import { createFileRoute, Link } from "@tanstack/react-router";
import { NeubrutalistButton } from "@/components/ui/NeubrutalistButton";
import { NeubrutalistCard } from "@/components/ui/NeubrutalistCard";
import { UserMenu } from "@/components/UserMenu";
import { CavaquinhoIcon } from "@/components/icons/CavaquinhoIcon";
import {
  Music2,
  BookOpen,
  ChevronRight,
  Check,
  Zap,
  Star,
  Users,
  Download,
  ArrowRight,
  Sparkles,
  Dumbbell,
  Gauge,
} from "lucide-react";

export const Route = createFileRoute("/")(  {
  component: LandingPage,
});

/* ── tiny reusable sticker badge ── */
function StickerBadge({
  children,
  rotate = "-2deg",
  className = "",
}: {
  children: React.ReactNode;
  rotate?: string;
  className?: string;
}) {
  return (
    <span
      className={`sticker inline-block px-4 py-1.5 text-xs font-black uppercase tracking-wide ${className}`}
      style={{ "--rotate": rotate } as React.CSSProperties}
    >
      {children}
    </span>
  );
}

/* ── main page ── */
function LandingPage() {
  return (
    <div className="min-h-screen bg-neo-bg text-black font-body selection:bg-neo-orange selection:text-white overflow-x-hidden">
      {/* Dot Grid Overlay */}
      <div className="fixed inset-0 dot-grid pointer-events-none z-0" />

      {/* ━━━━━━━━━━ NAVIGATION ━━━━━━━━━━ */}
      <nav className="sticky top-0 z-50 border-b-3 border-black bg-neo-bg/95 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 border-2 border-black shadow-[3px_3px_0px_theme(colors.neo-orange)]">
              <CavaquinhoIcon className="h-6 w-6" color="#FF6B35" />
            </div>
            <span className="font-display text-3xl tracking-tight">
              <span className="text-neo-orange">Samba</span><span className="text-black">Tune</span>
            </span>
          </div>
          <div className="hidden md:flex gap-8 font-heading text-lg tracking-wide uppercase">
            <a
              href="#features"
              className="hover:text-neo-orange transition-colors"
            >
              Recursos
            </a>
            <a href="#demo" className="hover:text-neo-orange transition-colors">
              Como Funciona
            </a>
            <a
              href="#testimonials"
              className="hover:text-neo-orange transition-colors"
            >
              Músicos
            </a>
          </div>
          <UserMenu />
        </div>
      </nav>

      {/* ━━━━━━━━━━ HERO SECTION ━━━━━━━━━━ */}
      <section className="relative pt-16 pb-28 px-6 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 text-8xl font-display text-black/[0.03] select-none pointer-events-none">
          ♪ ♫ ♬
        </div>
        <div className="absolute bottom-10 right-10 text-9xl font-display text-black/[0.03] select-none pointer-events-none rotate-12">
          🎵
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text content */}
          <div className="z-10 animate-fade-in-up">
            <StickerBadge
              rotate="-3deg"
              className="bg-neo-yellow mb-6"
            >
              🎸 Cavaquinho · Banjo
            </StickerBadge>

            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.95] mb-6 tracking-tight">
              Domine{" "}
              <span className="text-neo-orange outline-text-comic">
                cada acorde
              </span>{" "}
              do seu instrumento.
            </h1>

            <p className="font-accent text-2xl md:text-3xl text-black/70 mb-4 leading-snug max-w-xl">
              "Você fala o acorde. A gente mostra o diagrama."
            </p>

            <p className="text-lg font-medium max-w-xl mb-10 leading-relaxed text-black/80">
              Dicionário inteligente com milhares de posições, gerador de
              diagramas SVG e editor de progressões harmônicas. Tudo que você
              precisa para estudar, ensinar ou compor — em um só lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <Link href="/app">
                <NeubrutalistButton
                  size="xl"
                  className="animate-pulse-glow w-full sm:w-auto"
                >
                  Começar Agora
                  <ChevronRight className="ml-2 h-7 w-7" />
                </NeubrutalistButton>
              </Link>

              <div className="flex items-center gap-4 px-2">
                <div className="flex -space-x-3">
                  {["🎸", "🎵", "🎶", "🎤"].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-11 h-11 rounded-full border-2 border-black bg-neo-yellow flex items-center justify-center text-lg"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold leading-tight">
                  <span className="font-display text-neo-orange text-lg">
                    +1.000
                  </span>
                  <br />
                  músicos já usam
                </p>
              </div>
            </div>
          </div>

          {/* Right — Hero Image */}
          <div className="relative animate-fade-in-up animation-delay-200">
            <div className="animate-float relative z-10">
              <NeubrutalistCard className="relative p-0 overflow-hidden">
                <div className="bg-black text-white px-4 py-2 flex justify-between items-center">
                  <span className="font-heading text-sm tracking-wider uppercase">
                    SambaTune_hero.png
                  </span>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-white/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white/30" />
                  </div>
                </div>
                <div className="bg-gradient-to-b from-neo-bg to-neo-yellow/30 flex justify-center border-t-2 border-black p-6">
                  <img
                    src="/hero-cavaquinho.png"
                    alt="Jovem tocando cavaquinho alegremente — ilustração cartoon"
                    className="w-full h-auto max-w-sm object-contain drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </NeubrutalistCard>
            </div>

            {/* Decorative yellow block behind */}
            <div className="absolute -bottom-5 -right-5 w-full h-full bg-neo-yellow border-2 border-black -z-10" />

            {/* Floating stickers */}
            <StickerBadge
              rotate="6deg"
              className="absolute -top-4 -right-4 bg-neo-orange text-white z-20"
            >
              100% Grátis
            </StickerBadge>
            <StickerBadge
              rotate="-4deg"
              className="absolute -bottom-4 -left-4 bg-white z-20"
            >
              ⚡ SVG + PNG
            </StickerBadge>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ STATS MARQUEE ━━━━━━━━━━ */}
      <section className="border-y-3 border-black bg-black text-white py-5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-12 px-6">
              {[
                { icon: "📖", label: "3.000+ acordes", sub: "no dicionário" },
                {
                  icon: "🎸",
                  label: "2 instrumentos",
                  sub: "cavaquinho · banjo",
                },
                {
                  icon: "🎨",
                  label: "Diagramas SVG",
                  sub: "alta qualidade",
                },
                {
                  icon: "🎵",
                  label: "Progressões",
                  sub: "editor completo",
                },
                {
                  icon: "⚡",
                  label: "100% grátis",
                  sub: "sem limites",
                },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 mr-12">
                  <span className="text-3xl">{stat.icon}</span>
                  <div>
                    <p className="font-display text-lg tracking-tight">
                      {stat.label}
                    </p>
                    <p className="font-heading text-xs tracking-wider uppercase text-white/60">
                      {stat.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━ FEATURES GRID ━━━━━━━━━━ */}
      <section id="features" className="py-24 px-6 bg-white border-b-3 border-black relative">
        <div className="absolute inset-0 dot-grid pointer-events-none z-0" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <StickerBadge rotate="2deg" className="bg-neo-yellow mb-4">
              ✨ Tudo em um só app
            </StickerBadge>
            <h2 className="font-display text-5xl md:text-7xl tracking-tight mb-4">
              Recursos{" "}
              <span className="text-neo-orange">Profissionais</span>
            </h2>
            <p className="font-accent text-xl text-black/60">
              Muito mais que um dicionário de acordes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <NeubrutalistCard className="hover:bg-neo-yellow transition-all duration-300 group cursor-pointer">
              <div className="bg-black w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <BookOpen className="text-neo-orange h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl mb-3 tracking-tight">
                Dicionário Infinito
              </h3>
              <p className="font-medium leading-relaxed text-black/70">
                Milhares de shapes e voicings para cada acorde.
                Escalas aplicadas por acorde, posições abertas e fechadas.
              </p>
              <div className="mt-6 flex items-center gap-2 font-heading text-sm tracking-wider uppercase text-neo-orange">
                Explorar <ArrowRight className="h-4 w-4" />
              </div>
            </NeubrutalistCard>

            {/* Feature 2 — highlighted */}
            <NeubrutalistCard className="bg-neo-orange text-white relative overflow-visible">
              <StickerBadge
                rotate="-4deg"
                className="absolute -top-3 -right-3 bg-neo-yellow text-black z-10"
              >
                ⭐ Popular
              </StickerBadge>
              <div className="bg-white w-16 h-16 flex items-center justify-center mb-6">
                <Music2 className="text-neo-orange h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl mb-3 tracking-tight">
                Sequências Harmônicas
              </h3>
              <p className="font-medium leading-relaxed text-white/85">
                Monte progressões, escolha o melhor encadeamento
                de voicings e toque junto com batucadas em vários andamentos.
              </p>
              <div className="mt-6 flex items-center gap-2 font-heading text-sm tracking-wider uppercase text-white/80">
                Experimentar <ArrowRight className="h-4 w-4" />
              </div>
            </NeubrutalistCard>

            {/* Feature 3 */}
            <NeubrutalistCard className="hover:bg-neo-yellow transition-all duration-300 group cursor-pointer">
              <div className="bg-black w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                <Dumbbell className="text-neo-orange h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl mb-3 tracking-tight">
                Treino Completo
              </h3>
              <p className="font-medium leading-relaxed text-black/70">
                Exercícios técnicos, metrônomo integrado, shapes de escalas
                e prática direcionada para evoluir de verdade.
              </p>
              <div className="mt-6 flex items-center gap-2 font-heading text-sm tracking-wider uppercase text-neo-orange">
                Treinar agora <ArrowRight className="h-4 w-4" />
              </div>
            </NeubrutalistCard>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ HOW IT WORKS ━━━━━━━━━━ */}
      <section id="demo" className="py-24 px-6 relative">
        <div className="absolute inset-0 dot-grid pointer-events-none z-0" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-7xl tracking-tight mb-4">
              Como <span className="text-neo-orange">funciona?</span>
            </h2>
            <p className="font-accent text-xl text-black/60">
              Simples assim. Sem complicação.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <CavaquinhoIcon className="h-8 w-8" color="white" />,
                title: "Escolha o instrumento",
                desc: "Cavaquinho ou Banjo — mesma afinação DGBD. Shapes, escalas e voicings dedicados.",
              },
              {
                step: "02",
                icon: <Sparkles className="h-8 w-8" />,
                title: "Explore o dicionário",
                desc: "Busque qualquer acorde e veja todos os shapes possíveis. Aplique escalas por acorde.",
              },
              {
                step: "03",
                icon: <Gauge className="h-8 w-8" />,
                title: "Treine com ritmo",
                desc: "Monte sequências harmônicas, toque junto com batucadas e metrônomo em vários andamentos.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="font-display text-8xl text-neo-orange/15 absolute -top-6 -left-2 select-none">
                  {item.step}
                </div>
                <NeubrutalistCard className="relative bg-neo-bg hover:translate-y-[-4px] transition-transform duration-300">
                  <div className="bg-neo-orange w-14 h-14 flex items-center justify-center mb-5 text-white">
                    {item.icon}
                  </div>
                  <h3 className="font-display text-xl mb-3">{item.title}</h3>
                  <p className="text-black/70 leading-relaxed">{item.desc}</p>
                </NeubrutalistCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ SOCIAL PROOF ━━━━━━━━━━ */}
      <section
        id="testimonials"
        className="py-24 px-6 bg-white border-y-3 border-black overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left column */}
            <div className="flex-1 animate-slide-left">
              <StickerBadge rotate="-2deg" className="bg-neo-orange text-white mb-6">
                💬 Depoimentos reais
              </StickerBadge>
              <h2 className="font-display text-4xl md:text-6xl tracking-tight mb-8 leading-[0.95]">
                O que os{" "}
                <span className="bg-black text-white px-3 inline-block transform -rotate-1">
                  mestres
                </span>{" "}
                estão dizendo
              </h2>

              <NeubrutalistCard
                variant="yellow"
                className="relative transform -rotate-1"
              >
                <p className="font-accent text-2xl mb-6 leading-snug">
                  "O SambaTune mudou a forma como eu preparo meus materiais
                  de aula. A precisão dos diagramas é imbatível."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-neo-orange font-display text-lg">
                    RS
                  </div>
                  <div>
                    <p className="font-display text-sm tracking-wide">
                      Ricardo Silva
                    </p>
                    <p className="font-heading text-xs tracking-wider uppercase text-black/50">
                      Professor de Cavaquinho
                    </p>
                  </div>
                </div>
                <Star className="absolute -top-5 -right-5 h-10 w-10 text-black fill-neo-orange" />
              </NeubrutalistCard>
            </div>

            {/* Right column — grid of highlights */}
            <div className="flex-1 grid grid-cols-2 gap-5 animate-slide-right">
              {[
                { label: "Intuitivo & Rápido", icon: <Zap className="h-6 w-6 text-neo-orange" />, bg: "" },
                { label: "Design Premium", icon: <Star className="h-6 w-6" />, bg: "bg-neo-orange text-white" },
                { label: "Focado em Resultados", icon: <Check className="h-6 w-6" />, bg: "bg-black text-white" },
                { label: "Comunidade Ativa", icon: <Users className="h-6 w-6 text-neo-orange" />, bg: "" },
              ].map((item, i) => (
                <NeubrutalistCard
                  key={i}
                  className={`h-44 flex flex-col items-center justify-center text-center p-4 gap-3 hover:translate-y-[-4px] transition-transform duration-300 ${i % 2 === 0 ? "mt-8" : ""} ${item.bg}`}
                >
                  {item.icon}
                  <p className="font-display text-sm">{item.label}</p>
                </NeubrutalistCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ INSTRUMENTS SECTION ━━━━━━━━━━ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-7xl tracking-tight mb-4">
              Feito para{" "}
              <span className="text-neo-orange">seu instrumento</span>
            </h2>
            <p className="font-accent text-xl text-black/60">
              Suporte completo para os instrumentos mais populares do Brasil.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Cavaquinho",
                emoji: "🎸",
                tuning: "Ré · Sol · Si · Ré (DGBD)",
                chords: "1.500+",
                desc: "A alma do samba e do pagode. Shapes, escalas e voicings tradicionais e modernos.",
              },
              {
                name: "Banjo",
                emoji: "🪕",
                tuning: "Ré · Sol · Si · Ré (DGBD)",
                chords: "1.200+",
                desc: "O som raiz do sertanejo e do forró. Mesma afinação do cavaquinho, shapes dedicados.",
              },
            ].map((inst, i) => (
              <NeubrutalistCard
                key={i}
                className="group hover:bg-neo-yellow transition-all duration-300 cursor-pointer"
              >
                <div className="text-5xl mb-4">{inst.emoji}</div>
                <h3 className="font-display text-3xl mb-2">{inst.name}</h3>
                <p className="font-heading text-sm tracking-wider uppercase text-black/50 mb-4">
                  {inst.tuning}
                </p>
                <p className="text-black/70 leading-relaxed mb-6">
                  {inst.desc}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl text-neo-orange">
                    {inst.chords}
                  </span>
                  <span className="font-heading text-xs tracking-wider uppercase text-black/50">
                    posições
                  </span>
                </div>
              </NeubrutalistCard>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ FINAL CTA ━━━━━━━━━━ */}
      <section className="py-32 px-6 bg-neo-yellow border-t-3 border-black text-center relative overflow-hidden">
        {/* Background watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <span className="font-display text-[18rem] md:text-[24rem] text-black transform -rotate-12">
            SAMBA
          </span>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <StickerBadge rotate="3deg" className="bg-black text-white mb-6">
            🚀 Grátis para sempre
          </StickerBadge>
          <h2 className="font-display text-5xl md:text-8xl tracking-tight mb-6 leading-[0.9]">
            Pronto para{" "}
            <span className="text-neo-orange outline-text-comic">
              começar?
            </span>
          </h2>
          <p className="font-accent text-2xl mb-10 text-black/70">
            Junte-se a centenas de músicos e simplifique seus estudos hoje
            mesmo.
          </p>
          <Link href="/app">
            <NeubrutalistButton size="xl" className="px-16 animate-pulse-glow">
              Acessar Agora <ArrowRight className="ml-3 h-7 w-7" />
            </NeubrutalistButton>
          </Link>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 font-heading text-sm tracking-wider uppercase text-black/50">
            {["Sem cadastro obrigatório", "100% gratuito", "Sem anúncios"].map(
              (item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neo-orange" />
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ FOOTER ━━━━━━━━━━ */}
      <footer className="bg-black text-white py-14 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-neo-orange p-1.5">
              <CavaquinhoIcon className="h-5 w-5" color="white" />
            </div>
            <span className="font-display text-2xl tracking-tight">
              <span className="text-neo-orange">Samba</span>Tune
            </span>
          </div>

          <p className="font-heading text-sm tracking-wider uppercase text-white/40">
            © 2026 SambaTune · Todos os direitos reservados
          </p>

          <div className="flex gap-8 font-heading text-xs tracking-widest uppercase">
            <a
              href="#"
              className="hover:text-neo-orange transition-colors text-white/60"
            >
              Privacidade
            </a>
            <a
              href="#"
              className="hover:text-neo-orange transition-colors text-white/60"
            >
              Termos
            </a>
            <a
              href="#"
              className="hover:text-neo-orange transition-colors text-white/60"
            >
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
