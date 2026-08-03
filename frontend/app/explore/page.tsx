'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { movies as moviesApi, profile as profileApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Movie, GraphNode, GraphEdge } from '@/types';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Compass, Film, X, Star, RefreshCw } from 'lucide-react';

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
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadTrending();
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isAuthenticated, router]);

  const updateDimensions = () => {
    setDimensions({ w: window.innerWidth, h: window.innerHeight - 64 });
  };

  const loadTrending = async () => {
    try {
      const data = await moviesApi.trending();
      setTrendingMovies((data.results as Movie[]).slice(0, 8));
    } catch {
      // Silently handle
    }
  };

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.trim().length >= 2) {
        const data = await moviesApi.search(search);
        setSearchResults((data.results as Movie[]).slice(0, 6));
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
      setCenterMovie(data.center_movie as Movie);

      const { w, h } = dimensions;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.3;

      const newNodes: NodePos[] = (data.nodes as GraphNode[]).map((node: GraphNode, i: number) => {
        if (node.is_center) {
          return { ...node, x: cx, y: cy, vx: cx, vy: cy };
        }
        const angle = ((i - 1) / (data.nodes.length - 1)) * Math.PI * 2;
        const targetX = cx + Math.cos(angle) * radius;
        const targetY = cy + Math.sin(angle) * radius;
        return {
          ...node,
          x: targetX + (Math.random() - 0.5) * 100,
          y: targetY + (Math.random() - 0.5) * 100,
          vx: targetX,
          vy: targetY,
        };
      });

      setNodes(newNodes);
      setEdges(data.edges as GraphEdge[]);
    } catch (e: unknown) {
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

    const localNodes = [...nodes];
    const timeStart = Date.now();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now() - timeStart;

      // Physics / Floating
      localNodes.forEach((node) => {
        if (node.is_center) {
          node.x = node.vx + Math.sin(now / 1500) * 4;
          node.y = node.vy + Math.cos(now / 1500) * 4;
        } else {
          node.x += (node.vx - node.x) * 0.05 + Math.sin(now / 1000 + node.id) * 0.3;
          node.y += (node.vy - node.y) * 0.05 + Math.cos(now / 1200 + node.id) * 0.3;
        }
      });

      // Draw edges (Curved)
      edges.forEach((edge) => {
        const src = localNodes.find((n) => n.id === edge.source);
        const tgt = localNodes.find((n) => n.id === edge.target);
        if (!src || !tgt) return;

        const isHoveredEdge = hoveredNode === src.id || hoveredNode === tgt.id;
        const alpha = isHoveredEdge ? 0.7 : 0.2;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);

        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        const cpX = midX + (tgt.y - src.y) * 0.15;
        const cpY = midY - (tgt.x - src.x) * 0.15;

        ctx.quadraticCurveTo(cpX, cpY, tgt.x, tgt.y);

        const gradient = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
        gradient.addColorStop(0, `rgba(201, 163, 117, ${alpha})`);
        gradient.addColorStop(1, `rgba(30, 77, 62, ${alpha * 0.7})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = isHoveredEdge ? 2.5 : 1.2;
        ctx.stroke();

        if (isHoveredEdge) {
          const t = 0.5;
          const lx = (1 - t) * (1 - t) * src.x + 2 * (1 - t) * t * cpX + t * t * tgt.x;
          const ly = (1 - t) * (1 - t) * src.y + 2 * (1 - t) * t * cpY + t * t * tgt.y;

          ctx.font = '700 10px Plus Jakarta Sans, sans-serif';
          const textWidth = ctx.measureText(edge.label.toUpperCase()).width;

          ctx.fillStyle = 'rgba(18, 18, 20, 0.95)';
          ctx.beginPath();
          ctx.roundRect(lx - textWidth / 2 - 10, ly - 12, textWidth + 20, 24, 12);
          ctx.fill();

          ctx.strokeStyle = 'rgba(201, 163, 117, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#F0E6D2';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(edge.label.toUpperCase(), lx, ly);
        }
      });

      // Draw nodes
      localNodes.forEach((node) => {
        const isCenter = node.is_center;
        const isHovered = hoveredNode === node.id;
        const isDimmed =
          hoveredNode &&
          !isHovered &&
          !edges.some(
            (e) =>
              (e.source === hoveredNode && e.target === node.id) ||
              (e.target === hoveredNode && e.source === node.id)
          );

        const r = isCenter ? 64 : isHovered ? 50 : 38;
        ctx.globalAlpha = isDimmed ? 0.25 : 1;

        if (isCenter || isHovered) {
          const glowR = r * (isCenter ? 2.5 : 2);
          const gradient = ctx.createRadialGradient(node.x, node.y, r, node.x, node.y, glowR);
          gradient.addColorStop(0, isCenter ? 'rgba(201, 163, 117, 0.4)' : 'rgba(30, 77, 62, 0.3)');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 12;

        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = '#0b0c14';
        ctx.fillRect(node.x - r, node.y - r, r * 2, r * 2);

        if (node.poster_url) {
          const img = new Image();
          img.src = node.poster_url;
          if (img.complete) {
            ctx.drawImage(img, node.x - r, node.y - r, r * 2, r * 2);
          }
        }
        ctx.restore();

        ctx.shadowColor = 'transparent';

        // Border ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        const borderGrad = ctx.createLinearGradient(node.x - r, node.y - r, node.x + r, node.y + r);
        if (isCenter) {
          borderGrad.addColorStop(0, '#C9A36F');
          borderGrad.addColorStop(1, '#1E4D3E');
        } else {
          borderGrad.addColorStop(0, 'rgba(255,255,255,0.6)');
          borderGrad.addColorStop(1, 'rgba(255,255,255,0.1)');
        }
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = isCenter ? 3 : isHovered ? 2 : 1.2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#F0E6D2';
        ctx.font = `700 ${isCenter ? 14 : 11}px Plus Jakarta Sans, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const title = node.title.length > 20 ? node.title.substring(0, 18) + '…' : node.title;
        ctx.fillText(title, node.x, node.y + r + 12);

        ctx.fillStyle = '#F59E0B';
        ctx.font = `700 10px Space Grotesk, monospace`;
        ctx.fillText(`★ ${node.vote_average.toFixed(1)}`, node.x, node.y + r + (isCenter ? 32 : 28));

        ctx.globalAlpha = 1;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [nodes, edges, hoveredNode, dimensions]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    },
    [nodes, infoPanel]
  );

  const handleCanvasMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found: number | null = null;
      for (const node of nodes) {
        const r = node.is_center ? 50 : 32;
        const dist = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2);
        if (dist <= r) {
          found = node.id;
          break;
        }
      }
      setHoveredNode(found);
      if (canvasRef.current) canvasRef.current.style.cursor = found ? 'pointer' : 'default';
    },
    [nodes]
  );

  return (
    <main className="min-h-screen bg-[#06060a] overflow-hidden relative font-body text-slate-100">
      <div className="film-texture" />
      <Navbar />

      {/* Main Canvas Viewport */}
      <div className="fixed top-16 inset-x-0 bottom-0">
        {nodes.length > 0 ? (
          <canvas
            ref={canvasRef}
            width={dimensions.w}
            height={dimensions.h}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            className="block"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-[#C9A36F]/15 border border-[#C9A36F]/30 flex items-center justify-center text-[#C9A36F] mb-6 shadow-xl">
              <Compass className="w-8 h-8" />
            </div>
            <h2 className="type-title text-3xl sm:text-4xl text-white mb-3 tracking-tight">
              GRAFO RELACIONAL CINEMATOGRÁFICO
            </h2>
            <p className="text-[#5A5A5A] text-sm max-w-md mb-8 leading-relaxed">
             Selecione uma das obras aclamadas abaixo para mapear seu universo visual e temático.
            </p>
            <div className="flex flex-wrap gap-2.5 justify-center max-w-2xl">
              {trendingMovies.map((m) => (
                <Button key={m.id} variant="outline" size="sm" onClick={() => loadGraph(m.id)}>
                  <Film className="w-3.5 h-3.5 text-[#C9A36F]" />
                  <span>{m.title}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-40">
            <RefreshCw className="w-10 h-10 text-[#C9A36F] animate-spin mb-3" />
            <p className="text-sm font-mono text-slate-300">Mapeando conexões do filme...</p>
          </div>
        )}
      </div>

      {/* Floating Search Controls */}
      <div className="fixed top-24 left-6 z-50 w-72 sm:w-80">
        <div className="rounded-2xl border border-[#3A3A40] bg-slate-900/80 p-4 backdrop-blur-2xl shadow-2xl">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Buscar filme no universo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-[#3A3A40] text-white placeholder:text-slate-400 text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#C9A36F]/50 transition-all font-mono"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5 max-h-60 overflow-y-auto">
              {searchResults.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    loadGraph(m.id);
                    setSearch('');
                    setSearchResults([]);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-950/40 hover:bg-[#C9A36F]/10 border border-[#3A3A40] hover:border-[#C9A36F]/30 text-left text-xs font-semibold text-slate-200 hover:text-[#F0E6D2] transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{m.title}</span>
                  <span className="font-mono text-[10px] text-[#5A5A5A]">{m.release_year}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {centerMovie && (
          <div className="mt-3 rounded-2xl border border-[#3A3A40] bg-slate-900/80 p-4 backdrop-blur-2xl shadow-xl">
            <span className="text-[10px] font-mono text-[#5A5A5A] uppercase tracking-widest block mb-1">
              Centro Atual
            </span>
            <h4 className="type-label text-base text-white">{centerMovie.title}</h4>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="vinyl" className="text-xs">
                <Star className="w-3 h-3 fill-[#F0E6D2] text-amber-400" />
                <span>{centerMovie.vote_average.toFixed(1)}</span>
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Floating Info Drawer */}
      {infoPanel && (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-[#3A3A40] bg-slate-900/90 p-5 backdrop-blur-2xl shadow-2xl animate-fade-up">
          <button
            onClick={() => setInfoPanel(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="type-label text-lg text-white mb-2 pr-6">{infoPanel.title}</h3>
          <Badge variant="vinyl" className="font-mono text-xs mb-3">
            <Star className="w-3.5 h-3.5 fill-[#F0E6D2] text-amber-400" />
            <span>{infoPanel.vote_average.toFixed(1)}</span>
          </Badge>
          <div className="flex flex-wrap gap-1.5">
            {infoPanel.genres?.slice(0, 3).map((g) => (
              <span key={g.id} className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[#3A3A40] text-slate-300">
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}