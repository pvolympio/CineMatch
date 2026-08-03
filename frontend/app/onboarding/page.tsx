'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { movies as moviesApi, ratings as ratingsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Movie } from '@/types';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Check, Sparkles, ArrowRight, ArrowLeft, Search, X, Clapperboard } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    selectedMovies,
    movieRatings,
    toggleMovieSelection,
    setMovieRating,
    clearOnboarding,
    setProfile,
  } = useStore();

  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'select' | 'rate'>('select');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadMovies();
  }, [isAuthenticated, router]);

  const loadMovies = async (p = 1) => {
    setLoading(true);
    try {
      const data = await moviesApi.popular(p);
      setMovieList((prev) => (p === 1 ? (data.results as Movie[]) : [...prev, ...(data.results as Movie[])]));
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
        setSearchResults(data.results as Movie[]);
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
      const ratingsList = selectedMovies.map((m) => ({
        tmdb_movie_id: m.id,
        movie_title: m.title,
        movie_poster: m.poster_url,
        rating: movieRatings[m.id] || 7,
      }));
      const data = await ratingsApi.batch(ratingsList);
      if (data.profile) setProfile(data.profile);
      clearOnboarding();
      confetti({
        particleCount: 120,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C9A36F', '#F0E6D2', '#1E4D3E'],
      });
      toast.success('Perfil criado com sucesso!');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (e: unknown) {
      toast.error('Erro ao salvar: ' + (e instanceof Error ? e.message : 'Erro desconhecido'));
    } finally {
      setSubmitting(false);
    }
  };

  const progress = Math.min((selectedMovies.length / 5) * 100, 100);

  return (
    <main className="min-h-screen bg-[#06060a] pb-24 relative font-body text-slate-100">
      <div className="film-texture" />

      {/* Fixed Sticky Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-b border-[#3A3A40] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Badge variant="vinyl" className="font-mono text-xs uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#F0E6D2]" />
                <span>Onboarding Cinematográfico</span>
              </Badge>
              <h1 className="type-label text-xl sm:text-2xl text-white tracking-tight">
                {step === 'select' ? 'SELECIONE SEUS FILMES FAVORITOS' : 'AVALIE SUA EXPERIÊNCIA'}
              </h1>
              <p className="text-xs text-[#5A5A5A]">
                {step === 'select'
                  ? `${selectedMovies.length} selecionado(s) • Mínimo necessário: 5`
                  : 'Atribua uma nota para calibrar seu algoritmo'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {step === 'select' && selectedMovies.length >= 5 && (
                <Button variant="vinyl" size="sm" onClick={() => setStep('rate')}>
                  <span>Avaliar</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              {step === 'rate' && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setStep('select')}>
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </Button>
                  <Button variant="vinyl" size="sm" onClick={handleSubmit} disabled={ submitting}>
                    <Clapperboard className="w-4 h-4" />
                    <span>{submitting ? 'Salvando...' : 'Criar Perfil'}</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-[#3A3A40]">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, #C9A36F, #1E4D3E, #C9A36F)`
              }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 relative z-10">
        {step === 'select' ? (
          <>
            {/* Search Input */}
            <div className="mb-6 max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 text-[#5A5A5A] absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Buscar um filme específico..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900/80 border border-[#3A3A40] text-white placeholder:text-[#5A5A5A] text-sm rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-[#C9A36F]/50 transition-all font-mono"
                />
              </div>
            </div>

            {/* Selected Movie Badges */}
            {selectedMovies.length > 0 && (
              <div className="mb-6 flex gap-2 flex-wrap">
                {selectedMovies.map((m) => (
                  <Badge
                    key={m.id}
                    variant="vinyl"
                    onClick={() => toggleMovieSelection(m)}
                    className="cursor-pointer hover:bg-[#C9A36F]/30 transition-colors py-1.5 px-3 font-mono text-xs"
                  >
                    <X className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">
                      {m.title.length > 20 ? m.title.substring(0, 20) + '…' : m.title}
                    </span>
                  </Badge>
                ))}
              </div>
            )}

            {/* Movie Grid */}
            {loading && movieList.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900 animate-pulse border border-[#3A3A40]" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {displayMovies.map((movie) => {
                    const isSelected = selectedMovies.some((m) => m.id === movie.id);
                    return (
                      <div
                        key={movie.id}
                        onClick={() => toggleMovieSelection(movie)}
                        className={`group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'ring-2 ring-[#C9A36F] shadow-xl shadow-[#C9A36F]/30 scale-[1.02]'
                            : 'border border-[#3A3A40] hover:border-[#C9A36F]/40'
                        }`}
                        style={{
                          background: `url(${movie.poster_url || '/placeholder-movie.png'}) center/cover no-repeat`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/60 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                        {isSelected && (
                          <div className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-[#53262A] text-white flex items-center justify-center shadow-lg border border-[#C9A36F]/30">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}

                        <div className="absolute top-3 left-3 z-20">
                          <Badge variant="vinyl" className="font-mono text-[10px] bg-[#161618]/80 border-[#C9A36F]/30">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{movie.vote_average.toFixed(1)}</span>
                          </Badge>
                        </div>

                        <div className="absolute bottom-0 inset-x-0 p-3 z-10">
                          <h3 className="font-display font-bold text-sm text-white leading-snug group-hover:text-[#F0E6D2] transition-colors drop-shadow-md">
                            {movie.title}
                          </h3>
                          <span className="text-[10px] font-mono text-[#5A5A5A]">{movie.release_year}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {!search && (
                  <div className="text-center mt-10">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        const next = page + 1;
                        setPage(next);
                        loadMovies(next);
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Carregando...' : 'Carregar mais filmes'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Step 2: Rate Step */
          <div className="max-w-3xl mx-auto">
            <p className="text-[#5A5A5A] text-sm mb-8 leading-relaxed font-normal">
              Atribua uma nota de 1 a 10 para cada obra selecionada. Quanto mais precisa for sua avaliação, melhor será a precisão do algoritmo.
            </p>

            <div className="flex flex-col gap-4">
              {selectedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="rounded-2xl border border-[#3A3A40] bg-slate-900/60 p-4 sm:p-5 backdrop-blur-xl flex gap-4 sm:gap-6 items-center"
                >
                  <div
                    className="w-16 h-24 rounded-xl bg-slate-950 bg-center bg-cover shrink-0 border border-[#3A3A40]"
                    style={{ backgroundImage: `url(${movie.poster_url})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="type-label text-base sm:text-lg text-white truncate mb-1">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-[#5A5A5A] mb-3 font-mono">
                      {movie.release_year} • {movie.genres?.slice(0, 2).map((g) => g.name).join(', ')}
                    </p>

                    {/* Star Rating Bar */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[2, 4, 6, 8, 10].map((r) => {
                        const isFilled = (movieRatings[movie.id] || 7) >= r;
                        return (
                          <button
                            key={r}
                            onClick={() => setMovieRating(movie.id, r)}
                            className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                isFilled
                                  ? 'fill-[#C9A36F] text-[#C9A36F]'
                                  : 'fill-slate-800 text-slate-700'
                              }`}
                            />
                          </button>
                        );
                      })}
                      <span className="ml-3 font-mono font-bold text-sm text-[#C9A36F]">
                        {movieRatings[movie.id] || 7} / 10
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button variant="vinyl" size="lg" onClick={handleSubmit} disabled={submitting} className="px-10">
                <Clapperboard className="w-5 h-5" />
                <span>{submitting ? 'Analisando seu perfil...' : 'Criar Meu Perfil Cinematográfico'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}