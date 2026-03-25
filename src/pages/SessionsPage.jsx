import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { updateLastSaved } from '../db';

export default function SessionsPage() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const sessions = useLiveQuery(() =>
    settings?.activeGroupId
      ? db.sessions.where('groupId').equals(settings.activeGroupId).reverse().sortBy('date')
      : []
  );

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', tasks: '', evidence: '', incidents: '', date: '', moduleId: null });

  const openNew = () => {
    setForm({ title: '', content: '', tasks: '', evidence: '', incidents: '', date: new Date().toISOString().slice(0, 10), moduleId: settings?.activeModuleId || null });
    setEditing({});
  };

  const save = async () => {
    const data = { ...form, groupId: settings.activeGroupId, moduleId: form.moduleId || settings?.activeModuleId };
    if (editing?.id) {
      await db.sessions.update(editing.id, data);
    } else {
      await db.sessions.add(data);
    }
    await updateLastSaved();
    setEditing(null);
  };

  const remove = async (id) => {
    await db.sessions.delete(id);
    await updateLastSaved();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Sesiones de Clase</h2>
        <button onClick={openNew} className="btn btn-primary text-sm"><Plus size={16} /> Nueva</button>
      </div>
      {(!sessions || sessions.length === 0) ? (
        <p className="text-[var(--color-text-muted)]">No hay sesiones registradas.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className="card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-[var(--color-text)]">{s.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{s.date}</p>
                  {s.content && <p className="text-sm mt-1 text-[var(--color-text-muted)]">{s.content.slice(0, 80)}…</p>}
                </div>
                <button onClick={() => remove(s.id)} className="btn btn-ghost text-red-500 p-1"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <Modal onClose={() => setEditing(null)} title={editing?.id ? 'Editar Sesión' : 'Nueva Sesión'}>
          <div className="space-y-3">
            <input className="input" placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <textarea className="input" placeholder="Contenido / descripción" rows={3} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            <textarea className="input" placeholder="Tareas realizadas" rows={2} value={form.tasks} onChange={e => setForm({ ...form, tasks: e.target.value })} />
            <textarea className="input" placeholder="Incidencias" rows={2} value={form.incidents} onChange={e => setForm({ ...form, incidents: e.target.value })} />
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEditing(null)} className="btn btn-secondary">Cancelar</button>
              <button onClick={save} className="btn btn-primary">Guardar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
