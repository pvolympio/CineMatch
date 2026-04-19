'use client';
// app/dashboard/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { profile as profileApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { CinematicProfile } from '@/types';
import Navbar from '@/components/layout/Navbar';
import GenreChart from '@/components/profile/GenreChart';
import NarrativeChart from '@/components/profile/NarrativeChart';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useStore();
  const [profileData, setProfileData] = useState<CinematicProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        profileApi.get(),
        profileApi.stats(),
      ]);
      if (profileRes.onboarding_needed) { router.push('/onboarding'); return; }
      setProfileData(profileRes.profile);
      setStats(statsRes.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'spin 1s linear infinite' }}>🎬</div>
          <p style={{ color: 'var(--text-secondary)' }}>Carregando seu perfil...</p>
        </div>
      </main>
    );
  }

  if (!profileData) return null;

  const personality = profileData.personality;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-void)', paddingBottom: 80 }}>
      <Navbar />

      {/* BG accent */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '40vh', background: 'linear-gradient(180deg, rgba(124,58,237,0.06) 0%, transparent 100%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 24px 0' }}>
        {/* Hero header */}
        <div style={{ marginBottom: 48, animation: 'fadeInUp 0.6s ease forwards' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Seu Perfil Cinematográfico</p>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 8 }}>
                OLÁ, <span style={{ background: 'linear-gradient(135deg,#ff2d78,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.username?.toUpperCase()}</span>
              </h1>
              {personality && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.5rem' }}>{personality.icon}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{personality.name}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{personality.desc}</p>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/discover"><button className="btn-primary" style={{ padding: '10px 20px' }}>💎 Ver Recomendações</button></Link>
              <Link href="/explore"><button className="btn-ghost" style={{ padding: '10px 20px' }}>🕸️ Explorar</button></Link>
            </div>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Filmes Avaliados', value: stats.total_rated, icon: '🎬', color: '#7c3aed' },
              { label: 'Nota Média', value: `${stats.avg_rating}/10`, icon: '⭐', color: '#f59e0b' },
              { label: 'Amados', value: stats.loved, icon: '❤️', color: '#ff2d78' },
              { label: 'Na Watchlist', value: stats.watchlist_count, icon: '📋', color: '#06b6d4' },
            ].map((s, i) => (
              <div key={i} className="glass" style={{ borderRadius: 14, padding: '20px 20px', textAlign: 'center', animation: `fadeInUp 0.5s ease ${i * 0.1}s forwards`, opacity: 0 }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: s.color, letterSpacing: '0.03em' }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Main content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Genre Chart */}
          <div className="glass" style={{ borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.05em', marginBottom: 24, color: 'var(--text-primary)' }}>
              🎭 SEUS GÊNEROS FAVORITOS
            </h2>
            {profileData.top_genres.length > 0 ? (
              <GenreChart genres={profileData.top_genres} />
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Avalie mais filmes para ver o gráfico</p>
            )}
          </div>

          {/* Narrative Profile */}
          <div className="glass" style={{ borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.05em', marginBottom: 24 }}>
              🧠 PERFIL DE NARRATIVA
            </h2>
            {profileData.narrative_profile && (
              <NarrativeChart profile={profileData.narrative_profile} />
            )}
            <div style={{ marginTop: 20, padding: '14px', background: 'rgba(124,58,237,0.08)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.15)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {profileData.narrative_profile?.emotional > 0.5
                  ? '💜 Você prefere filmes com forte impacto emocional e personagens bem desenvolvidos.'
                  : profileData.narrative_profile?.complex > 0.5
                  ? '🔭 Você aprecia roteiros complexos e narrativas não lineares.'
                  : profileData.narrative_profile?.action_driven > 0.5
                  ? '⚡ Você curte um bom ritmo e muita ação nas telas.'
                  : '🎨 Seu gosto é diversificado — você aprecia diferentes estilos narrativos.'}
              </p>
            </div>
          </div>

          {/* Style profile */}
          <div className="glass" style={{ borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.05em', marginBottom: 24 }}>
              🎨 ESTILO CINEMATOGRÁFICO
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {profileData.style_profile && Object.entries(profileData.style_profile)
                .sort(([,a],[,b]) => Number(b)-Number(a))
                .slice(0, 6)
                .map(([key, val], i) => {
                  const labels: Record<string, string> = { sci_fi: '🚀 Ficção Científica', drama: '🎭 Drama', action: '⚡ Ação', comedy: '😄 Comédia', thriller: '😰 Thriller', horror: '👻 Terror', animation: '✨ Animação', documentary: '📽️ Documentário' };
                  const pct = Math.round(Number(val) * 100);
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{labels[key] || key}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* CTA cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Link href="/discover" style={{ textDecoration: 'none' }}>
              <div className="glass" style={{ borderRadius: 16, padding: 28, cursor: 'pointer', transition: 'transform 0.3s ease, border-color 0.3s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,120,0.4)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = ''; }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>💎</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.05em', marginBottom: 8 }}>JOIAS ESCONDIDAS</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>Filmes incríveis e pouco conhecidos selecionados especialmente para o seu gosto.</p>
                <p style={{ color: '#ff2d78', fontSize: '0.85rem', marginTop: 12, fontWeight: 600 }}>Ver recomendações →</p>
              </div>
            </Link>
            <Link href="/explore" style={{ textDecoration: 'none' }}>
              <div className="glass" style={{ borderRadius: 16, padding: 28, cursor: 'pointer', transition: 'transform 0.3s ease, border-color 0.3s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.4)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = ''; }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>🕸️</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.05em', marginBottom: 8 }}>EXPLORAR CONEXÕES</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>Visualize como filmes se conectam por gênero, diretor e estilo narrativo.</p>
                <p style={{ color: '#7c3aed', fontSize: '0.85rem', marginTop: 12, fontWeight: 600 }}>Explorar grafo →</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
