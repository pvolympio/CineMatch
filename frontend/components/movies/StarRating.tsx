'use client';
// components/movies/StarRating.tsx
import { useState } from 'react';

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ value = 0, onChange, readonly, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const sizes = { sm: '1rem', md: '1.4rem', lg: '1.8rem' };
  const fontSize = sizes[size];

  const stars = [2, 4, 6, 8, 10]; // Maps to 1-5 stars → 2,4,6,8,10 rating

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {stars.map((rating) => {
        const filled = hovered ? rating <= hovered : rating <= value;
        return (
          <span
            key={rating}
            onClick={() => !readonly && onChange?.(rating)}
            onMouseEnter={() => !readonly && setHovered(rating)}
            onMouseLeave={() => !readonly && setHovered(0)}
            style={{
              fontSize,
              cursor: readonly ? 'default' : 'pointer',
              filter: filled ? 'brightness(1)' : 'brightness(0.3)',
              transition: 'transform 0.15s ease, filter 0.15s ease',
              transform: (hovered === rating && !readonly) ? 'scale(1.25)' : 'scale(1)',
              userSelect: 'none',
            }}
          >⭐</span>
        );
      })}
      {value > 0 && (
        <span style={{ color: '#f59e0b', fontSize: '0.8rem', marginLeft: '6px', alignSelf: 'center' }}>
          {value}/10
        </span>
      )}
    </div>
  );
}
