'use client';
// components/profile/NarrativeChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { NarrativeProfile } from '@/types';

interface NarrativeChartProps {
  profile: NarrativeProfile;
}

const LABELS: Record<string, string> = {
  complex: 'Complexo',
  emotional: 'Emocional',
  action_driven: 'Ação',
  lighthearted: 'Leveza',
};

// Paleta vintage cinematográfica
const COLORS = ['#C9A36F', '#1E4D3E', '#53262A', '#C9A36F'];

export default function NarrativeChart({ profile }: NarrativeChartProps) {
  const data = Object.entries(profile).map(([key, value], i) => ({
    name: LABELS[key] || key,
    value: Math.round(Number(value) * 100),
    color: COLORS[i],
  }));

  return (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={32} layout="vertical">
          <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="name" width={70} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
            cursor={{ fill: 'rgba(201, 163, 117, 0.08)' }}
            formatter={(v?: unknown) => [`${v ?? 0}%`, 'Afinidade']}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}