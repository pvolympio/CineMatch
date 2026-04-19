'use client';
// app/register/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useStore();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres'); return; }
    setLoading(true);
    try {
      const data = await auth.register(form.email, form.username, form.password);
      login(data.user, data.token);
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,120,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="glass" style={{ width: '100%', maxWidth: 440, borderRadius: 20, padding: '48px 40px', position: 'relative', zIndex: 1, animation: 'fadeInUp 0.5s ease forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#ff2d78,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎬</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.08em', background: 'linear-gradient(135deg,#ff2d78,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CINEMATCH</span>
          </div>
          <h1 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Crie sua conta grátis</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Email</label>
            <input className="input-field" type="email" placeholder="seu@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Nome de usuário</label>
            <input className="input-field" type="text" placeholder="cinefilo123" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" title="Letras, números e _ apenas" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Senha</label>
            <input className="input-field" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
          </div>

          {error && (
            <div style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)', borderRadius: 8, padding: '10px 14px', color: '#ff6b9d', fontSize: '0.85rem' }}>{error}</div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '13px', marginTop: 8, fontSize: '0.95rem' }}>
            {loading ? 'Criando conta...' : 'Criar Conta →'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '14px', background: 'rgba(124,58,237,0.08)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.15)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
            🎬 Após criar sua conta, você vai selecionar filmes que gosta para montar seu perfil cinematográfico!
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}>Entrar</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 12 }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem' }}>← Voltar ao início</Link>
        </p>
      </div>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </main>
  );
}
