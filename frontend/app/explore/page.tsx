'use client';
// app/explore/page.tsx
// Visual exploration with a canvas-based force graph
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { movies as moviesApi, profile as profileApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Movie, GraphNode, GraphEdge } from '@/types';
import Navbar from '@/components/layout/Navbar';

interface NodePos extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function ExplorePage() {
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();

  const [centerMovie, setCenterMovie] = useState<Movie | null>(null);
  const [nodes, setNodes] = useState<NodePos[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [infoPanel, setInfoPanel] = useState<NodePos | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadTrending();
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const updateDimensions = () => {
    setDimensions({ w: window.innerWidth, h: window.innerHeight - 64 });
  };

  const loadTrending = async () => {
    try {
      const data = await moviesApi.trending();
      setTrendingMovies(data.results.slice(0, 8));
    } catch (e) {}
  };

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.trim().length >= 2) {
        const data = await moviesApi.search(search);
        setSearchResults(data.results.slice(0, 6));
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadGraph = async (movieId: number) => {
    setLoading(true);
    setInfoPanel(null);
    try {
      const data = await profileApi.graph(movieId);
      setCenterMovie(data.center_movie);

      const { w, h } = dimensions;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.3;

      // Position nodes in a circle around center
      const newNodes: NodePos[] = data.nodes.map((node: GraphNode, i: number) => {
        if (node.is_center) {
          return { ...node, x: cx, y: cy, vx: 0, vy: 0 };
        }
        const angle = ((i - 1) / (data.nodes.length - 1)) * Math.PI * 2;
        return {
          ...node,
          x: cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
          y: cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
          vx: 0, vy: 0,
        };
      });

      setNodes(newNodes);
      setEdges(data.edges);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Draw on canvas
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localNodes = [...nodes];
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw edges
      edges.forEach(edge => {
        const src = localNodes.find(n => n.id === edge.source);
        const tgt = localNodes.find(n => n.id === edge.target);
        if (!src || !tgt) return;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = 'rgba(124,58,237,0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Edge label
        const mx = (src.x + tgt.x) / 2;
        const my = (src.y + tgt.y) / 2;
        ctx.fillStyle = 'rgba(157,157,184,0.7)';
        ctx.font = '10px DM Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(edge.label, mx, my);
      });

      // Draw nodes
      localNodes.forEach(node => {
        const isCenter = node.is_center;
        const isHovered = hoveredNode === node.id;
        const r = isCenter ? 50 : isHovered ? 40 : 32;

        // Glow
        if (isCenter || isHovered) {
          const gradient = ctx.createRadialGradient(node.x, node.y, r * 0.5, node.x, node.y, r * 2);
          gradient.addColorStop(0, isCenter ? 'rgba(255,45,120,0.3)' : 'rgba(124,58,237,0.25)');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node circle with clip for poster
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.clip();

        // Background color
        ctx.fillStyle = isCenter ? '#1a0a1e' : '#12121f';
        ctx.fillRect(node.x - r, node.y - r, r * 2, r * 2);

        // Poster image (try to draw if cached)
        if (node.poster_url) {
          const img = new Image();
          img.src = node.poster_url;
          if (img.complete) {
            ctx.drawImage(img, node.x - r, node.y - r, r * 2, r * 2);
          }
        }

        ctx.restore();

        // Border ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = isCenter ? '#ff2d78' : isHovered ? '#7c3aed' : 'rgba(124,58,237,0.4)';
        ctx.lineWidth = isCenter ? 3 : 2;
        ctx.stroke();

        // Title label
        ctx.fillStyle = '#f0eeff';
        ctx.font = `${isCenter ? 13 : 11}px DM Sans, sans-serif`;
        ctx.textAlign = 'center';
        const title = node.title.length > 16 ? node.title.substring(0, 16) + '…' : node.title;
        ctx.fillText(title, node.x, node.y + r + 16);

        // Rating
        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px DM Sans, sans-serif';
        ctx.fillText(`⭐ ${node.vote_average.toFixed(1)}`, node.x, node.y + r + 30);
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [nodes, edges, hoveredNode, dimensions]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const node of nodes) {
      const r = node.is_center ? 50 : 32;
      const dist = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2);
      if (dist <= r) {
        if (!node.is_center) {
          loadGraph(node.id);
        } else {
          setInfoPanel(infoPanel?.id === node.id ? null : node);
        }
        return;
      }
    }
    setInfoPanel(null);
  }, [nodes, infoPanel]);

  // Handle canvas hover
  const handleCanvasMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found: number | null = null;
    for (const node of nodes) {
      const r = node.is_center ? 50 : 32;
      const dist = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2);
      if (dist <= r) { found = node.id; break; }
    }
    setHoveredNode(found);
    if (canvasRef.current) canvasRef.current.style.cursor = found ? 'pointer' : 'default';
  }, [nodes]);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-void)', overflow: 'hidden' }}>
      <Navbar />

      {/* Canvas */}
      <div style={{ position: 'fixed', top: 64, left: 0, right: 0, bottom: 0 }}>
        {nodes.length > 0 ? (
          <canvas
            ref={canvasRef}
            width={dimensions.w}
            height={dimensions.h}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            style={{ display: 'block' }}
          />
        ) : (
          /* Empty state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: '4rem', marginBottom: 20, animation: 'float 4s ease-in-out infinite' }}>🕸️</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.06em', marginBottom: 12 }}>EXPLORAR CONEXÕES</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 400, lineHeight: 1.7, marginBottom: 32 }}>
              Busque um filme ou escolha um popular abaixo para ver seu universo de conexões.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 600 }}>
              {trendingMovies.map(m => (
                <button key={m.id} onClick={() => loadGraph(m.id)} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                  {m.title.length > 22 ? m.title.substring(0, 22) + '…' : m.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,16,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', animation: 'spin 1s linear infinite', marginBottom: 12 }}>⚙️</div>
              <p style={{ color: 'var(--text-secondary)' }}>Mapeando conexões...</p>
            </div>
          </div>
        )}
      </div>

      {/* Search panel */}
      <div style={{ position: 'fixed', top: 80, left: 20, zIndex: 50, width: 280 }}>
        <div className="glass" style={{ borderRadius: 14, padding: 16 }}>
          <input
            className="input-field"
            type="text"
            placeholder="🔍 Buscar filme..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: '0.85rem', padding: '10px 14px' }}
          />
          {searchResults.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {searchResults.map(m => (
                <button key={m.id} onClick={() => { loadGraph(m.id); setSearch(''); setSearchResults([]); }} style={{
                  background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8,
                  padding: '8px 12px', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)',
                  fontSize: '0.82rem', transition: 'background 0.2s',
                }}>
                  {m.title} <span style={{ color: 'var(--text-muted)' }}>({m.release_year})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {centerMovie && (
          <div className="glass" style={{ borderRadius: 14, padding: 16, marginTop: 12 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Centro atual</p>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{centerMovie.title}</p>
            <span className="score-badge">⭐ {centerMovie.vote_average.toFixed(1)}</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8 }}>Clique em outro nó para explorar</p>
          </div>
        )}
      </div>

      {/* Info panel */}
      {infoPanel && (
        <div className="glass" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, width: 300, borderRadius: 16, padding: 20, animation: 'fadeInUp 0.3s ease forwards' }}>
          <button onClick={() => setInfoPanel(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
          <h3 style={{ fontWeight: 700, marginBottom: 4, paddingRight: 24 }}>{infoPanel.title}</h3>
          <span className="score-badge">⭐ {infoPanel.vote_average.toFixed(1)}</span>
          <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {infoPanel.genres?.slice(0,3).map(g => <span key={g.id} className="genre-pill">{g.name}</span>)}
          </div>
        </div>
      )}

      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </main>
  );
}
