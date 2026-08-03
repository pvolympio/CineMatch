'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { movies as moviesApi, ratings as ratingsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Movie } from '@/types';
import Navbar from '@/components/layout/Navbar';
import SwipeCard from '@/components/ui/SwipeCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Flame, Heart, X, Sparkles, RotateCcw, Clapperboard } from 'lucide-react';

export default function SwipePage() {
  const router = useRouter();
  const { isAuthenticated } = useStore();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
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
      const reversed = (data.results as Movie[]).reverse();
      setMovies((prev) => (p === 1 ? reversed : [...reversed, ...prev]));
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar catálogo de filmes');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = async (movie: Movie) => {
    // Confetti effect on match!
    confetti({
      particleCount: 45,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#C9A36F', '#F0E6D2', '#1E4D3E'],
    });

    removeMovieFromStack(movie.id);
    toast.success(`Filme "${movie.title}" adicionado aos seus favoritos!`, {
      position: 'top-center',
    });

    try {
      await ratingsApi.rate({
        tmdb_movie_id: movie.id,
        movie_title: movie.title,
        movie_poster: movie.poster_url || '',
        rating: 8,
        watched: true,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwipeLeft = (movie: Movie) => {
    removeMovieFromStack(movie.id);
  };

  const removeMovieFromStack = (id: number) => {
    setMovies((prev) => {
      const newStack = prev.filter((m) => m.id !== id);
      if (newStack.length <= 2) {
        const next = page + 1;
        setPage(next);
        loadMovies(next);
      }
      return newStack;
    });
  };

  const topMovie = movies[movies.length - 1];

  return (
    <main className="min-h-screen bg-[#06060a] overflow-hidden relative font-body text-slate-100 flex flex-col items-center justify-center">
      <div className="film-texture" />
      <Navbar />

      {/* Top Header Badge */}
      <div className="absolute top-24 z-20 text-center">
        <Badge variant="vinyl" className="font-mono text-xs px-4 py-1 uppercase tracking-wider mb-2">
          <Flame className="w-3.5 h-3.5 text-[#F0E6D2]" />
          <span>Sintonizador de Reel Swipe</span>
        </Badge>
        <p className="text-xs text-[#5A5A5A] hidden sm:block font-mono">
          Deslize para a direita para CURTIR ou para a esquerda para PASSAR
        </p>
      </div>

      {/* Cards Container */}
      <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[2/3] z-10 mt-12">
        {loading && movies.length === 0 ? (
          <div className="w-full h-full rounded-3xl border border-[#3A3A40] bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center text-slate-400">
            <Clapperboard className="w-12 h-12 text-[#C9A36F] animate-bounce mb-3" />
            <p className="font-mono text-sm">Carregando carretel de filmes...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="w-full h-full rounded-3xl border border-[#3A3A40] bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center">
            <Sparkles className="w-12 h-12 text-[#C9A36F] mb-3" />
            <h3 className="type-label text-xl text-white mb-2">Fim do Carretel</h3>
            <p className="text-xs text-[#5A5A5A] mb-6">Você avaliou todos os filmes desta sessão.</p>
            <Button variant="vinyl" onClick={() => loadMovies(1)}>
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Reel</span>
            </Button>
          </div>
        ) : (
          movies.map((movie, index) => (
            <SwipeCard
              key={movie.id}
              movie={movie}
              zIndex={index}
              onSwipeLeft={() => handleSwipeLeft(movie)}
              onSwipeRight={() => handleSwipeRight(movie)}
            />
          ))
        )}
      </div>

      {/* Manual Touch Action Controls */}
      {topMovie && (
        <div className="fixed bottom-8 z-30 flex items-center gap-6">
          <button
            onClick={() => handleSwipeLeft(topMovie)}
            className="w-14 h-14 rounded-full border border-[#53262A]/50 bg-[#53262A]/60 text-[#B85A48] flex items-center justify-center shadow-lg shadow-[#53262A]/40 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            aria-label="Passar filme"
          >
            <X className="w-7 h-7 stroke-[3] stroke-[#B85A48]" />
          </button>

          <button
            onClick={() => handleSwipeRight(topMovie)}
            className="w-16 h-16 rounded-full border border-[#C9A36F]/50 bg-[#C9A36F]/60 text-[#F0E6D2] flex items-center justify-center shadow-xl shadow-[#C9A36F]/50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            aria-label="Curtir filme"
          >
            <Heart className="w-8 h-8 fill-[#F0E6D2] stroke-[#F0E6D2]" />
          </button>
        </div>
      )}
    </main>
  );
}