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
              Comunidade
            </a>
          </div>
          <UserMenu />
        </div>
      </nav>

      {/* ━━━━━━━━━━ HERO SECTION ━━━━━━━━━━ */}
      <section className="relative pt-16 pb-28 px-6 overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full border-[26px] border-black/[0.04]" />
          <div className="absolute top-24 left-[42%] h-44 w-44 rounded-full border-[18px] border-neo-orange/[0.08]" />
          <div className="absolute -bottom-24 right-12 h-80 w-80 rounded-full border-[30px] border-black/[0.035]" />
          <div className="absolute bottom-20 left-1/4 h-28 w-28 rounded-full bg-neo-yellow/[0.16]" />
          <div className="absolute top-10 right-1/4 h-20 w-20 rounded-full bg-neo-orange/[0.08]" />
        </div>
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
                acordes, arpejos, escalas, sequências
              </span>{" "}
              e muito mais.
            </h1>

            <p className="font-accent text-2xl md:text-3xl text-black/70 mb-4 leading-snug max-w-xl">
              Sequências de samba, dicionário interativo e prática guiada no mesmo lugar.
            </p>

            <p className="text-lg font-medium max-w-xl mb-10 leading-relaxed text-black/80">
              Monte sequências harmônicas clássicas do samba, crie progressões
              personalizadas, encontre os shapes mais usados de cada acorde e
              aplique arpejos e escalas por região para estudar com direção.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <Link href="/app">
                <NeubrutalistButton
                  size="xl"
                  className="animate-pulse-glow w-full sm:w-auto"
                >
                  Experimente Grátis
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
                    src="/hero-cavaquinho.png?v=20260515"
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
              Experimente Grátis
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
                { icon: "📖", label: "Dicionário interativo", sub: "shapes mais usados" },
                {
                  icon: "🎸",
                  label: "2 instrumentos",
                  sub: "cavaquinho · banjo",
                },
                {
                  icon: "🎨",
                  label: "Diagramas próprios",
                  sub: "SVG + PNG",
                },
                {
                  icon: "🎵",
                  label: "Sequências de samba",
                  sub: "clássicas e autorais",
                },
                {
                  icon: "⚡",
                  label: "Experimente grátis",
                  sub: "comece agora",
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
              Estudo{" "}
              <span className="text-neo-orange">completo</span>
            </h2>
            <p className="font-accent text-xl text-black/60">
              Do repertório ao braço do instrumento, com ferramentas feitas para praticar de verdade.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <NeubrutalistCard className="hover:bg-neo-yellow transition-all duration-300 group cursor-pointer">
              <div className="bg-black w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <BookOpen className="text-neo-orange h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl mb-3 tracking-tight">
                Dicionário Interativo
              </h3>
              <p className="font-medium leading-relaxed text-black/70">
                Acesse as posições mais usadas de cada acorde, compare shapes
                por região e leve o melhor voicing para sua sequência.
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
                Use sequências tradicionais do samba ou crie caminhos
                personalizados, com encadeamento inteligente entre os melhores
                shapes.
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
                Ritmo, Escalas e Arpejos
              </h3>
              <p className="font-medium leading-relaxed text-black/70">
                Toque junto com batucadas em vários andamentos, incluindo
                samba-enredo, use metrônomo e aplique escalas e arpejos por
                região do acorde.
              </p>
              <div className="mt-6 flex items-center gap-2 font-heading text-sm tracking-wider uppercase text-neo-orange">
                Praticar <ArrowRight className="h-4 w-4" />
              </div>
            </NeubrutalistCard>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <NeubrutalistCard className="hover:bg-neo-yellow transition-all duration-300 group cursor-pointer">
              <div className="bg-black w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Download className="text-neo-orange h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl mb-3 tracking-tight">
                Diagramas Personalizados
              </h3>
              <p className="font-medium leading-relaxed text-black/70">
                Monte seus próprios acordes, edite marcações, cores e cordas,
                depois exporte diagramas limpos para estudo, aula ou material.
              </p>
              <div className="mt-6 flex items-center gap-2 font-heading text-sm tracking-wider uppercase text-neo-orange">
                Criar diagramas <ArrowRight className="h-4 w-4" />
              </div>
            </NeubrutalistCard>

            <NeubrutalistCard className="hover:bg-neo-yellow transition-all duration-300 group cursor-pointer">
              <div className="bg-black w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                <Users className="text-neo-orange h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl mb-3 tracking-tight">
                Comunidade Musical
              </h3>
              <p className="font-medium leading-relaxed text-black/70">
                Compartilhe sequências, dicas, exercícios e músicas para aplicar
                progressões reais com outros músicos.
              </p>
              <div className="mt-6 flex items-center gap-2 font-heading text-sm tracking-wider uppercase text-neo-orange">
                Participar <ArrowRight className="h-4 w-4" />
              </div>
            </NeubrutalistCard>

            <NeubrutalistCard className="bg-black text-white hover:translate-y-[-4px] transition-transform duration-300">
              <div className="bg-neo-orange w-16 h-16 flex items-center justify-center mb-6">
                <Zap className="text-white h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl mb-3 tracking-tight">
                Do Shape ao Som
              </h3>
              <p className="font-medium leading-relaxed text-white/80">
                Escolha uma sequência, encontre os acordes, encadeie as posições
                e toque com ritmo para transformar teoria em música.
              </p>
              <div className="mt-6 flex items-center gap-2 font-heading text-sm tracking-wider uppercase text-neo-yellow">
                Experimentar <ArrowRight className="h-4 w-4" />
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
              Um fluxo pensado para estudar samba, pagode e repertório real.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <CavaquinhoIcon className="h-8 w-8" color="white" />,
                title: "Escolha uma sequência",
                desc: "Comece pelas sequências mais usadas no samba ou monte uma progressão personalizada para sua música.",
              },
              {
                step: "02",
                icon: <Sparkles className="h-8 w-8" />,
                title: "Encadeie os melhores shapes",
                desc: "Consulte o dicionário interativo, escolha posições próximas e aplique arpejos e escalas na região do acorde.",
              },
              {
                step: "03",
                icon: <Gauge className="h-8 w-8" />,
                title: "Toque com batucada",
                desc: "Pratique com batucadas, samba-enredo e metrônomo em vários andamentos até a sequência virar som.",
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
                Comunidade ativa
              </StickerBadge>
              <h2 className="font-display text-4xl md:text-6xl tracking-tight mb-8 leading-[0.95]">
                Aprenda com{" "}
                <span className="bg-black text-white px-3 inline-block transform -rotate-1">
                  músicos reais
                </span>{" "}
                e repertório vivo
              </h2>

              <NeubrutalistCard
                variant="yellow"
                className="relative transform -rotate-1"
              >
                <p className="font-accent text-2xl mb-6 leading-snug">
                  Compartilhe sequências, exercícios, dicas e músicas para
                  aplicar os caminhos harmônicos que aparecem no samba de
                  verdade.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-neo-orange font-display text-lg">
                    RS
                  </div>
                  <div>
                    <p className="font-display text-sm tracking-wide">
                      Comunidade SambaTune
                    </p>
                    <p className="font-heading text-xs tracking-wider uppercase text-black/50">
                      Sequências · dicas · exercícios
                    </p>
                  </div>
                </div>
                <Star className="absolute -top-5 -right-5 h-10 w-10 text-black fill-neo-orange" />
              </NeubrutalistCard>
            </div>

            {/* Right column — grid of highlights */}
            <div className="flex-1 grid grid-cols-2 gap-5 animate-slide-right">
              {[
                { label: "Sequências Compartilhadas", icon: <Zap className="h-6 w-6 text-neo-orange" />, bg: "" },
                { label: "Dicas de Estudo", icon: <Star className="h-6 w-6" />, bg: "bg-neo-orange text-white" },
                { label: "Exercícios Aplicados", icon: <Check className="h-6 w-6" />, bg: "bg-black text-white" },
                { label: "Músicas para Praticar", icon: <Users className="h-6 w-6 text-neo-orange" />, bg: "" },
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
              Cavaquinho e banjo com foco em samba, pagode, levadas e encadeamentos reais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Cavaquinho",
                emoji: "🎸",
                tuning: "Ré · Sol · Si · Ré (DGBD)",
                chords: "1.500+",
                desc: "A alma do samba e do pagode. Shapes essenciais, escalas por região, arpejos aplicados e sequências prontas para tocar.",
              },
              {
                name: "Banjo",
                emoji: "🪕",
                tuning: "Ré · Sol · Si · Ré (DGBD)",
                chords: "1.200+",
                desc: "Mesma afinação DGBD, com posições dedicadas para estudar acordes, encadeamentos e condução harmônica.",
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
            Experimente grátis
          </StickerBadge>
          <h2 className="font-display text-5xl md:text-8xl tracking-tight mb-6 leading-[0.9]">
            Pronto para{" "}
            <span className="text-neo-orange outline-text-comic">
              começar?
            </span>
          </h2>
          <p className="font-accent text-2xl mb-10 text-black/70">
            Monte sequências, escolha os melhores shapes, pratique com batucada
            e transforme seus estudos em repertório.
          </p>
          <Link href="/app">
            <NeubrutalistButton size="xl" className="px-16 animate-pulse-glow">
              Experimentar Grátis <ArrowRight className="ml-3 h-7 w-7" />
            </NeubrutalistButton>
          </Link>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 font-heading text-sm tracking-wider uppercase text-black/50">
            {["Sequências de samba", "Dicionário interativo", "Diagramas personalizados"].map(
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
