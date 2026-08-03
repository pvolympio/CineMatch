'use client';

import { MouseEvent, ReactNode } from 'react';

interface RippleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function RippleButton({
  children,
  onClick,
  className = 'btn-primary',
  disabled = false,
  type = 'button',
}: RippleButtonProps) {
  const createRipple = (e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      createRipple(e);
      onClick?.();
    }
  };

  return (
    <button
      type={type}
      className={className}
      onClick={handleClick}
      disabled={disabled}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </button>
  );
}
