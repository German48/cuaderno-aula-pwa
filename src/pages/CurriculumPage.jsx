import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateLastSaved } from '../db';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/ui/Modal';

export default function CurriculumPage() {
  const [tab, setTab] = useState('modules');
  const groups = useLiveQuery(() => db.groups.toArray()) || [];
  const modules = useLiveQuery(() => db.modules.toArray()) || [];
  const ras = useLiveQuery(() => db.learningOutcomes.toArray()) || [];
  const ces = useLiveQuery(() => db.criteria.toArray()) || [];
  const units = useLiveQuery(() => db.units.toArray()) || [];

  const [editingMod, setEditingMod] = useState(null);
  const [editingRA, setEditingRA] = useState(null);
  const [editingCE, setEditingCE] = useState(null);
  const [formMod, setFormMod] = useState({ code: '', name: '', shortName: '', color: '#4F46E5', examsWeight: 30, projectsWeight: 70, obsWeight: 0, groupId: null });
  const [formRA, setFormRA] = useState({ code: '', description: '', weight: 0, evaluation: '1', moduleId: null });
  const [formCE, setFormCE] = useState({ code: '', description: '', raId: null });

  const saveMod = async () => {
    if (editingMod?.id) {
      await db.modules.update(editingMod.id, formMod);
    } else {
      await db.modules.add(formMod);
    }
    await updateLastSaved();
    setEditingMod(null);
  };

  const saveRA = async () => {
    if (editingRA?.id) {
      await db.learningOutcomes.update(editingRA.id, formRA);
    } else {
      await db.learningOutcomes.add(formRA);
    }
    await updateLastSaved();
    setEditingRA(null);
  };

  const saveCE = async () => {
    if (editingCE?.id) {
      await db.criteria.update(editingCE.id, formCE);
    } else {
      await db.criteria.add(formCE);
    }
    await updateLastSaved();
    setEditingCE(null);
  };

  const tabs = [
    { key: 'modules', label: 'Módulos' },
    { key: 'ras', label: 'RA' },
    { key: 'ces', label: 'CE' },
    { key: 'units', label: 'UD' },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-[var(--color-text)]">Currículo</h2>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'modules' && (
        <div className="space-y-3">
          <button onClick={() => { setFormMod({ code: '', name: '', shortName: '', color: '#4F46E5', examsWeight: 30, projectsWeight: 70, obsWeight: 0, groupId: groups[0]?.id }); setEditingMod({}); }} className="btn btn-primary text-sm"><Plus size={14} /> Módulo</button>
          {modules.map(m => (
            <div key={m.id} className="card p-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--color-text)]">{m.shortName} — {m.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Código {m.code} · {m.examsWeight}% exam · {m.projectsWeight}% proj</p>
              </div>
              <button onClick={() => { setFormMod(m); setEditingMod(m); }} className="btn btn-ghost p-1"><Edit2 size={14} /></button>
              <button onClick={async () => { await db.modules.delete(m.id); await updateLastSaved(); }} className="btn btn-ghost text-red-500 p-1"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {tab === 'ras' && (
        <div className="space-y-3">
          <button onClick={() => { setFormRA({ code: '', description: '', weight: 0, evaluation: '1', moduleId: modules[0]?.id }); setEditingRA({}); }} className="btn btn-primary text-sm"><Plus size={14} /> RA</button>
          {ras.map(r => (
            <div key={r.id} className="card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-[var(--color-text)]">{r.code} <span className="text-xs text-[var(--color-text-muted)]">(peso {r.weight}%)</span></p>
                  <p className="text-sm text-[var(--color-text-muted)]">{r.description}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setFormRA(r); setEditingRA(r); }} className="btn btn-ghost p-1"><Edit2 size={14} /></button>
                  <button onClick={async () => { await db.learningOutcomes.delete(r.id); await updateLastSaved(); }} className="btn btn-ghost text-red-500 p-1"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'ces' && (
        <div className="space-y-3">
          <button onClick={() => { setFormCE({ code: '', description: '', raId: ras[0]?.id }); setEditingCE({}); }} className="btn btn-primary text-sm"><Plus size={14} /> CE</button>
          {ces.map(c => (
            <div key={c.id} className="card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-[var(--color-text)]">{c.code}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{c.description}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setFormCE(c); setEditingCE(c); }} className="btn btn-ghost p-1"><Edit2 size={14} /></button>
                  <button onClick={async () => { await db.criteria.delete(c.id); await updateLastSaved(); }} className="btn btn-ghost text-red-500 p-1"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'units' && (
        <div className="space-y-3">
          {units.map(u => (
            <div key={u.id} className="card p-4">
              <p className="font-medium text-[var(--color-text)]">UD{u.number}: {u.title}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Módulo #{u.moduleId}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {editingMod !== null && (
        <Modal onClose={() => setEditingMod(null)} title={editingMod?.id ? 'Editar Módulo' : 'Nuevo Módulo'}>
          <div className="space-y-3">
            <input className="input" placeholder="Código" value={formMod.code} onChange={e => setFormMod({ ...formMod, code: e.target.value })} />
            <input className="input" placeholder="Nombre completo" value={formMod.name} onChange={e => setFormMod({ ...formMod, name: e.target.value })} />
            <input className="input" placeholder="Nombre corto (3-4 letras)" value={formMod.shortName} onChange={e => setFormMod({ ...formMod, shortName: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <input className="input" type="number" placeholder="% Exam" value={formMod.examsWeight} onChange={e => setFormMod({ ...formMod, examsWeight: +e.target.value })} />
              <input className="input" type="number" placeholder="% Proy" value={formMod.projectsWeight} onChange={e => setFormMod({ ...formMod, projectsWeight: +e.target.value })} />
              <input className="input" type="number" placeholder="% Obs" value={formMod.obsWeight} onChange={e => setFormMod({ ...formMod, obsWeight: +e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={formMod.color} onChange={e => setFormMod({ ...formMod, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
              <span className="text-sm text-[var(--color-text-muted)]">Color del módulo</span>
            </div>
            <select className="input" value={formMod.groupId || ''} onChange={e => setFormMod({ ...formMod, groupId: +e.target.value || null })}>
              <option value="">Seleccionar grupo</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEditingMod(null)} className="btn btn-secondary">Cancelar</button>
              <button onClick={saveMod} className="btn btn-primary">Guardar</button>
            </div>
          </div>
        </Modal>
      )}

      {editingRA !== null && (
        <Modal onClose={() => setEditingRA(null)} title={editingRA?.id ? 'Editar RA' : 'Nuevo RA'}>
          <div className="space-y-3">
            <input className="input" placeholder="Código (ej: RA 1)" value={formRA.code} onChange={e => setFormRA({ ...formRA, code: e.target.value })} />
            <textarea className="input" placeholder="Descripción" rows={3} value={formRA.description} onChange={e => setFormRA({ ...formRA, description: e.target.value })} />
            <input className="input" type="number" placeholder="Peso (%)" value={formRA.weight} onChange={e => setFormRA({ ...formRA, weight: +e.target.value })} />
            <select className="input" value={formRA.moduleId || ''} onChange={e => setFormRA({ ...formRA, moduleId: +e.target.value || null })}>
              <option value="">Seleccionar módulo</option>
              {modules.map(m => <option key={m.id} value={m.id}>{m.shortName} — {m.name}</option>)}
            </select>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEditingRA(null)} className="btn btn-secondary">Cancelar</button>
              <button onClick={saveRA} className="btn btn-primary">Guardar</button>
            </div>
          </div>
        </Modal>
      )}

      {editingCE !== null && (
        <Modal onClose={() => setEditingCE(null)} title={editingCE?.id ? 'Editar CE' : 'Nuevo CE'}>
          <div className="space-y-3">
            <input className="input" placeholder="Código (ej: CE 1.a)" value={formCE.code} onChange={e => setFormCE({ ...formCE, code: e.target.value })} />
            <textarea className="input" placeholder="Descripción" rows={3} value={formCE.description} onChange={e => setFormCE({ ...formCE, description: e.target.value })} />
            <select className="input" value={formCE.raId || ''} onChange={e => setFormCE({ ...formCE, raId: +e.target.value || null })}>
              <option value="">Seleccionar RA</option>
              {ras.map(r => <option key={r.id} value={r.id}>{r.code} — {r.description?.slice(0, 50)}</option>)}
            </select>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEditingCE(null)} className="btn btn-secondary">Cancelar</button>
              <button onClick={saveCE} className="btn btn-primary">Guardar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
