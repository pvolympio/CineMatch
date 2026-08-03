'use client';
// components/profile/GenreChart.tsx
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { GenreWeight } from '@/types';

interface GenreChartProps {
  genres: GenreWeight[];
}

// Paleta vintage cinematográfica
const COLORS = ['#C9A36F', '#1E4D3E', '#53262A', '#C9A36F', '#1E4D3E', '#53262A', '#C9A36F', '#1E4D3E'];

export default function GenreChart({ genres }: GenreChartProps) {
  const top6 = genres.slice(0, 6);

  const radarData = top6.map(g => ({
    genre: g.name,
    value: g.percentage,
    fullMark: 100,
  }));

  return (
    <div>
      {/* Radar Chart */}
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(201, 163, 117, 0.15)" />
            <PolarAngleAxis
              dataKey="genre"
              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-body)' }}
            />
            <Radar
              name="Preferência"
              dataKey="value"
              stroke="#C9A36F"
              fill="#C9A36F"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}
              cursor={{ fill: 'rgba(201, 163, 117, 0.08)' }}
              formatter={(v?: unknown) => [`${v ?? 0}%`, 'Preferência']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Genre bars */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {top6.map((genre, i) => (
          <div key={genre.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                {genre.name}
              </span>
              <span style={{ fontSize: '0.8rem', color: COLORS[i % COLORS.length], fontWeight: 600 }}>
                {genre.percentage}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${genre.percentage}%`,
                  background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i+1) % COLORS.length]} 60%, transparent 60%)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}