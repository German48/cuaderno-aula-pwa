import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Settings, FileText, BookOpen, Lightbulb, ClipboardList } from 'lucide-react';

const items = [
  { to: '/workplace', icon: Wrench, label: 'Taller / FCT', desc: 'Registro de horas' },
  { to: '/sessions', icon: FileText, label: 'Sesiones', desc: 'Bitácora de clase' },
  { to: '/curriculum', icon: BookOpen, label: 'Currículo', desc: 'Módulos, RA y CE' },
  { to: '/suggestions', icon: Lightbulb, label: 'Sugerencias', desc: 'Libro de ideas' },
  { to: '/attendance/history', icon: ClipboardList, label: 'Historial Asistencia', desc: 'Partes anteriores' },
  { to: '/settings', icon: Settings, label: 'Configuración', desc: 'Centro, grupos, backup' },
];

export default function MorePage() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-[var(--color-text)]">Más opciones</h2>
      <div className="grid grid-cols-1 gap-3">
        {items.map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="card p-4 flex items-center gap-4 hover:border-indigo-300 transition-colors">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-medium text-[var(--color-text)]">{label}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
