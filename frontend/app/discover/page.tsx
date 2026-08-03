'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { profile as profileApi, ratings as ratingsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Movie } from '@/types';
import Navbar from '@/components/layout/Navbar';
import MovieCard from '@/components/movies/MovieCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Dialog } from '@/components/ui/dialog';
import {
  Sparkles,
  RefreshCw,
  Bookmark,
  Check,
  Star,
  Film,
  Calendar,
  Layers,
} from 'lucide-react';

export default function DiscoverPage() {
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const [gems, setGems] = useState<Movie[]>([]);
  const [filteredGems, setFilteredGems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratedIds, setRatedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchGems();
  }, [isAuthenticated, router]);

  const fetchGems = async () => {
    setLoading(true);
    try {
      const data = await profileApi.recommendations(16);
      const list = (data.recommendations as Movie[]) || [];
      setGems(list);
      setFilteredGems(list);
    } catch (e: unknown) {
      if (e instanceof Error && e.message?.includes('onboarding')) router.push('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'all') {
      setFilteredGems(gems);
    } else {
      setFilteredGems(
        gems.filter(
          (m) =>
            m.genres?.some((g) => g.name.toLowerCase().includes(tabId)) ||
            m.overview?.toLowerCase().includes(tabId)
        )
      );
    }
  };

  const handleAddToWatchlist = async (movie: Movie) => {
    setSavingId(movie.id);
    try {
      await ratingsApi.rate({
        tmdb_movie_id: movie.id,
        movie_title: movie.title,
        movie_poster: movie.poster_url || '',
        watched: false,
        watchlist: true,
      });
      setRatedIds((prev) => new Set(Array.from(prev).concat(movie.id)));
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'Todas as Joias', icon: <Layers className="w-4 h-4" /> },
    { id: 'sci-fi', label: 'Sci-Fi & Futuro', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'drama', label: 'Drama Intenso', icon: <Film className="w-4 h-4" /> },
    { id: 'thriller', label: 'Suspense Noir', icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen bg-[#06060a] pb-24 relative font-body text-slate-100">
      <div className="film-texture" />
      <Navbar />

      {/* Top Ambient Glow */}
      <div className="fixed top-0 right-0 w-[50vw] h-[50vh] bg-rose-950/15 filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 relative z-10">
        {/* Header Title */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge variant="vinyl" className="mb-3 px-3 py-1 font-mono text-xs uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#F0E6D2]" />
              <span>Curadoria Exclusiva</span>
            </Badge>

            <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight text-white leading-tight">
              JOIAS <span className="text-gradient-vinyl">ESCONDIDAS</span>
            </h1>

            <p className="text-[#5A5A5A] text-sm sm:text-base max-w-2xl mt-2 leading-relaxed font-normal">
              Obras de alta aclamação e menor visibilidade comercial, selecionadas com base no seu padrão estético.
            </p>
          </div>

          <Button variant="outline" size="md" onClick={fetchGems} disabled={loading} className="shrink-0">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Seleção</span>
          </Button>
        </div>

        {/* Filter Tabs Bar */}
        <div className="mb-8">
          <Tabs tabs={filterTabs} activeTab={activeTab} onChange={handleTabChange} />
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <SkeletonCard count={10} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredGems.map((movie) => {
              const isSaved = ratedIds.has(movie.id);
              const isSaving = savingId === movie.id;
              return (
                <div key={movie.id} className="flex flex-col">
                  <MovieCard movie={movie} onClick={() => setSelectedMovie(movie)} showReason={true} />
                  <Button
                    variant={isSaved ? 'vinyl' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWatchlist(movie);
                    }}
                    disabled={isSaved || isSaving}
                    className="mt-3 w-full text-xs"
                  >
                    {isSaving ? (
                      <span>Salvando...</span>
                    ) : isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        <span>Na Watchlist</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>+ Watchlist</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Movie Details Modal Dialog */}
      {selectedMovie && (
        <Dialog isOpen={!!selectedMovie} onClose={() => setSelectedMovie(null)} className="max-w-4xl">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="w-full md:w-64 shrink-0 rounded-2xl overflow-hidden border border-[#3A3A40] shadow-2xl relative aspect-[2/3]">
              <img
                src={selectedMovie.poster_url || '/placeholder-movie.png'}
                alt={selectedMovie.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {selectedMovie.vote_average && (
                    <Badge variant="vinyl" className="font-mono text-sm px-3 py-1">
                      <Star className="w-4 h-4 fill-[#F0E6D2] text-amber-400" />
                      <span>{selectedMovie.vote_average.toFixed(1)} / 10</span>
                    </Badge>
                  )}
                  {selectedMovie.release_date && (
                    <span className="text-xs font-mono text-[#5A5A5A] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(selectedMovie.release_date).getFullYear()}
                    </span>
                  )}
                </div>

                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4 tracking-tight leading-tight">
                  {selectedMovie.title}
                </h2>

                {selectedMovie.overview && (
                  <p className="text-[#5A5A5A] text-sm leading-relaxed mb-6 font-normal">
                    {selectedMovie.overview}
                  </p>
                )}
              </div>

              {/* Action Buttons inside Dialog */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#3A3A40]">
                <Button
                  variant="vinyl"
                  size="md"
                  onClick={() => handleAddToWatchlist(selectedMovie)}
                  disabled={ratedIds.has(selectedMovie.id) || savingId === selectedMovie.id}
                >
                  {savingId === selectedMovie.id ? (
                    <span>Salvando...</span>
                  ) : ratedIds.has(selectedMovie.id) ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Adicionado à Watchlist</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Adicionar à Watchlist</span>
                    </>
                  )}
                </Button>

                <Button variant="ghost" size="md" onClick={() => setSelectedMovie(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </main>
  );
}