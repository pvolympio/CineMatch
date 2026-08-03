import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-mono text-[11px] font-medium tracking-wide whitespace-nowrap px-2.5 py-1 leading-none transition-all duration-200',
  {
    variants: {
      variant: {
        /* Vinyl - Selo de filme vintage */
        vinyl:        'bg-[rgba(201,163,117,0.15)] border border-[rgba(201,163,117,0.3)] text-[#C9A36F] hover:bg-[rgba(201,163,117,0.25)] hover:scale-105',
        /* Velvet - Capa de filme verde */
        velvet:       'bg-[rgba(30,77,62,0.15)] border border-[rgba(30,77,62,0.3)] text-[#1E4D3E] hover:bg-[rgba(30,77,62,0.25)] hover:scale-105',
        /* Default - neutro */
        default:      'bg-white/7 border border-white/10 text-[#5A5A5A]',
        /* Crimson - usado para estados ativos */
        crimson:      'bg-[rgba(225,29,72,0.12)] border border-[rgba(225,29,72,0.3)] text-[#fb7185]',
        /* Gold - destaque */
        gold:         'bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] text-[#fbbf24]',
        /* Reel - tom violeta suave */
        reel:         'bg-[rgba(99,102,241,0.12)] border border-[rgba(99,102,241,0.3)] text-[#a5b4fc]',
        /* Success - confirmação */
        success:      'bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)] text-[#34d399]',
        /* Outline - contorno */
        outline:      'bg-transparent border border-white/10 text-[#5A5A5A] hover:border-white/20',
        /* Solid - preenchido */
        solid:        'bg-[#C9A36F] border-none text-black hover:bg-[#B8945E]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };