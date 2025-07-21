'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { Stats } from '@/lib/types';

interface StatsChartProps {
  stats: Stats;
}

export default function StatsChart({ stats }: StatsChartProps) {
  const chartData = [
    { subject: 'Strength', xp: stats.strength_exp },
    { subject: 'Intelligence', xp: stats.intelligence_exp },
    { subject: 'Soul', xp: stats.soul_exp },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <defs>
            <linearGradient id="radar-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
        </defs>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 13 }} />
        <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 20']} tick={false} axisLine={false} />
        <Tooltip 
            contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--card-foreground))'
            }}
            labelStyle={{ fontWeight: 'bold' }}
            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, fill: 'hsla(var(--primary) / 0.1)' }}
        />
        <Radar 
            name="XP" 
            dataKey="xp" 
            stroke="hsl(var(--primary))" 
            fill="url(#radar-fill)" 
            fillOpacity={1} 
            strokeWidth={2} 
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
