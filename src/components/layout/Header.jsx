import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { BookOpen, ChevronDown } from 'lucide-react';

export default function Header() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const groups = useLiveQuery(() => db.groups.toArray()) || [];
  const modules = useLiveQuery(() => db.modules.toArray()) || [];
  const [showGroupSelect, setShowGroupSelect] = useState(false);
  const [showModuleSelect, setShowModuleSelect] = useState(false);

  const activeGroup = groups.find(g => g.id === settings?.activeGroupId);
  const activeModule = modules.find(m => m.id === settings?.activeModuleId);

  const selectGroup = async (id) => {
    const mod = modules.find(m => m.groupId === id);
    await db.settings.update(1, { activeGroupId: id, activeModuleId: mod?.id || null });
    setShowGroupSelect(false);
  };

  const selectModule = async (id) => {
    await db.settings.update(1, { activeModuleId: id });
    setShowModuleSelect(false);
  };

  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3 shadow-sm">
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <BookOpen size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-[var(--color-text)] truncate">
          {settings?.schoolName || 'Cuaderno de Aula'}
        </h1>
        <p className="text-xs text-[var(--color-text-muted)]">{settings?.course}</p>
      </div>

      {/* Selector Grupo */}
      <div className="relative">
        <button
          onClick={() => { setShowGroupSelect(!showGroupSelect); setShowModuleSelect(false); }}
          className="btn btn-ghost text-xs px-2 py-1 flex items-center gap-1"
        >
          <span className="truncate max-w-[120px]">{activeGroup?.name || 'Sin grupo'}</span>
          <ChevronDown size={12} />
        </button>
        {showGroupSelect && (
          <div className="absolute right-0 top-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 min-w-[180px] py-1">
            {groups.map(g => (
              <button key={g.id} onClick={() => selectGroup(g.id)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-bg)] text-[var(--color-text)]">
                {g.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selector Módulo */}
      <div className="relative">
        <button
          onClick={() => { setShowModuleSelect(!showModuleSelect); setShowGroupSelect(false); }}
          className="btn btn-ghost text-xs px-2 py-1 flex items-center gap-1"
        >
          <span className="truncate max-w-[100px]">{activeModule?.shortName || 'Módulo'}</span>
          <ChevronDown size={12} />
        </button>
        {showModuleSelect && (
          <div className="absolute right-0 top-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 min-w-[200px] py-1">
            {modules.map(m => (
              <button key={m.id} onClick={() => selectModule(m.id)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-bg)] text-[var(--color-text)]">
                <span style={{ color: m.color }} className="font-medium">{m.shortName}</span>
                <span className="ml-2 text-[var(--color-text-muted)]">{m.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
