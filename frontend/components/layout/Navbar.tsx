'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Film, Sparkles, Flame, User, Compass, LogOut, LogIn, UserPlus } from 'lucide-react';

const navLinks = [
  { href: '/discover', label: 'Descobrir', icon: Sparkles },
  { href: '/swipe',    label: 'Avaliar',   icon: Flame },
  { href: '/dashboard', label: 'Perfil',   icon: User },
  { href: '/explore',  label: 'Explorar',  icon: Compass },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useStore();
  const router   = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <>
      {/* Desktop / Tablet Top Bar */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'h-14 bg-black/90 backdrop-blur-2xl border-b border-white/8 shadow-[0_1px_0_rgba(255,255,255,0.06)]'
            : 'h-18 bg-gradient-to-b from-black/80 to-transparent'
        }`}
        style={{ height: scrolled ? '56px' : '72px' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

          {/* Brand - Novo visual */}
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group no-underline select-none">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white relative"
              style={{
                background: 'linear-gradient(135deg, #1E4D3E, #2D2D33)',
                boxShadow: '0 0 16px rgba(201, 163, 117, 0.25)'
              }}
            >
              <Film className="w-4 h-4 text-[#C9A36F]" />
              {/* Efeito de luz vintage */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#C9A36F10] to-transparent rounded-xl" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-[15px] tracking-[-0.02em] text-white group-hover:text-[#F0E6D2] transition-colors">
                CINEMA
              </span>
              <span className="font-mono text-[9px] text-[#5A5A5A] tracking-[0.15em] uppercase">
                Atelier
              </span>
            </div>
          </Link>

          {/* Desktop Nav Pills */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-0.5 bg-white/4 border border-white/7 rounded-[12px] p-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold font-display transition-all duration-200 no-underline ${
                      active
                        ? 'bg-[#C9A36F] text-black shadow-[0_2px_12px_rgba(201,163,117,0.35)]'
                        : 'text-[#5A5A5A] hover:text-white hover:bg-white/6'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: active ? '#121214' : '#94A3B8' }} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white/5 border border-white/7 text-[11px] font-mono text-[#5A5A5A]">
                  <User className="w-3 h-3 text-[#C9A36F]" />
                  <span className="text-white font-semibold">{user?.username}</span>
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[#5A5A5A] hover:text-[#F0E6D2] gap-1.5">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-[#5A5A5A] hover:text-[#F0E6D2] gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="vinyl" size="sm" className="gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Começar</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-3 inset-x-3 z-50 rounded-[18px] bg-black/95 border border-white/10 backdrop-blur-2xl shadow-[0_-4px_40px_rgba(0,0,0,0.8)] flex items-center justify-around px-2 py-2">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-[10px] transition-all duration-200 no-underline ${
                  active
                    ? 'text-[#C9A36F] bg-[rgba(201,163,117,0.15)]'
                    : 'text-[#5A5A5A] hover:text-[#F0E6D2]'
                }`}
              >
                <Icon className="w-4.5 h-4.5" style={{ color: active ? '#C9A36F' : '#5A5A5A' }} />
                <span className="font-mono text-[9px] tracking-widest uppercase">{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}