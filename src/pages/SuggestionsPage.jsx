import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateLastSaved } from '../db';
import { Plus, Trash2, Edit2, Lightbulb } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

const CATEGORIES = ['Metodología', 'Recursos', 'Pedagógica', 'Organización', 'Otro'];
const STATUSES = { pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800' }, implemented: { label: 'Implementada', color: 'bg-green-100 text-green-800' }, rejected: { label: 'Descartada', color: 'bg-slate-100 text-slate-600' } };

export default function SuggestionsPage() {
  const suggestions = useLiveQuery(() => db.suggestions.toArray()) || [];
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ content: '', category: 'Metodología', moduleId: null, status: 'pending' });

  const openNew = () => {
    setForm({ content: '', category: 'Metodología', moduleId: null, status: 'pending' });
    setEditing({});
  };

  const openEdit = (suggestion) => {
    setForm({ content: suggestion.content ?? '', category: suggestion.category ?? 'Metodología', moduleId: suggestion.moduleId ?? null, status: suggestion.status ?? 'pending' });
    setEditing({ id: suggestion.id });
  };

  const handleSave = async () => {
    if (!form.content.trim()) {
      alert('El contenido de la sugerencia no puede estar vacío.');
      return;
    }
    if (editing?.id) {
      await db.suggestions.update(editing.id, form);
    } else {
      await db.suggestions.add({ ...form, date: new Date().toISOString() });
    }
    await updateLastSaved();
    setEditing(null);
  };

  const remove = async (id) => { await db.suggestions.delete(id); await updateLastSaved(); };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Sugerencias</h2>
        <button onClick={openNew} className="btn btn-primary text-sm"><Plus size={14} /> Nueva</button>
      </div>
      {suggestions.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">No hay sugerencias.</p>
      ) : (
        <div className="space-y-3">
          {suggestions.map(s => {
            const st = STATUSES[s.status] || STATUSES.pending;
            return (
              <div key={s.id} className="card p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`badge ${st.color}`}>{st.label}</span>
                      <span className="badge bg-slate-100 text-slate-600">{s.category}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text)]">{s.content}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{new Date(s.date).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <button onClick={() => openEdit(s)} className="btn btn-ghost p-1" title="Editar"><Edit2 size={14} /></button>
                    <button onClick={() => remove(s.id)} className="btn btn-ghost text-red-500 p-1" title="Eliminar"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {editing !== null && (
        <Modal isOpen={true} onClose={() => setEditing(null)} title={editing?.id ? 'Editar Sugerencia' : 'Nueva Sugerencia'}>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <textarea className="input" placeholder="Contenido de la sugerencia... *" rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} name="suggestion-content" autoFocus />
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} name="suggestion-category">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} name="suggestion-status">
              {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
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
