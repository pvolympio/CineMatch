'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { isAuthenticated } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated]);

  if (!mounted) return null;

  const features = [
    { icon: '🧠', title: 'Perfil Cinematográfico', desc: 'Descubra seu estilo único como espectador através de análise inteligente dos seus filmes.' },
    { icon: '💎', title: 'Joias Escondidas', desc: 'Filmes incríveis que poucos conhecem, selecionados especialmente para o seu gosto.' },
    { icon: '🕸️', title: 'Exploração Visual', desc: 'Navegue por um universo de conexões entre filmes de forma interativa e intuitiva.' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-void)', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,120,0.12) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse' }} />
      </div>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(124,58,237,0.1)', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#ff2d78,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎬</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.08em', background: 'linear-gradient(135deg,#ff2d78,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CINEMATCH</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login"><button className="btn-ghost" style={{ padding: '6px 20px' }}>Entrar</button></Link>
          <Link href="/register"><button className="btn-primary" style={{ padding: '6px 20px' }}>Começar Grátis</button></Link>
        </div>
      </nav>

      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, animation: 'fadeInUp 0.6s ease forwards' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 32, fontSize: '0.8rem', color: '#ff6b9d', fontWeight: 500 }}>✨ Inteligência Cinematográfica</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 10vw, 7rem)', letterSpacing: '0.04em', lineHeight: 0.95, marginBottom: 28 }}>
            <span style={{ color: 'var(--text-primary)' }}>DESCUBRA</span><br />
            <span style={{ background: 'linear-gradient(135deg,#ff2d78,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SEU CINEMA</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7, fontWeight: 300 }}>Analise seu gosto, encontre joias escondidas e explore conexões entre filmes — tudo personalizado para você.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register"><button className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>Criar Perfil Grátis →</button></Link>
            <Link href="/login"><button className="btn-ghost" style={{ padding: '14px 36px', fontSize: '1rem' }}>Já tenho conta</button></Link>
          </div>
        </div>

        <div style={{ marginTop: 80, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 700 }}>
          {['🎭','🚀','👁️','🌊','🔥','🎪','⚔️','🌙'].map((emoji, i) => (
            <div key={i} style={{ width: 70, height: 100, borderRadius: 10, background: `linear-gradient(135deg, rgba(124,58,237,${0.1 + i*0.03}), rgba(255,45,120,${0.1 + i*0.02}))`, border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', animation: `float ${5 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>{emoji}</div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.05em', textAlign: 'center', marginBottom: 60 }}>COMO FUNCIONA</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="glass" style={{ padding: 32, borderRadius: 16, transition: 'transform 0.3s ease' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: '0.05em', marginBottom: 12 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, padding: '40px 24px 120px', textAlign: 'center' }}>
        <div className="glass" style={{ maxWidth: 600, margin: '0 auto', padding: '60px 40px', borderRadius: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.05em', marginBottom: 16 }}>PRONTO PARA DESCOBRIR?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>Avalie 5 filmes e veja sua análise cinematográfica completa em segundos.</p>
          <Link href="/register"><button className="btn-primary" style={{ padding: '14px 40px', fontSize: '1rem' }}>Começar Agora →</button></Link>
        </div>
      </section>

      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}@keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </main>
  );
}
