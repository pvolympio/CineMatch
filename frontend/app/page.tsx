'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Film, Sparkles, Flame, Compass, ArrowRight, Star, Zap, Network, Play } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Algoritmo Adaptativo',
    desc: 'Modelo de ML que evolui com cada avaliação sua, mapeando nuances de gosto.',
    accent: 'vinyl',
  },
  {
    icon: Sparkles,
    title: 'Curadoria Editorial',
    desc: 'Recomendações com contexto crítico — não apenas uma lista, mas uma programação.',
    accent: 'velvet',
  },
  {
    icon: Network,
    title: 'Grafo Relacional',
    desc: 'Visualize as conexões entre filmes, diretores, gêneros e suas preferências.',
    accent: 'vinyl',
  },
  {
    icon: Star,
    title: 'DNA Cinematográfico',
    desc: 'Seu perfil de espectador modelado em eixos de narrativa, ritmo e estética.',
    accent: 'velvet',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-[#F0E6D2] relative overflow-hidden font-display">
      <div className="film-texture" />
      <Navbar />

      {/* Ambient Light Blobs - Estilo cinema vintage */}
      <div className="ambient-blob w-[600px] h-[600px] -top-48 -left-48 opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(201, 163, 117, 0.18) 0%, transparent 70%)' }} />
      <div className="ambient-blob w-[500px] h-[500px] top-1/3 -right-40 opacity-25"
           style={{ background: 'radial-gradient(circle, rgba(30, 77, 62, 0.12) 0%, transparent 70%)' }} />
      <div className="ambient-blob w-[400px] h-[400px] bottom-0 left-1/3 opacity-20"
           style={{ background: 'radial-gradient(circle, rgba(52, 44, 30, 0.1) 0%, transparent 70%)' }} />

      {/* Hero */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 pt-20 pb-16">
        <div className="max-w-5xl w-full text-center">

          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 mb-8 animate-fade-up">
            <Badge variant="vinyl" className="text-[10px] uppercase tracking-wider py-1.5 px-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A36F] animate-pulse inline-block" />
              Recomendação Cinematográfica
            </Badge>
          </div>

          {/* Headline */}
          <h1
            className="type-hero text-[clamp(2.5rem,8vw,6rem)] text-white mb-6 animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            O cinema que
            <br />
            <span className="text-gradient-vinyl">define você.</span>
          </h1>

          {/* Sub */}
          <p
            className="text-[#5A5A5A] text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10 font-normal animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            Não é apenas uma lista de filmes. É um mapeamento do seu gosto,
            traduzido em curadoria editorial e personalidade cinematográfica.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
            <Link href="/register">
              <Button variant="vinyl" size="xl" className="gap-2 min-w-[200px]">
                <Play className="w-4 h-4 fill-current" />
                <span>Começar Gratuitamente</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="xl" className="gap-2 min-w-[160px]">
                <span>Já tenho conta</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-fade-up" style={{ animationDelay: '500ms' }}>
          <span className="font-mono text-[10px] tracking-widest text-[#5A5A5A] uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#5A5A5A] to-transparent" />
        </div>
      </section>

      {/* Feature Bento */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mb-12 text-center">
          <h2 className="type-title text-3xl sm:text-5xl text-white mb-3">
            Inteligência de espectador.
          </h2>
          <p className="text-[#5A5A5A] font-mono text-xs tracking-widest uppercase">
            Quatro pilares — uma experiência única
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="card-cinema p-6 sm:p-8 group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: f.accent === 'vinyl'
                      ? 'rgba(201, 163, 117, 0.15)'
                      : 'rgba(30, 77, 62, 0.12)',
                    border: `1px solid ${f.accent === 'vinyl' ? 'rgba(201, 163, 117, 0.3)' : 'rgba(30, 77, 62, 0.3)'}`
                  }}
                >
                  <Icon className="w-5 h-5" style={{
                    color: f.accent === 'vinyl' ? '#C9A36F' : '#1E4D3E'
                  }} />
                </div>
                <h3 className="type-label text-[15px] text-white mb-2">{f.title}</h3>
                <p className="text-[#5A5A5A] text-sm leading-relaxed font-normal">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Nav Icons Footer Hint */}
      <section className="relative z-10 border-t border-white/10 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="type-quote text-[#8A8A90] text-sm italic max-w-xs">
              &ldquo;Cinema não é apenas entretenimento — é a forma como processamos o mundo.&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/discover">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Descobrir
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Explorar
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}