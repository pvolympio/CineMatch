export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-void)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-pulse-glow" style={{
          width: 60, height: 60,
          background: 'linear-gradient(135deg, #ff2d78, #7c3aed)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30,
          margin: '0 auto 20px',
          boxShadow: '0 8px 32px rgba(255, 45, 120, 0.4)',
          animation: 'pulse 2s infinite'
        }}>🎬</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'bounce 1.4s infinite ease-in-out both' }} />
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
