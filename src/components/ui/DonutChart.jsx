import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4F46E5', '#06b6d4', '#10b981', '#D97706', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DonutChart({ data, centerLabel, centerValue, size = 140 }) {
  const chartData = Array.isArray(data)
    ? data
    : Object.entries(data || {}).map(([name, value]) => ({ name, value }));

  if (!chartData.length) return null;

  return (
    <div className="relative inline-flex items-center justify-center">
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.55}
            outerRadius={size * 0.75}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--color-text)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && <span className="text-lg font-bold text-[var(--color-text)]">{centerValue}</span>}
          {centerLabel && <span className="text-[10px] text-[var(--color-text-muted)]">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}
