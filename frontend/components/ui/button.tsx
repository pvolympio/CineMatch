import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-[8px] font-display font-semibold text-sm',
    'whitespace-nowrap select-none transition-all duration-200',
    'disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A36F] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        /* Vinyl - Dourado de filme vintage */
        vinyl:
          'bg-[#C9A36F] text-black hover:bg-[#B8945E] shadow-[0_4px_20px_rgba(201,163,117,0.3)] hover:shadow-[0_6px_30px_rgba(201,163,117,0.45)]',
        /* Velvet - Verde profundo */
        velvet:
          'bg-[#1E4D3E] text-[#F0E6D2] hover:bg-[#2A5A48] border border-[#2D2D33] shadow-[0_4px_20px_rgba(30,77,62,0.25)] hover:shadow-[0_6px_30px_rgba(30,77,62,0.4)]',
        /* Primary Crimson — Main CTA (mantido para compatibilidade) */
        default:
          'bg-[#E11D48] text-white hover:bg-[#be1539] shadow-[0_4px_20px_rgba(225,29,72,0.3)]',
        /* Ember Gold — Secondary accent */
        gold:
          'bg-[#F59E0B] text-black hover:bg-[#d97706] shadow-[0_4px_20px_rgba(245,158,11,0.25)]',
        /* Reel Violet — Tertiary accent */
        reel:
          'bg-[#6366F1] text-white hover:bg-[#4f46e5] shadow-[0_4px_20px_rgba(99,102,241,0.25)]',
        /* Ghost — Low emphasis */
        ghost:
          'bg-transparent text-[#5A5A5A] hover:text-white hover:bg-white/5 shadow-none hover:shadow-none border border-transparent hover:border-white/10',
        /* Outline — Medium emphasis */
        outline:
          'bg-transparent text-[#F0E6D2] border border-[#3A3A40] hover:border-[#C9A36F] hover:bg-[#161618] hover:text-[#F0E6D2]',
        /* Destructive */
        destructive:
          'bg-[#EF4444] text-white hover:bg-[#dc2626] shadow-[0_4px_20px_rgba(239,68,68,0.3)]',
        /* Glow — Para landing/hero CTAs only */
        glow:
          'bg-[#E11D48] text-white hover:bg-[#be1539] shadow-[0_0_40px_rgba(225,29,72,0.35)] ring-1 ring-[rgba(225,29,72,0.4)]',
      },
      size: {
        sm:  'h-8 px-3 text-xs gap-1.5 rounded-[6px]',
        md:  'h-9 px-4 text-sm',
        lg:  'h-11 px-6 text-sm',
        xl:  'h-12 px-8 text-base',
        icon:'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };