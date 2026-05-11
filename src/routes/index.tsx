import { createFileRoute, Link } from "@tanstack/react-router";
import { NeubrutalistButton } from "@/components/ui/NeubrutalistButton";
import { NeubrutalistCard } from "@/components/ui/NeubrutalistCard";
import { Guitar, Music2, BookOpen, ChevronRight, Check, Play, Zap, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-neo-bg text-black font-sans selection:bg-neo-orange selection:text-white">
      {/* Dot Grid Overlay */}
      <div className="fixed inset-0 dot-grid pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b-2 border-black bg-neo-bg px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-black p-1.5 border-2 border-black">
              <Guitar className="h-6 w-6 text-neo-orange" />
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter italic">appChords</span>
          </div>
          <div className="hidden md:flex gap-8 font-bold uppercase text-sm tracking-tight">
            <a href="#features" className="hover:text-neo-orange transition-colors">Recursos</a>
            <a href="#demo" className="hover:text-neo-orange transition-colors">Demonstração</a>
            <a href="#testimonials" className="hover:text-neo-orange transition-colors">Músicos</a>
          </div>
          <Link href="/app">
            <NeubrutalistButton size="sm">Entrar no App</NeubrutalistButton>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="z-10">
            <div className="inline-block bg-neo-yellow border-2 border-black px-4 py-1 font-black uppercase text-xs mb-6 transform -rotate-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              🚀 A ferramenta definitiva para músicos
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] mb-8 tracking-tighter">
              DOMINE SEU <br />
              <span className="text-neo-orange outline-text">INSTRUMENTO</span> <br />
              COM PRECISÃO.
            </h1>
            <p className="text-xl font-bold max-w-xl mb-10 leading-snug">
              Dicionário inteligente, gerador de diagramas SVG e editor de progressões. Tudo que você precisa para estudar ou ensinar música em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/app">
                <NeubrutalistButton size="xl" className="w-full sm:w-auto">
                  Começar Agora <ChevronRight className="ml-2 h-8 w-8" />
                </NeubrutalistButton>
              </Link>
              <div className="flex items-center gap-4 px-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-black bg-neo-yellow flex items-center justify-center font-black">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm font-black uppercase">
                  +1.000 músicos <br /> já utilizam
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <NeubrutalistCard className="relative z-10 p-0 overflow-hidden transform rotate-2">
              <div className="bg-black text-white px-4 py-2 font-black uppercase text-xs flex justify-between items-center">
                <span>Diagram_C_Major.svg</span>
                <div className="flex gap-1">
                   <div className="w-2 h-2 rounded-full bg-red-500 border border-white" />
                   <div className="w-2 h-2 rounded-full bg-yellow-500 border border-white" />
                   <div className="w-2 h-2 rounded-full bg-green-500 border border-white" />
                </div>
              </div>
              <div className="p-8 bg-white flex justify-center">
                {/* Simplified Mock SVG */}
                <svg width="240" height="320" viewBox="0 0 240 320" className="drop-shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
                  <rect width="240" height="320" fill="white" />
                  {[0, 1, 2, 3].map(i => (
                    <line key={i} x1={40 + i * 53} y1={40} x2={40 + i * 53} y2={280} stroke="black" strokeWidth="3" />
                  ))}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line key={i} x1={40} y1={40 + i * 60} x2={200} y2={40 + i * 60} stroke="black" strokeWidth={i === 0 ? "8" : "3"} />
                  ))}
                  <circle cx="93" cy="130" r="18" fill="#FF5722" stroke="black" strokeWidth="3" />
                  <circle cx="146" cy="190" r="18" fill="#FF5722" stroke="black" strokeWidth="3" />
                  <circle cx="200" cy="250" r="18" fill="#FF5722" stroke="black" strokeWidth="3" />
                </svg>
              </div>
            </NeubrutalistCard>
            <div className="absolute -bottom-6 -right-6 w-full h-full bg-neo-yellow border-2 border-black -z-10" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-white border-y-4 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
              RECURSOS <span className="text-neo-orange">PROFISSIONAIS</span>
            </h2>
            <p className="text-xl font-bold opacity-70 italic">Tudo o que você precisa para levar seu som ao próximo nível.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <NeubrutalistCard className="hover:bg-neo-yellow transition-colors group">
              <div className="bg-black w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="text-neo-orange h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Dicionário Inteligente</h3>
              <p className="font-bold leading-tight">Milhares de posições para Cavaquinho, Violão e Ukulele. Encontre o shape perfeito para qualquer música.</p>
            </NeubrutalistCard>

            <NeubrutalistCard className="bg-neo-orange text-white">
              <div className="bg-white w-14 h-14 flex items-center justify-center mb-6">
                <Music2 className="text-neo-orange h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Editor de Progressões</h3>
              <p className="font-bold leading-tight">Crie sequências harmônicas complexas em segundos. Visualize o braço do instrumento enquanto compõe.</p>
            </NeubrutalistCard>

            <NeubrutalistCard className="hover:bg-neo-yellow transition-colors group">
              <div className="bg-black w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-neo-orange h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Exportação em Alta</h3>
              <p className="font-bold leading-tight">Gere diagramas em SVG ou PNG de alta qualidade para seus métodos, livros ou redes sociais.</p>
            </NeubrutalistCard>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="testimonials" className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
               <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-none">
                 O QUE OS <br /> <span className="bg-black text-white px-2">MESTRES</span> <br /> ESTÃO DIZENDO
               </h2>
               <NeubrutalistCard variant="yellow" className="relative transform -rotate-1">
                 <p className="text-2xl font-black italic mb-4">"O appChords mudou a forma como eu preparo meus materiais de aula. A precisão dos diagramas é imbatível."</p>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-black rounded-full" />
                   <div>
                     <p className="font-black uppercase text-sm">Ricardo Silva</p>
                     <p className="font-bold text-xs opacity-60">Professor de Cavaquinho</p>
                   </div>
                 </div>
                 <Star className="absolute -top-6 -right-6 h-12 w-12 text-black fill-neo-orange" />
               </NeubrutalistCard>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
               <div className="space-y-4 pt-12">
                  <NeubrutalistCard className="h-40 flex items-center justify-center text-center p-4">
                    <p className="font-black uppercase text-sm">Intuitivo & Rápido</p>
                  </NeubrutalistCard>
                  <NeubrutalistCard className="h-40 bg-neo-orange text-white flex items-center justify-center text-center p-4">
                    <p className="font-black uppercase text-sm">Design <br /> Premium</p>
                  </NeubrutalistCard>
               </div>
               <div className="space-y-4">
                  <NeubrutalistCard className="h-40 bg-black text-white flex items-center justify-center text-center p-4">
                    <p className="font-black uppercase text-sm">Focado em <br /> Resultados</p>
                  </NeubrutalistCard>
                  <NeubrutalistCard className="h-40 flex items-center justify-center text-center p-4">
                    <p className="font-black uppercase text-sm">Suporte <br /> Especializado</p>
                  </NeubrutalistCard>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-neo-yellow border-t-4 border-black text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="text-[20rem] font-black uppercase tracking-tighter text-black select-none leading-none transform -rotate-12 translate-y-20">
             CHORDS
          </div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-none">
            PRONTO PARA <br /> COMEÇAR?
          </h2>
          <p className="text-xl font-bold mb-12">Junte-se a centenas de músicos e simplifique seus estudos hoje mesmo.</p>
          <Link href="/app">
            <NeubrutalistButton size="xl" className="px-16">
              Acessar Agora
            </NeubrutalistButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6 border-t-4 border-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Guitar className="h-6 w-6 text-neo-orange" />
            <span className="text-2xl font-black uppercase tracking-tighter italic">appChords</span>
          </div>
          <p className="font-bold text-sm opacity-60">© 2026 appChords. Todos os direitos reservados.</p>
          <div className="flex gap-6 font-bold uppercase text-xs tracking-widest">
            <a href="#" className="hover:text-neo-orange transition-colors">Privacy</a>
            <a href="#" className="hover:text-neo-orange transition-colors">Terms</a>
            <a href="#" className="hover:text-neo-orange transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
