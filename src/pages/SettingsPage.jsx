import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateLastSaved } from '../db';
import { Moon, Sun, Upload, Download, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { exportDatabase as exportBackup, importDatabase as importBackup } from '../lib/backup';
import Modal from '../components/ui/Modal';

export default function SettingsPage() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const groups = useLiveQuery(() => db.groups.toArray()) || [];
  const modules = useLiveQuery(() => db.modules.toArray()) || [];
  const darkMode = settings?.darkMode;

  const [form, setForm] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingMod, setEditingMod] = useState(null);
  const [groupForm, setGroupForm] = useState({ name: '', stage: 'Superior', year: 1, evalCount: 3 });
  const [modForm, setModForm] = useState({ code: '', name: '', shortName: '', color: '#4F46E5', examsWeight: 30, projectsWeight: 70, obsWeight: 0 });
  const [tab, setTab] = useState('centro');
  const logoRef = useRef();

  const applySettings = async (updates) => {
    await db.settings.update(1, updates);
    await updateLastSaved();
  };

  const toggleDark = () => applySettings({ darkMode: !darkMode });

  React.useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const saveSchool = async () => {
    await applySettings(form);
  };

  const handleLogo = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => applySettings({ logo: ev.target.result });
    reader.readAsDataURL(file);
  };

  // Groups
  const saveGroup = async () => {
    if (editingGroup?.id) {
      await db.groups.update(editingGroup.id, groupForm);
    } else {
      await db.groups.add(groupForm);
    }
    await updateLastSaved();
    setEditingGroup(null);
    setGroupForm({ name: '', stage: 'Superior', year: 1, evalCount: 3 });
  };

  // Modules
  const saveMod = async () => {
    if (editingMod?.id) {
      await db.modules.update(editingMod.id, { ...modForm, groupId: modForm.groupId || null });
    } else {
      await db.modules.add({ ...modForm, groupId: modForm.groupId || null });
    }
    await updateLastSaved();
    setEditingMod(null);
  };

  const tabs = [
    { key: 'centro', label: 'Centro' },
    { key: 'grupos', label: 'Grupos' },
    { key: 'modulos', label: 'Módulos' },
    { key: 'sistema', label: 'Sistema' },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-[var(--color-text)]">Configuración</h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Centro */}
      {tab === 'centro' && settings && (
        <div className="card p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Nombre del centro</label>
            <input className="input" value={form.schoolName || ''} onChange={e => setForm({ ...form, schoolName: e.target.value })} onBlur={saveSchool} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Nombre del profesor</label>
            <input className="input" value={form.teacherName || ''} onChange={e => setForm({ ...form, teacherName: e.target.value })} onBlur={saveSchool} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Curso académico</label>
            <input className="input" placeholder="2025/2026" value={form.course || ''} onChange={e => setForm({ ...form, course: e.target.value })} onBlur={saveSchool} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text)]">Logo del centro</label>
            <div className="flex items-center gap-3">
              {form.logo && <img src={form.logo} className="w-12 h-12 rounded-lg object-cover" alt="logo" />}
              <button onClick={() => logoRef.current?.click()} className="btn btn-secondary text-sm">
                <Upload size={14} /> {form.logo ? 'Cambiar' : 'Subir logo'}
              </button>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            </div>
          </div>
        </div>
      )}

      {/* Grupos */}
      {tab === 'grupos' && (
        <div className="space-y-3">
          <button onClick={() => { setGroupForm({ name: '', stage: 'Superior', year: 1, evalCount: 3 }); setEditingGroup({}); }} className="btn btn-primary text-sm"><Plus size={14} /> Grupo</button>
          {groups.map(g => (
            <div key={g.id} className="card p-3 flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium text-[var(--color-text)]">{g.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{g.stage} · Año {g.year}</p>
              </div>
              <button onClick={() => { setGroupForm(g); setEditingGroup(g); }} className="btn btn-ghost p-1"><Edit2 size={14} /></button>
              <button onClick={async () => { await db.groups.delete(g.id); await updateLastSaved(); }} className="btn btn-ghost text-red-500 p-1"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Módulos */}
      {tab === 'modulos' && (
        <div className="space-y-3">
          <button onClick={() => { setModForm({ code: '', name: '', shortName: '', color: '#4F46E5', examsWeight: 30, projectsWeight: 70, obsWeight: 0, groupId: groups[0]?.id }); setEditingMod({}); }} className="btn btn-primary text-sm"><Plus size={14} /> Módulo</button>
          {modules.map(m => (
            <div key={m.id} className="card p-3 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--color-text)]">{m.shortName} — {m.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{m.code} · {m.examsWeight}% ex · {m.projectsWeight}% pr</p>
              </div>
              <button onClick={() => { setModForm(m); setEditingMod(m); }} className="btn btn-ghost p-1"><Edit2 size={14} /></button>
              <button onClick={async () => { await db.modules.delete(m.id); await updateLastSaved(); }} className="btn btn-ghost text-red-500 p-1"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Sistema */}
      {tab === 'sistema' && settings && (
        <div className="space-y-4">
          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--color-text)]">Tema oscuro</p>
              <p className="text-sm text-[var(--color-text-muted)]">Activa el modo oscuro</p>
            </div>
            <button onClick={toggleDark} className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-slate-300'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="card p-4 space-y-3">
            <p className="font-medium text-[var(--color-text)]">Copia de seguridad</p>
            <button onClick={exportBackup} className="btn btn-secondary w-full justify-start">
              <Download size={16} /> Exportar datos (JSON)
            </button>
            <p className="text-xs text-[var(--color-text-muted)]">Descarga todos tus datos como archivo JSON.</p>
          </div>

          <div className="card p-4 space-y-3">
            <p className="font-medium text-[var(--color-text)]">Restaurar copia</p>
            <input type="file" accept=".json" id="restore-input" className="hidden" onChange={e => importBackup(e.target.files[0])} />
            <label htmlFor="restore-input" className="btn btn-secondary w-full justify-start cursor-pointer">
              <Upload size={16} /> Importar archivo JSON
            </label>
            <p className="text-xs text-amber-600">⚠️ Esto reemplazará todos los datos actuales.</p>
          </div>

          <div className="card p-4">
            <p className="text-xs text-[var(--color-text-muted)]">
              Última sincronización: {settings.lastSaved ? new Date(settings.lastSaved).toLocaleString('es-ES') : 'Nunca'}
            </p>
          </div>
        </div>
      )}

      {/* Group modal */}
      {editingGroup !== null && (
        <Modal onClose={() => setEditingGroup(null)} title={editingGroup?.id ? 'Editar Grupo' : 'Nuevo Grupo'}>
          <div className="space-y-3">
            <input className="input" placeholder="Nombre del grupo" value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <select className="input" value={groupForm.stage} onChange={e => setGroupForm({ ...groupForm, stage: e.target.value })}>
                <option>Superior</option>
                <option>Medio</option>
                <option>Básico</option>
              </select>
              <input className="input" type="number" placeholder="Año" value={groupForm.year} onChange={e => setGroupForm({ ...groupForm, year: +e.target.value })} />
            </div>
            <input className="input" type="number" placeholder="Nº evaluaciones" value={groupForm.evalCount} onChange={e => setGroupForm({ ...groupForm, evalCount: +e.target.value })} />
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEditingGroup(null)} className="btn btn-secondary">Cancelar</button>
              <button onClick={saveGroup} className="btn btn-primary">Guardar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Module modal */}
      {editingMod !== null && (
        <Modal onClose={() => setEditingMod(null)} title={editingMod?.id ? 'Editar Módulo' : 'Nuevo Módulo'}>
          <div className="space-y-3">
            <input className="input" placeholder="Código" value={modForm.code} onChange={e => setModForm({ ...modForm, code: e.target.value })} />
            <input className="input" placeholder="Nombre completo" value={modForm.name} onChange={e => setModForm({ ...modForm, name: e.target.value })} />
            <input className="input" placeholder="Nombre corto (3 letras)" value={modForm.shortName} onChange={e => setModForm({ ...modForm, shortName: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <input className="input" type="number" placeholder="% Ex" value={modForm.examsWeight} onChange={e => setModForm({ ...modForm, examsWeight: +e.target.value })} />
              <input className="input" type="number" placeholder="% Pr" value={modForm.projectsWeight} onChange={e => setModForm({ ...modForm, projectsWeight: +e.target.value })} />
              <input className="input" type="number" placeholder="% Ob" value={modForm.obsWeight} onChange={e => setModForm({ ...modForm, obsWeight: +e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={modForm.color} onChange={e => setModForm({ ...modForm, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
              <span className="text-sm text-[var(--color-text-muted)]">Color identificativo</span>
            </div>
            <select className="input" value={modForm.groupId || ''} onChange={e => setModForm({ ...modForm, groupId: +e.target.value || null })}>
              <option value="">Grupo</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEditingMod(null)} className="btn btn-secondary">Cancelar</button>
              <button onClick={saveMod} className="btn btn-primary">Guardar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
