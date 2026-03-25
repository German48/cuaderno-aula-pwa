import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, color = '#4F46E5', sublabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-text-muted)] font-medium">{label}</p>
        <p className="text-xl font-bold text-[var(--color-text)]">{value}</p>
        {sublabel && <p className="text-xs text-[var(--color-text-muted)]">{sublabel}</p>}
      </div>
    </motion.div>
  );
}
