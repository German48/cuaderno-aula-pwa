import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateLastSaved } from '../db';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { motion } from 'framer-motion';
import { Search, UserPlus, Users } from 'lucide-react';

export default function StudentsPage() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const students = useLiveQuery(() =>
    settings?.activeGroupId ? db.students.where('groupId').equals(settings.activeGroupId).sortBy('number') : []
  , [settings?.activeGroupId]);

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', surname: '', number: '', email: '', birthDate: '' });
  const [adding, setAdding] = useState(false);

  const filtered = students?.filter(s => {
    const q = search.toLowerCase();
    return `${s.name} ${s.surname}`.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  }) || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.surname) return;
    setAdding(true);
    await db.students.add({
      ...form,
      number: parseInt(form.number) || students?.length + 1,
      groupId: settings.activeGroupId,
      isRepeater: 0,
      photo: null,
      pendingSubjects: '',
      observations: '',
    });
    updateLastSaved();
    setForm({ name: '', surname: '', number: '', email: '', birthDate: '' });
    setShowAdd(false);
    setAdding(false);
  };

  const handleDelete = async (id) => {
    await db.students.delete(id);
    await db.grades.where('studentId').equals(id).delete();
    await db.attendance.where('studentId').equals(id).delete();
    await db.workplace_logs.where('studentId').equals(id).delete();
    updateLastSaved();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Alumnos</h2>
        <button className="btn btn-primary text-sm py-1.5" onClick={() => setShowAdd(true)}>
          <UserPlus size={16} /> Añadir
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          className="input pl-9"
          placeholder="Buscar alumno..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {!filtered.length ? (
        <EmptyState icon={Users} title="Sin alumnos" description="Añade alumnos a este grupo para comenzar." />
      ) : (
        <div className="space-y-2">
          {filtered.map((student, i) => (
            <motion.div key={student.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <StudentRow student={student} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Añadir Alumno" size="md">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Nombre</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Apellidos</label>
              <input className="input" value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Número</label>
              <input className="input" type="number" min="1" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Fecha nacimiento</label>
              <input className="input" type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary flex-1" disabled={adding}>Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function StudentRow({ student, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const { Link } = require('react-router-dom');

  return (
    <div className="card p-3 flex items-center gap-3">
      <Link to={`/students/${student.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar name={`${student.name} ${student.surname}`} photo={student.photo} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text)] truncate">{student.name} {student.surname}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{student.email}</p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        {student.isRepeater ? <Badge variant="warning">Repetidor</Badge> : null}
        <div className="relative">
          <button className="btn btn-ghost p-1.5 text-sm" onClick={() => setShowMenu(!showMenu)}>⋮</button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-20 min-w-[120px] py-1">
              <Link to={`/students/${student.id}`} className="block px-4 py-2 text-sm hover:bg-[var(--color-bg)] text-[var(--color-text)]">
                Ver detalle
              </Link>
              <button onClick={() => { onDelete(student.id); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
