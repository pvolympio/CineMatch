'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Movie } from '@/types';

interface MovieCardProps {
  movie: Partial<Movie> & {
    id: number;
    title: string;
    poster_url?: string | null;
    vote_average?: number;
    release_date?: string;
    overview?: string;
    reason?: string;
  };
  onClick?: () => void;
  showPreview?: boolean;
}

export default function MovieCard({ movie, onClick, showPreview = true }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const posterUrl = movie.poster_url || '/placeholder-movie.png';
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : movie.release_year || '';
  const rating = movie.vote_average ? (movie.vote_average / 10) * 100 : 0;

  return (
    <div
      className="group relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 shadow-lg shadow-black/60 transition-all duration-500 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-rose-950/40 hover:-translate-y-2 cursor-pointer select-none"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ aspectRatio: '2/3' }}
    >
      {/* Poster Image */}
      <div className={`relative w-full h-full ${imageLoaded ? '' : 'animate-pulse bg-slate-800'}`}>
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Dark Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none" />

      {/* Top Rating Pill */}
      {movie.vote_average !== undefined && movie.vote_average !== null && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="gold" className="font-mono backdrop-blur-md bg-slate-950/80 border-amber-500/30">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{movie.vote_average.toFixed(1)}</span>
          </Badge>
        </div>
      )}

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 inset-x-0 p-4 z-10 flex flex-col justify-end transition-transform duration-300">
        <h3 className="font-display text-base font-bold text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors drop-shadow-md">
          {movie.title}
        </h3>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {year && <span className="text-xs font-mono text-slate-400">{year}</span>}
          {movie.reason && (
            <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold italic bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Sparkles className="w-3 h-3" />
              Gem Match
            </span>
          )}
        </div>

        {/* Overview Preview on Hover */}
        {showPreview && isHovered && movie.overview && (
          <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed transition-all duration-300 font-normal">
            {movie.overview}
          </p>
        )}
      </div>

      {/* Rating Bar Header */}
      {movie.vote_average !== undefined && movie.vote_average !== null && (
        <div className="absolute top-0 inset-x-0 h-1 bg-slate-900/80 z-20">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${rating}%`,
              background:
                rating > 70
                  ? 'linear-gradient(90deg, #e11d48, #f59e0b)'
                  : 'linear-gradient(90deg, #6366f1, #e11d48)',
            }}
          />
        </div>
      )}
    </div>
  );
}
