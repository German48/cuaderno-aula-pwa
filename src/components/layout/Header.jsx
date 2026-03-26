import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { BookOpen, ChevronDown, Moon, Sun, Cloud, CloudOff, RefreshCw, CheckCircle, AlertTriangle, Download } from 'lucide-react';

export default function Header() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const groups = useLiveQuery(() => db.groups.toArray()) || [];
  const modules = useLiveQuery(() => db.modules.toArray()) || [];
  const [showGroupSelect, setShowGroupSelect] = useState(false);
  const [showModuleSelect, setShowModuleSelect] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const { canInstall, install, installHint } = useInstallPrompt();

  const activeGroup = groups.find(g => g.id === settings?.activeGroupId);
  const activeModule = modules.find(m => m.id === settings?.activeModuleId);
  const darkMode = !!settings?.darkMode;
  const syncStatus = settings?.syncStatus || 'idle';

  const syncUi = {
    idle: { icon: CloudOff, color: 'text-slate-400', title: settings?.syncMessage || 'Sin sincronizar' },
    pending: { icon: Cloud, color: 'text-amber-500', title: settings?.syncMessage || 'Cambios pendientes' },
    syncing: { icon: RefreshCw, color: 'text-sky-500 animate-spin', title: settings?.syncMessage || 'Sincronizando…' },
    ok: { icon: CheckCircle, color: 'text-emerald-500', title: settings?.syncMessage || 'Sincronizado' },
    error: { icon: AlertTriangle, color: 'text-red-500', title: settings?.syncMessage || 'Error de sincronización' },
  }[syncStatus] || { icon: CloudOff, color: 'text-slate-400', title: 'Sin estado' };

  const SyncIcon = syncUi.icon;

  const selectGroup = async (id) => {
    const mod = modules.find(m => m.groupId === id);
    await db.settings.update(1, { activeGroupId: id, activeModuleId: mod?.id || null });
    setShowGroupSelect(false);
  };

  const selectModule = async (id) => {
    await db.settings.update(1, { activeModuleId: id });
    setShowModuleSelect(false);
  };

  const toggleDarkMode = async () => {
    const nextDark = !darkMode;
    document.documentElement.classList.toggle('dark', nextDark);
    await db.settings.update(1, { darkMode: nextDark });
  };

  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3 shadow-sm">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-indigo-600">
        {settings?.logo ? (
          <img src={settings.logo} alt="Logo del centro" className="w-full h-full object-cover" />
        ) : (
          <BookOpen size={18} className="text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-[var(--color-text)] truncate">
          {settings?.schoolName || 'Cuaderno de Aula'}
        </h1>
        <p className="text-xs text-[var(--color-text-muted)]">{settings?.course}</p>
      </div>

      <button
        className={`btn btn-ghost px-2 py-1.5 gap-2 ${syncUi.color}`}
        title={syncUi.title}
      >
        <SyncIcon size={16} />
        <span className="text-[11px] font-medium hidden sm:inline">{syncStatus === 'ok' ? 'Sync OK' : syncStatus === 'syncing' ? 'Sync…' : syncStatus === 'pending' ? 'Pendiente' : syncStatus === 'error' ? 'Error' : 'Local'}</span>
      </button>

      <button
        onClick={toggleDarkMode}
        className="btn btn-ghost p-2"
        title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {canInstall ? (
        <button
          onClick={install}
          className="btn btn-ghost px-2 py-1.5 gap-2 text-emerald-600"
          title="Instalar app"
        >
          <Download size={16} />
          <span className="text-[11px] font-medium hidden sm:inline">Instalar</span>
        </button>
      ) : (
        <button
          onClick={() => setShowInstallHelp(v => !v)}
          className="btn btn-ghost px-2 py-1.5 gap-2 text-slate-500"
          title="Cómo instalar la app"
        >
          <Download size={16} />
          <span className="text-[11px] font-medium hidden sm:inline">Instalar</span>
        </button>
      )}

      {showInstallHelp ? (
        <div className="absolute top-14 right-4 z-50 max-w-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-xl text-xs text-[var(--color-text)]">
          <p className="font-semibold mb-1">Instalar app</p>
          <p>{installHint}</p>
        </div>
      ) : null}

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
