'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { profile as profileApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { CinematicProfile } from '@/types';
import Navbar from '@/components/layout/Navbar';
import GenreChart from '@/components/profile/GenreChart';
import NarrativeChart from '@/components/profile/NarrativeChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Film, Sparkles, Flame, Compass,
  BarChart3, Brain, Clapperboard,
  Award,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useStore();
  const [profileData, setProfileData] = useState<CinematicProfile | null>(null);
  const [stats, setStats]             = useState<Record<string, number> | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchData();
  }, [isAuthenticated, router]);

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([profileApi.get(), profileApi.stats()]);
      if (pRes.onboarding_needed) { router.push('/onboarding'); return; }
      setProfileData(pRes.profile as CinematicProfile);
      setStats(sRes.stats as Record<string, number>);
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  };

  if (loading) return (
    <main className="min-h-screen bg-black flex items-center justify-center font-display">
      <div className="film-texture" />
      <Navbar />
      <div className="flex flex-col items-center gap-3 z-10">
        <div className="w-10 h-10 rounded-xl bg-[rgba(201,163,117,0.15)] border border-[rgba(201,163,117,0.3)] flex items-center justify-center animate-pulse">
          <Film className="w-5 h-5 text-[#C9A36F]" />
        </div>
        <p className="font-mono text-[11px] text-[#5A5A5A] uppercase tracking-widest">Carregando arquivo...</p>
      </div>
    </main>
  );

  if (!profileData) return null;

  const personality = profileData.personality;

  const styleLabels: Record<string, string> = {
    sci_fi: 'Ficção Científica', drama: 'Drama', action: 'Ação',
    comedy: 'Comédia', thriller: 'Thriller', horror: 'Terror',
    animation: 'Animação', documentary: 'Documentário',
  };

  return (
    <main className="min-h-screen bg-black text-[#F0E6D2] pb-28 relative font-display">
      <div className="film-texture" />
      <Navbar />

      {/* Ambient light */}
      <div className="ambient-blob w-[500px] h-[500px] top-0 left-0 opacity-8"
           style={{ background: 'radial-gradient(circle, rgba(201, 163, 117, 0.3) 0%, transparent 70%)' }} />
      <div className="ambient-blob w-[400px] h-[400px] bottom-1/4 right-0 opacity-6"
           style={{ background: 'radial-gradient(circle, rgba(30, 77, 62, 0.15) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 relative z-10">

        {/* ── Identity Header ── */}
        <section className="mb-10 pt-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              {/* Label */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A36F] animate-pulse" />
                <span className="font-mono text-[10px] text-[#5A5A5A] uppercase tracking-[0.14em]">
                  Arquivo de Espectador
                </span>
              </div>

              {/* Username */}
              <h1 className="type-hero text-[clamp(2.8rem,7vw,5rem)] text-white leading-[0.9] tracking-[-0.03em] mb-4">
                {user?.username?.toUpperCase()}
              </h1>

              {/* Archetype */}
              {personality && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-8 h-8 rounded-xl bg-[rgba(201, 163, 117,0.1)] border border-[rgba(201, 163, 117, 0.25)] flex items-center justify-center">
                    <Award className="w-4 h-4 text-[#C9A36F]" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-[13px] text-white">{personality.name}</p>
                    <p className="font-mono text-[10px] text-[#8A8A90]">{personality.desc}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link href="/discover">
                <Button variant="vinyl" size="md" className="gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Recomendações
                </Button>
              </Link>
              <Link href="/swipe">
                <Button variant="outline" size="md" className="gap-2">
                  <Flame className="w-3.5 h-3.5" />
                  Avaliar
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="ghost" size="md" className="gap-2">
                  <Compass className="w-3.5 h-3.5" />
                  Grafo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Divider + Stats ── */}
        <div className="divider mb-8" />

        {stats && (
          <section className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { v: stats.total_rated,    l: 'Avaliados',   accent: '#C9A36F' },
              { v: `${stats.avg_rating || 0}`,l: 'Nota Média',  accent: '#C9A36F' },
              { v: stats.loved,          l: 'Aclamados',   accent: '#C9A36F' },
              { v: stats.watchlist_count,l: 'Watchlist',   accent: '#1E4D3E' },
            ].map((s, i) => (
              <div key={i} className="card-cinema p-5">
                <p className="font-mono text-[10px] text-[#5A5A5A] uppercase tracking-[0.1em] mb-2">{s.l}</p>
                <p className="font-mono font-semibold text-[2.25rem] tracking-[-0.04em] leading-none" style={{ color: s.accent }}>
                  {s.v ?? 0}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* ── Analytics Bento ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* Genre Radar — 7 cols */}
          <div className="md:col-span-7 card-cinema p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[rgba(201, 163, 117,0.1)] border border-[rgba(201, 163, 117, 0.25)] flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-[#C9A36F]" />
                </div>
                <div>
                  <h2 className="type-label text-[13px] text-white font-bold uppercase tracking-[0.04em]">Radar de Gêneros</h2>
                  <p className="font-mono text-[10px] text-[#5A5A5A]">Afinidade estatística</p>
                </div>
              </div>
              <Badge variant="vinyl" className="text-[9px]">2D Radar</Badge>
            </div>

            {profileData.top_genres.length > 0 ? (
              <GenreChart genres={profileData.top_genres} />
            ) : (
              <div className="text-center py-12">
                <p className="font-mono text-[11px] text-[#5A5A5A] uppercase tracking-wider">
                  Avalie mais filmes para ativar
                </p>
              </div>
            )}
          </div>

          {/* Narrative DNA — 5 cols */}
          <div className="md:col-span-5 card-cinema p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-[rgba(201, 163, 117,0.1)] border border-[rgba(201, 163, 117, 0.25)] flex items-center justify-center">
                  <Brain className="w-4 h-4 text-[#C9A36F]" />
                </div>
                <div>
                  <h2 className="type-label text-[13px] text-white font-bold uppercase tracking-[0.04em]">DNA Narrativo</h2>
                  <p className="font-mono text-[10px] text-[#5A5A5A]">Ritmo, tema, arco</p>
                </div>
              </div>

              {profileData.narrative_profile && (
                <NarrativeChart profile={profileData.narrative_profile} />
              )}
            </div>

            {/* Analyst note in serif Italic */}
            <div className="mt-6 pt-5 border-t border-[#3A3A40]">
              <p className="type-quote text-sm text-[#8A8A90] leading-relaxed">
                {profileData.narrative_profile?.emotional > 0.5
                  ? '"Busca por dilemas éticos viscerais e forte carga psicológica de personagem."'
                  : profileData.narrative_profile?.complex > 0.5
                  ? '"Valoriza estruturas não-lineares, simbolismo abstrato e densidade temática."'
                  : profileData.narrative_profile?.action_driven > 0.5
                  ? '"Prefere narrativas cinéticas, ritmo acelerado e impacto sensorial."'
                  : '"Demonstra versatilidade estética e abertura ampla ao cinema mundial."'}
              </p>
            </div>
          </div>

          {/* Style Matrix — 12 cols */}
          <div className="md:col-span-12 card-cinema p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[rgba(30, 77, 62, 0.1)] border border-[rgba(30, 77, 62, 0.25)] flex items-center justify-center">
                  <Clapperboard className="w-4 h-4 text-[#1E4D3E]" />
                </div>
                <div>
                  <h2 className="type-label text-[13px] text-white font-bold uppercase tracking-[0.04em]">Matriz de Estilo</h2>
                  <p className="font-mono text-[10px] text-[#5A5A5A]">Intensidade por escola visual</p>
                </div>
              </div>
              <Badge variant="velvet" className="text-[9px]">6-Axis</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profileData.style_profile &&
                Object.entries(profileData.style_profile)
                  .sort(([, a], [, b]) => Number(b) - Number(a))
                  .slice(0, 6)
                  .map(([key, val]) => {
                    const pct   = Math.round(Number(val) * 100);
                    const name  = styleLabels[key] || key;
                    return (
                      <div key={key} className="surface-raised rounded-[10px] p-4">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="type-label text-[12px] text-[#5A5A5A]">{name}</span>
                          <span className="font-mono text-[11px] font-semibold text-[#C9A36F]">{pct}%</span>
                        </div>
                        <div className="h-1 bg-[#161618] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, #C9A36F, #E5C68D ${pct > 60 ? '100%' : '60%'})`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}