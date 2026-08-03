'use client';

import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { Movie } from '@/types';
import { Star, Heart, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SwipeCardProps {
  movie: Movie;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  zIndex: number;
}

export default function SwipeCard({ movie, onSwipeLeft, onSwipeRight, zIndex }: SwipeCardProps) {
  const x = useMotionValue(0);
  const controls = useAnimation();

  // Mapping drag 'x' to rotation
  const rotate = useTransform(x, [-200, 200], [-12, 12]);

  // Mapping drag 'x' to scale (for subtle exit shrink)
  const scale = useTransform(x, [-200, 0, 200], [0.94, 1, 0.94]);

  // Color overlays for visual feedback - novo visual vintage
  const overlayRight = useTransform(x, [0, 150], ['rgba(201, 163, 117, 0)', 'rgba(201, 163, 117, 0.75)']);
  const overlayLeft = useTransform(x, [0, -150], ['rgba(53, 38, 42, 0)', 'rgba(201, 163, 117, 0.75)']);

  const handleDragEnd = async (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;

    if (info.offset.x > threshold) {
      await controls.start({ x: window.innerWidth, transition: { duration: 0.3 } });
      onSwipeRight();
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: -window.innerWidth, transition: { duration: 0.3 } });
      onSwipeLeft();
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 350, damping: 22 } });
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{
        x,
        rotate,
        scale,
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex,
        touchAction: 'none',
        cursor: 'grab',
      }}
      whileTap={{ cursor: 'grabbing' }}
      className="select-none"
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden border border-[#3A3A40] bg-slate-950 shadow-2xl shadow-black/80">
        {/* Poster Image */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${movie.poster_url})` }}
        />

        {/* Like (Right Swipe) Overlay - Dourado Vinyl */}
        <motion.div
          style={{ backgroundColor: overlayRight }}
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            style={{ opacity: useTransform(x, [50, 150], [0, 1]) }}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl border-4 border-[#C9A36F] bg-[rgba(201,163,117,0.9)] text-black font-display text-4xl font-extrabold -rotate-12 shadow-2xl backdrop-blur-md"
          >
            <Heart className="w-10 h-10 fill-black stroke-black" />
            <span className="text-black">ACABOU!</span>
          </motion.div>
        </motion.div>

        {/* Pass (Left Swipe) Overlay - Bordô/Vinho */}
        <motion.div
          style={{ backgroundColor: overlayLeft }}
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            style={{ opacity: useTransform(x, [-50, -150], [0, 1]) }}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl border-4 border-[#C9A36F] bg-[rgba(201, 163, 117,0.9)] text-black font-display text-4xl font-extrabold rotate-12 shadow-2xl backdrop-blur-md"
          >
            <X className="w-10 h-10 stroke-[3] stroke-black" />
            <span className="text-black">REJEITAR</span>
          </motion.div>
        </motion.div>

        {/* Bottom Ambient Info Box */}
        <div className="absolute bottom-0 inset-x-0 p-6 pt-20 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/80 to-transparent z-10 pointer-events-none flex flex-col justify-end">
          <h2 className="font-display text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md mb-2">
            {movie.title}
          </h2>

          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Badge variant="vinyl" className="font-mono text-xs py-1 px-3 bg-[#161618]/80 border-[#C9A36F]/30">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
            </Badge>
            {movie.release_year && (
              <span className="text-xs font-mono text-[#5A5A5A] bg-[#161616] px-2.5 py-1 rounded-full border border-[#3A3A40]">
                {movie.release_year}
              </span>
            )}
            {movie.genres?.slice(0, 2).map((g) => (
              <span key={g.id} className="text-xs text-[#C9A36F] bg-[rgba(201,163,117,0.1)] px-2.5 py-1 rounded-full border border-[#C9A36F]/20">
                {g.name}
              </span>
            ))}
          </div>

          {movie.overview && (
            <p className="text-xs sm:text-sm text-[#8A8A90] line-clamp-3 leading-relaxed drop-shadow">
              {movie.overview}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}