'use client';

import { useEffect, useState } from 'react';

interface SkeletonCardProps {
  count?: number;
}

export default function SkeletonCard({ count = 6 }: SkeletonCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton shimmer"
          style={{
            aspectRatio: '2/3',
            borderRadius: 14,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </>
  );
}
