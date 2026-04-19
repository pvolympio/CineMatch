'use client';
// components/movies/MovieCard.tsx
import { Movie } from '@/types';

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
  selected?: boolean;
  showReason?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function MovieCard({ movie, onClick, selected, showReason, size = 'md' }: MovieCardProps) {
  const heights = { sm: 240, md: 300, lg: 380 };
  const height = heights[size];

  const poster = movie.poster_url || `https://via.placeholder.com/300x450/12121f/7c3aed?text=${encodeURIComponent(movie.title)}`;

  return (
    <div
      className="movie-card animate-fade-in-up"
      onClick={() => onClick?.(movie)}
      style={{
        height,
        background: `url(${poster}) center/cover no-repeat`,
        border: selected ? '2px solid var(--accent-rose)' : '1px solid var(--border-subtle)',
        boxShadow: selected ? '0 0 0 2px var(--accent-rose), 0 20px 40px rgba(255,45,120,0.3)' : undefined,
        position: 'relative',
      }}
    >
      {/* Selected checkmark */}
      {selected && (
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 10,
          width: 28, height: 28,
          background: 'var(--accent-rose)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 'bold',
        }}>✓</div>
      )}

      {/* Score badge */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <span className="score-badge">⭐ {movie.vote_average.toFixed(1)}</span>
      </div>

      {/* Bottom info */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 14px 14px',
        zIndex: 5,
      }}>
        <h3 style={{
          fontFamily: 'var(--font-body)',
          fontSize: size === 'sm' ? '0.85rem' : '0.95rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '4px',
          lineHeight: 1.3,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        }}>{movie.title}</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {movie.release_year && (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{movie.release_year}</span>
          )}
          {movie.genres?.slice(0, 2).map(g => (
            <span key={g.id} className="genre-pill" style={{ fontSize: '0.65rem' }}>{g.name}</span>
          ))}
        </div>

        {/* Hidden gem reason */}
        {showReason && movie.reason && (
          <p style={{
            marginTop: '8px',
            fontSize: '0.72rem',
            color: '#a78bfa',
            fontStyle: 'italic',
            lineHeight: 1.4,
          }}>💡 {movie.reason}</p>
        )}
      </div>
    </div>
  );
}
