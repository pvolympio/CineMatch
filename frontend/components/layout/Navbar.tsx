'use client';
// components/layout/Navbar.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/discover', label: 'Descobrir' },
    { href: '/dashboard', label: 'Meu Perfil' },
    { href: '/explore', label: 'Explorar' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(8,8,16,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(124,58,237,0.12)',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link href={isAuthenticated ? '/dashboard' : '/'} style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #ff2d78, #7c3aed)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>🎬</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            letterSpacing: '0.08em',
            background: 'linear-gradient(135deg, #ff2d78, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>CINEMATCH</span>
        </div>
      </Link>

      {/* Nav Links (desktop) */}
      {isAuthenticated && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} style={{
              textDecoration: 'none',
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 500,
              color: pathname === link.href ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: pathname === link.href ? 'rgba(124,58,237,0.15)' : 'transparent',
              border: pathname === link.href ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}>{link.label}</Link>
          ))}
        </div>
      )}

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAuthenticated ? (
          <>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
            }}>Olá, <strong style={{ color: 'var(--text-primary)' }}>{user?.username}</strong></span>
            <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link href="/login">
              <button className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Entrar</button>
            </Link>
            <Link href="/register">
              <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Começar</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
