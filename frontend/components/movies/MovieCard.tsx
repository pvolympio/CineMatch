'use client';

import { Movie } from '@/types';
import { Star, Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
  selected?: boolean;
  showReason?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function MovieCard({ movie, onClick, selected, showReason, size = 'md' }: MovieCardProps) {
  const heights = { sm: 240, md: 320, lg: 400 };
  const height = heights[size];

  const poster = movie.poster_url || `https://via.placeholder.com/300x450/12121f/7c3aed?text=${encodeURIComponent(movie.title)}`;

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 select-none ${
        selected
          ? 'ring-2 ring-[#C9A36F] shadow-xl shadow-[#C9A36F]/20 bg-[#121214]'
          : 'border border-[#3A3A40] hover:border-[#C9A36F40] shadow-lg shadow-black/40'
      }`}
      onClick={() => onClick?.(movie)}
      style={{
        height,
        background: `url(${poster}) center/cover no-repeat`,
      }}
    >
      {/* Dark Ambient Overlay - Estilo cinema vintage */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/60 to-transparent opacity-95 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Selected Indicator - Estilo selo de filme */}
      {selected && (
        <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-[#C9A36F] text-black flex items-center justify-center shadow-lg shadow-[#C9A36F]/40">
          <Check className="w-5 h-5 stroke-[3]" />
        </div>
      )}

      {/* Score Badge - Estilo selo cinematográfico */}
      <div className="absolute top-3 left-3 z-20">
        <Badge variant="vinyl" className="font-mono bg-[#161618]/80 backdrop-blur-md">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{movie.vote_average.toFixed(1)}</span>
        </Badge>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 inset-x-0 p-4 z-10 flex flex-col justify-end">
        <h3 className="font-display font-bold text-white text-base leading-snug group-hover:text-[#F0E6D2] transition-colors drop-shadow-md">
          {movie.title}
        </h3>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {movie.release_year && <span className="text-xs font-mono text-[#5A5A5A]">{movie.release_year}</span>}
          {movie.genres?.slice(0, 2).map((g) => (
            <span key={g.id} className="text-[10px] px-2 py-0.5 rounded-full bg-[#16161680] text-[#C9A36F] border border-[#3A3A40] font-medium">
              {g.name}
            </span>
          ))}
        </div>

        {showReason && movie.reason && (
          <p className="mt-2 text-xs text-[#A88B58] italic flex items-center gap-1.5 line-clamp-2 font-serif">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#C9A36F]" />
            {movie.reason}
          </p>
        )}
      </div>
    </div>
  );
}