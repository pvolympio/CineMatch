'use client';
// app/onboarding/page.tsx
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { movies as moviesApi, ratings as ratingsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Movie } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, selectedMovies, movieRatings, toggleMovieSelection, setMovieRating, clearOnboarding, setProfile } = useStore();

  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'select' | 'rate'>('select');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadMovies();
  }, []);

  const loadMovies = async (p = 1) => {
    setLoading(true);
    try {
      const data = await moviesApi.popular(p);
      setMovieList(prev => p === 1 ? data.results : [...prev, ...data.results]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.trim().length >= 2) {
        const data = await moviesApi.search(search);
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const displayMovies = search.trim().length >= 2 ? searchResults : movieList;

  const handleSubmit = async () => {
    if (selectedMovies.length < 5) return;
    setSubmitting(true);
    try {
      const ratingsList = selectedMovies.map(m => ({
        tmdb_movie_id: m.id,
        movie_title: m.title,
        movie_poster: m.poster_url,
        rating: movieRatings[m.id] || 7,
      }));
      const data = await ratingsApi.batch(ratingsList);
      if (data.profile) setProfile(data.profile);
      clearOnboarding();
      router.push('/dashboard');
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = Math.min((selectedMovies.length / 5) * 100, 100);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-void)', paddingBottom: 100 }}>
      {/* Fixed header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(8,8,16,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(124,58,237,0.12)', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.06em' }}>
                {step === 'select' ? 'SELECIONE SEUS FILMES' : 'AVALIE OS FILMES'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {step === 'select' ? `${selectedMovies.length} selecionado${selectedMovies.length !== 1 ? 's' : ''} (mínimo 5)` : 'Quanto você gostou de cada um?'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {step === 'select' && selectedMovies.length >= 5 && (
                <button className="btn-primary" onClick={() => setStep('rate')} style={{ padding: '8px 20px' }}>
                  Avaliar →
                </button>
              )}
              {step === 'rate' && (
                <>
                  <button className="btn-ghost" onClick={() => setStep('select')} style={{ padding: '8px 16px' }}>← Voltar</button>
                  <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ padding: '8px 20px' }}>
                    {submitting ? 'Salvando...' : 'Criar Perfil 🎬'}
                  </button>
                </>
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 24px 0' }}>
        {step === 'select' ? (
          <>
            {/* Search */}
            <div style={{ marginBottom: 32, maxWidth: 500 }}>
              <input
                className="input-field"
                type="text"
                placeholder="🔍 Buscar um filme específico..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Selected pills */}
            {selectedMovies.length > 0 && (
              <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedMovies.map(m => (
                  <div key={m.id} onClick={() => toggleMovieSelection(m)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,45,120,0.15)', border: '1px solid rgba(255,45,120,0.3)',
                    borderRadius: 100, padding: '4px 12px 4px 8px', cursor: 'pointer',
                    fontSize: '0.8rem', color: '#ff6b9d', fontWeight: 500,
                  }}>
                    <span>✕</span> {m.title.length > 20 ? m.title.substring(0, 20) + '...' : m.title}
                  </div>
                ))}
              </div>
            )}

            {/* Movie grid */}
            {loading && movieList.length === 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 240, borderRadius: 12 }} />
                ))}
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                  {displayMovies.map(movie => {
                    const isSelected = selectedMovies.some(m => m.id === movie.id);
                    return (
                      <div
                        key={movie.id}
                        onClick={() => toggleMovieSelection(movie)}
                        style={{
                          height: 240, borderRadius: 12, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                          background: `url(${movie.poster_url || ''}) center/cover no-repeat var(--bg-card)`,
                          border: isSelected ? '2px solid var(--accent-rose)' : '1px solid var(--border-subtle)',
                          boxShadow: isSelected ? '0 0 0 2px var(--accent-rose)' : 'none',
                          transition: 'all 0.2s ease',
                          transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                        }}
                      >
                        {isSelected && (
                          <div style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, background: 'var(--accent-rose)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'bold', zIndex: 5 }}>✓</div>
                        )}
                        <div style={{ position: 'absolute', top: 8, left: 8 }}>
                          <span className="score-badge" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>⭐ {movie.vote_average.toFixed(1)}</span>
                        </div>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,16,0.95) 0%, transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px 10px' }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{movie.title}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>{movie.release_year}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load more */}
                {!search && (
                  <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <button className="btn-ghost" onClick={() => { const next = page + 1; setPage(next); loadMovies(next); }} disabled={loading}>
                      {loading ? 'Carregando...' : 'Ver mais filmes'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Rating step */
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
              Sua avaliação nos ajuda a entender seu gosto com mais precisão. Seja honesto!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {selectedMovies.map(movie => (
                <div key={movie.id} className="glass" style={{ borderRadius: 16, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 60, height: 90, borderRadius: 8, background: `url(${movie.poster_url}) center/cover var(--bg-card)`, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 600, marginBottom: 4, fontSize: '1rem' }}>{movie.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 12 }}>{movie.release_year} · {movie.genres?.slice(0,2).map(g=>g.name).join(', ')}</p>
                    {/* Star rating */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {[2,4,6,8,10].map(r => (
                        <span key={r} onClick={() => setMovieRating(movie.id, r)} style={{ fontSize: '1.4rem', cursor: 'pointer', filter: (movieRatings[movie.id] || 7) >= r ? 'brightness(1)' : 'brightness(0.25)', transition: 'all 0.15s', userSelect: 'none' }}>⭐</span>
                      ))}
                      <span style={{ marginLeft: 8, color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem' }}>
                        {movieRatings[movie.id] || 7}/10
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ padding: '14px 40px', fontSize: '1rem' }}>
                {submitting ? '⏳ Analisando seu perfil...' : '🎬 Criar Meu Perfil Cinematográfico'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
