import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateLastSaved } from '../db';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { motion } from 'framer-motion';
import { Search, UserPlus, Users, LayoutGrid, ImagePlus } from 'lucide-react';

export default function StudentsPage() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const students = useLiveQuery(() =>
    settings?.activeGroupId ? db.students.where('groupId').equals(settings.activeGroupId).sortBy('number') : []
  , [settings?.activeGroupId]);

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const [form, setForm] = useState({ name: '', surname: '', number: '', email: '', birthDate: '' });
  const [adding, setAdding] = useState(false);

  const filtered = students?.filter(s => {
    const q = search.toLowerCase();
    return `${s.name} ${s.surname}`.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  }) || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!settings?.activeGroupId) {
      alert('No hay un grupo activo seleccionado.');
      return;
    }
    if (!form.name.trim() || !form.surname.trim()) {
      alert('Nombre y apellidos son obligatorios.');
      return;
    }

    const nextNumber = form.number
      ? parseInt(form.number, 10)
      : Math.max(0, ...(students?.map(s => Number(s.number) || 0) || [])) + 1;

    setAdding(true);
    try {
      await db.students.add({
        ...form,
        name: form.name.trim(),
        surname: form.surname.trim(),
        email: form.email.trim(),
        number: nextNumber,
        groupId: settings.activeGroupId,
        isRepeater: 0,
        photo: null,
        pendingSubjects: '',
        observations: '',
        updatedAt: new Date().toISOString(),
      });
      await updateLastSaved();
      setForm({ name: '', surname: '', number: '', email: '', birthDate: '' });
      setShowAdd(false);
    } finally {
      setAdding(false);
    }
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
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Alumnos</h2>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary text-sm py-1.5" onClick={() => setShowBoard(v => !v)}>
            <LayoutGrid size={16} /> {showBoard ? 'Lista' : 'Orla'}
          </button>
          <button className="btn btn-primary text-sm py-1.5" onClick={() => setShowAdd(true)}>
            <UserPlus size={16} /> Añadir
          </button>
        </div>
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

      {/* List / Board */}
      {!filtered.length ? (
        <EmptyState icon={Users} title="Sin alumnos" description="Añade alumnos a este grupo para comenzar." />
      ) : showBoard ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((student, i) => (
            <motion.div key={student.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <StudentCard student={student} />
            </motion.div>
          ))}
        </div>
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
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required name="student-name" autoFocus />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Apellidos</label>
              <input className="input" value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} required name="student-surname" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Número</label>
              <input className="input" type="number" min="1" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} name="student-number" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Fecha nacimiento</label>
              <input className="input" type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} name="student-birthdate" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} name="student-email" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary flex-1" disabled={adding}>{adding ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function StudentCard({ student }) {
  const fileInputRef = useRef(null);

  const handlePhotoSelected = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await db.students.update(student.id, { photo: reader.result });
      await updateLastSaved();
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className={`card p-4 flex flex-col items-center text-center gap-3 hover:shadow-lg transition-shadow relative ${student.photo ? '' : 'ring-2 ring-amber-300 bg-amber-50/40 dark:bg-amber-900/10'}`}>
      <Link to={`/students/${student.id}`} className="flex flex-col items-center text-center gap-3 w-full">
        <Avatar name={`${student.name} ${student.surname}`} photo={student.photo} size="xl" hoverZoom />
        <div className="min-w-0 w-full">
          <p className="text-sm font-semibold text-[var(--color-text)] leading-tight">{student.name} {student.surname}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">N.º {student.number}</p>
          {!student.photo ? <p className="text-[11px] font-medium text-amber-600 mt-1">Sin foto</p> : null}
        </div>
      </Link>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelected} />
      <button
        type="button"
        className="btn btn-secondary text-xs py-1 px-2 w-full"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}
      >
        <ImagePlus size={14} /> {student.photo ? 'Cambiar foto' : 'Añadir foto'}
      </button>
    </div>
  );
}

function StudentRow({ student, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="card p-3 flex items-center gap-3">
      <Link to={`/students/${student.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar name={`${student.name} ${student.surname}`} photo={student.photo} size="md" hoverZoom />
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
