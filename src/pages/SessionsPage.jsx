import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateLastSaved } from '../db';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/ui/Modal';

export default function SessionsPage() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const sessions = useLiveQuery(() =>
    settings?.activeGroupId
      ? db.sessions.where('groupId').equals(settings.activeGroupId).reverse().sortBy('date')
      : []
  );

  const [editing, setEditing] = useState(null); // null = closed, {} = new, { id } = editing existing
  const [form, setForm] = useState({ title: '', content: '', tasks: '', evidence: '', incidents: '', date: '', moduleId: null });

  const openNew = () => {
    setForm({ title: '', content: '', tasks: '', evidence: '', incidents: '', date: new Date().toISOString().slice(0, 10), moduleId: settings?.activeModuleId || null });
    setEditing({});
  };

  const openEdit = (session) => {
    setForm({ title: session.title ?? '', content: session.content ?? '', tasks: session.tasks ?? '', evidence: session.evidence ?? '', incidents: session.incidents ?? '', date: session.date ?? '', moduleId: session.moduleId ?? null });
    setEditing({ id: session.id });
  };

  const handleSave = async () => {
    if (!settings?.activeGroupId) {
      alert('No hay un grupo activo. Ve a Configuración y selecciona un grupo.');
      return;
    }
    if (!form.title.trim()) {
      alert('El título es obligatorio.');
      return;
    }
    const data = { ...form, groupId: settings.activeGroupId, moduleId: form.moduleId || settings?.activeModuleId, updatedAt: new Date().toISOString() };
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
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--color-text)]">{s.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{s.date}</p>
                  {s.content && <p className="text-sm mt-1 text-[var(--color-text-muted)] truncate">{s.content.slice(0, 80)}{s.content.length > 80 ? '…' : ''}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  <button onClick={() => openEdit(s)} className="btn btn-ghost p-1" title="Editar"><Edit2 size={14} /></button>
                  <button onClick={() => remove(s.id)} className="btn btn-ghost text-red-500 p-1" title="Eliminar"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <Modal isOpen={true} onClose={() => setEditing(null)} title={editing?.id ? 'Editar Sesión' : 'Nueva Sesión'}>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <input className="input" placeholder="Título *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} name="session-title" autoFocus />
            <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} name="session-date" />
            <textarea className="input" placeholder="Contenido / descripción" rows={3} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} name="session-content" />
            <textarea className="input" placeholder="Tareas realizadas" rows={2} value={form.tasks} onChange={e => setForm({ ...form, tasks: e.target.value })} name="session-tasks" />
            <textarea className="input" placeholder="Incidencias" rows={2} value={form.incidents} onChange={e => setForm({ ...form, incidents: e.target.value })} name="session-incidents" />
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn btn-secondary">Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
