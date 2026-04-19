'use client';
// app/discover/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { profile as profileApi, ratings as ratingsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Movie } from '@/types';
import Navbar from '@/components/layout/Navbar';

export default function DiscoverPage() {
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const [gems, setGems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratedIds, setRatedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchGems();
  }, []);

  const fetchGems = async () => {
    setLoading(true);
    try {
      const data = await profileApi.recommendations(16);
      setGems(data.recommendations);
    } catch (e: any) {
      if (e.message?.includes('onboarding')) router.push('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (movie: Movie) => {
    setSavingId(movie.id);
    try {
      await ratingsApi.rate({ tmdb_movie_id: movie.id, movie_title: movie.title, movie_poster: movie.poster_url || '', watched: false, watchlist: true });
      setRatedIds(prev => new Set([...prev, movie.id]));
    } catch (e) { console.error(e); }
    finally { setSavingId(null); }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-void)', paddingBottom: 80 }}>
      <Navbar />

      {/* Background */}
      <div style={{ position: 'fixed', top: 0, right: 0, width: '50vw', height: '60vh', background: 'radial-gradient(ellipse at top right, rgba(255,45,120,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px 0' }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Selecionado para você</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '0.04em', lineHeight: 0.95, marginBottom: 16 }}>
            JOIAS<br />
            <span style={{ background: 'linear-gradient(135deg,#ff2d78,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ESCONDIDAS</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Filmes incríveis com alta avaliação mas baixa popularidade — selecionados especialmente com base no seu perfil cinematográfico.
          </p>
          <button onClick={fetchGems} className="btn-ghost" style={{ marginTop: 16, padding: '8px 20px', fontSize: '0.85rem' }}>
            🔄 Novas Recomendações
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 360, borderRadius: 12 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {gems.map((movie, i) => (
              <div key={movie.id} style={{ animation: `fadeInUp 0.5s ease ${(i % 8) * 0.06}s forwards`, opacity: 0 }}>
                <div
                  style={{
                    height: 360, borderRadius: 12, position: 'relative', overflow: 'hidden', cursor: 'pointer',
                    background: `url(${movie.poster_url}) center/cover no-repeat var(--bg-card)`,
                    border: '1px solid var(--border-subtle)',
                    transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px rgba(255,45,120,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                  onClick={() => setSelectedMovie(movie)}
                >
                  {/* Badges */}
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, zIndex: 5, flexWrap: 'wrap' }}>
                    <span className="score-badge">⭐ {movie.vote_average.toFixed(1)}</span>
                    <span style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.4)', color: '#06b6d4', padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600 }}>💎 JOIA</span>
                  </div>

                  {/* Gradient overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,16,0.98) 0%, rgba(8,8,16,0.3) 55%, transparent 100%)' }} />

                  {/* Info */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 14px', zIndex: 5 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, marginBottom: 4 }}>{movie.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 8 }}>
                      {movie.release_year} · {movie.genres?.slice(0,2).map(g=>g.name).join(', ')}
                    </p>
                    {movie.reason && (
                      <p style={{ fontSize: '0.7rem', color: '#a78bfa', fontStyle: 'italic', lineHeight: 1.4, marginBottom: 10 }}>
                        💡 {movie.reason}
                      </p>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleAddToWatchlist(movie); }}
                      disabled={ratedIds.has(movie.id) || savingId === movie.id}
                      style={{
                        width: '100%', padding: '7px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                        background: ratedIds.has(movie.id) ? 'rgba(16,185,129,0.2)' : 'rgba(255,45,120,0.15)',
                        color: ratedIds.has(movie.id) ? '#10b981' : '#ff2d78',
                        border: `1px solid ${ratedIds.has(movie.id) ? 'rgba(16,185,129,0.3)' : 'rgba(255,45,120,0.25)'}`,
                      }}
                    >
                      {ratedIds.has(movie.id) ? '✓ Na Watchlist' : savingId === movie.id ? '...' : '+ Watchlist'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Movie detail modal */}
      {selectedMovie && (
        <div onClick={() => setSelectedMovie(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }}>
          <div onClick={e => e.stopPropagation()} className="glass" style={{ maxWidth: 600, width: '100%', borderRadius: 20, overflow: 'hidden', animation: 'fadeInUp 0.3s ease forwards' }}>
            {selectedMovie.backdrop_url && (
              <div style={{ height: 200, background: `url(${selectedMovie.backdrop_url}) center/cover`, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(18,18,31,1))' }} />
              </div>
            )}
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 80, height: 120, borderRadius: 8, background: `url(${selectedMovie.poster_url}) center/cover var(--bg-card)`, flexShrink: 0 }} />
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.04em', marginBottom: 4 }}>{selectedMovie.title}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 8 }}>{selectedMovie.release_year}</p>
                  <span className="score-badge">⭐ {selectedMovie.vote_average.toFixed(1)}</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginTop: 16 }}>{selectedMovie.overview?.slice(0, 280)}...</p>
              {selectedMovie.reason && (
                <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(124,58,237,0.1)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.2)' }}>
                  <p style={{ fontSize: '0.85rem', color: '#a78bfa' }}>💡 {selectedMovie.reason}</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button onClick={() => { handleAddToWatchlist(selectedMovie); setSelectedMovie(null); }} className="btn-primary" style={{ flex: 1, padding: '10px' }}>+ Adicionar à Watchlist</button>
                <button onClick={() => setSelectedMovie(null)} className="btn-ghost" style={{ padding: '10px 20px' }}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </main>
  );
}
