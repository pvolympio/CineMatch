'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Film, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await auth.login(form.email, form.password);
      login(data.user, data.token);
      const needsOnboarding = !data.user.onboarding_completed;
      toast.success(`Bem-vindo(a), ${data.user.username}!`);
      router.push(needsOnboarding ? '/onboarding' : '/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden font-display">
      <div className="film-texture" />

      {/* Ambient Blobs */}
      <div className="ambient-blob w-[500px] h-[500px] -top-40 -left-40 opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(201, 163, 117, 0.25) 0%, transparent 70%)' }} />
      <div className="ambient-blob w-[400px] h-[400px] bottom-0 right-0 opacity-20"
           style={{ background: 'radial-gradient(circle, rgba(30, 77, 62, 0.15) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm animate-fade-up">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-10 no-underline group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{
                 background: 'linear-gradient(135deg,#1E4D3E,#2D2D33)',
                 boxShadow: '0 0 24px rgba(201, 163, 117, 0.4)'
               }}>
            <Film className="w-4.5 h-4.5 text-[#C9A36F]" />
          </div>
          <span className="font-bold text-[17px] tracking-[-0.02em] text-white group-hover:text-[#F0E6D2] transition-colors">
            CINEMA
          </span>
          <span className="font-mono text-[8px] text-[#5A5A5A] tracking-[0.15em] uppercase opacity-80">AtELIER</span>
        </Link>

        {/* Card */}
        <div className="card-cinema p-7 rounded-[20px]">
          <div className="mb-7">
            <h1 className="type-title text-2xl text-white mb-1">Entrar</h1>
            <p className="text-[#5A5A5A] font-mono text-xs">Acesso ao seu Atelier Cinematográfico</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-mono text-[#5A5A5A] uppercase tracking-wider mb-1.5">
                <Mail className="w-3 h-3" /> E-mail
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
                className="input-cinema"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-mono text-[#5A5A5A] uppercase tracking-wider mb-1.5">
                <Lock className="w-3 h-3" /> Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                className="input-cinema"
              />
            </div>

            {error && (
              <p className="text-[#C9A36F] text-xs font-mono bg-[rgba(201,163,117,0.12)] border border-[rgba(201,163,117,0.3)] rounded-[8px] px-3 py-2">
                {error}
              </p>
            )}

            <Button variant="vinyl" size="lg" type="submit" disabled={loading} className="w-full mt-1 gap-2">
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Entrando...' : 'Entrar'}</span>
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#3A3A40] flex flex-col items-center gap-2.5">
            <p className="text-[#5A5A5A] font-mono text-[11px]">
              Não tem conta?{' '}
              <Link href="/register" className="text-[#C9A36F] hover:text-[#F0E6D2] font-semibold transition-colors no-underline">
                Criar gratuitamente
              </Link>
            </p>
            <Link href="/" className="flex items-center gap-1 text-[#8A8A90] hover:text-[#5A5A5A] font-mono text-[10px] transition-colors no-underline">
              <ArrowLeft className="w-3 h-3" /> Início
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}