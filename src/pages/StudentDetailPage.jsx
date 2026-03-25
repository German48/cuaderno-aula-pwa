import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateLastSaved } from '../db';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit2, Trash2, Award, ClipboardCheck,
  Calendar, BookOpen, Save
} from 'lucide-react';
import { generateGradesPDF } from '../lib/pdf';

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const numId = parseInt(id);

  const student = useLiveQuery(() => db.students.get(numId), [numId]);
  const grades = useLiveQuery(() => db.grades.where('studentId').equals(numId).toArray(), [numId]);
  const attendance = useLiveQuery(() => db.attendance.where('studentId').equals(numId).toArray(), [numId]);
  const workplace = useLiveQuery(() => db.workplace_logs.where('studentId').equals(numId).toArray(), [numId]);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [activeTab, setActiveTab] = useState('grades');

  if (!student) return (
    <div className="p-4">
      <EmptyState icon={BookOpen} title="Alumno no encontrado" action={
        <Link to="/students" className="btn btn-primary">Volver</Link>
      } />
    </div>
  );

  const startEdit = () => {
    setForm({ ...student });
    setEditMode(true);
  };

  const saveEdit = async () => {
    await db.students.update(student.id, form);
    updateLastSaved();
    setEditMode(false);
  };

  const avgGrade = grades?.length ? (grades.reduce((s, g) => s + g.value, 0) / grades.length).toFixed(2) : '—';
  const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
  const absentCount = attendance?.filter(a => a.status === 'absent').length || 0;
  const totalHours = workplace?.reduce((s, w) => s + (w.hours || 0), 0) || 0;

  const tabs = [
    { key: 'grades', label: 'Notas', icon: Award },
    { key: 'attendance', label: 'Asistencia', icon: ClipboardCheck },
    { key: 'workplace', label: 'Taller/FCT', icon: Calendar },
    { key: 'info', label: 'Datos', icon: BookOpen },
  ];

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-[var(--color-bg)] z-10 px-4 py-3 flex items-center gap-3 border-b border-[var(--color-border)]">
        <button onClick={() => navigate(-1)} className="btn btn-ghost p-1.5">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <Avatar name={`${student.name} ${student.surname}`} photo={student.photo} size="md" />
          <div>
            <h2 className="font-bold text-[var(--color-text)]">{student.name} {student.surname}</h2>
            <p className="text-xs text-[var(--color-text-muted)]">#{student.number}</p>
          </div>
        </div>
        <button onClick={startEdit} className="btn btn-ghost p-1.5">
          <Edit2 size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <StatCard icon={Award} label="Media" value={avgGrade} color="#4F46E5" />
        <StatCard icon={ClipboardCheck} label="Presencias" value={presentCount} color="#059669" />
        <StatCard icon={Calendar} label="Horas taller" value={totalHours} color="#06b6d4" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] px-4">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-[var(--color-text-muted)]'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === 'grades' && <GradesTab grades={grades} studentId={numId} />}
        {activeTab === 'attendance' && <AttendanceTab records={attendance} />}
        {activeTab === 'workplace' && <WorkplaceTab logs={workplace} studentId={numId} />}
        {activeTab === 'info' && <InfoTab student={student} />}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editMode} onClose={() => setEditMode(false)} title="Editar Alumno" size="md">
        {form && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Nombre</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Apellidos</label>
                <input className="input" value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Fecha nacimiento</label>
              <input className="input" type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Asignaturas pendientes</label>
              <input className="input" value={form.pendingSubjects} onChange={e => setForm({ ...form, pendingSubjects: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Observaciones</label>
              <textarea className="input" rows={2} value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="repeater" checked={form.isRepeater} onChange={e => setForm({ ...form, isRepeater: e.target.checked ? 1 : 0 })} />
              <label htmlFor="repeater" className="text-sm text-[var(--color-text)]">Repetidor</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="btn btn-secondary flex-1" onClick={() => setEditMode(false)}>Cancelar</button>
              <button className="btn btn-primary flex-1" onClick={saveEdit}><Save size={14} /> Guardar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function GradesTab({ grades, studentId }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ instrumentId: null, criterionId: null, value: '' });

  const instruments = useLiveQuery(() => db.instruments.toArray(), []);
  const criteria = useLiveQuery(() => db.criteria.toArray(), []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.value) return;
    await db.grades.add({
      studentId,
      instrumentId: form.instrumentId ? parseInt(form.instrumentId) : null,
      criterionId: form.criterionId ? parseInt(form.criterionId) : null,
      value: parseFloat(form.value),
      date: new Date().toISOString(),
    });
    updateLastSaved();
    setShowAdd(false);
  };

  if (!grades?.length) return (
    <EmptyState icon={Award} title="Sin calificaciones"
      description="Este alumno aún no tiene notas registradas."
      action={<button className="btn btn-primary text-sm" onClick={() => setShowAdd(true)}>Añadir nota</button>}
    />
  );

  return (
    <div className="space-y-3">
      {grades.map(g => (
        <div key={g.id} className="card p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">
              {g.criterionId ? `CE ID:${g.criterionId}` : g.instrumentId ? `Instrumento ID:${g.instrumentId}` : 'Nota general'}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">{new Date(g.date).toLocaleDateString('es-ES')}</p>
          </div>
          <span className={`text-lg font-bold ${g.value >= 5 ? 'text-emerald-600' : 'text-red-500'}`}>
            {parseFloat(g.value).toFixed(2)}
          </span>
        </div>
      ))}
      <button className="btn btn-primary w-full" onClick={() => setShowAdd(true)}>+ Añadir nota</button>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Añadir Nota" size="sm">
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Instrumento</label>
            <select className="input" onChange={e => setForm({ ...form, instrumentId: e.target.value })}>
              <option value="">General</option>
              {instruments?.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Criterio</label>
            <select className="input" onChange={e => setForm({ ...form, criterionId: e.target.value })}>
              <option value="">—</option>
              {criteria?.map(c => <option key={c.id} value={c.id}>{c.code} – {c.description}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Valor (0-10)</label>
            <input className="input" type="number" step="0.01" min="0" max="10" value={form.value}
              onChange={e => setForm({ ...form, value: e.target.value })} required />
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary flex-1">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function AttendanceTab({ records }) {
  const statusLabels = { present: 'Presente', absent: 'Ausente', delayed: 'Retraso', justified: 'Justificado' };
  const statusVariants = { present: 'success', absent: 'danger', delayed: 'warning', justified: 'info' };

  if (!records?.length) return <EmptyState icon={ClipboardCheck} title="Sin registros" description="No hay partes de asistencia para este alumno." />;

  return (
    <div className="space-y-2">
      {records.sort((a, b) => new Date(b.date) - new Date(a.date)).map(r => (
        <div key={r.id} className="card p-3 flex items-center justify-between">
          <p className="text-sm text-[var(--color-text)]">{new Date(r.date).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}</p>
          <Badge variant={statusVariants[r.status] || 'default'}>{statusLabels[r.status] || r.status}</Badge>
        </div>
      ))}
    </div>
  );
}

function WorkplaceTab({ logs, studentId }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: '', hours: '', activity: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    await db.workplace_logs.add({
      studentId,
      date: form.date || new Date().toISOString().split('T')[0],
      hours: parseFloat(form.hours) || 0,
      activity: form.activity,
      moduleId: null,
    });
    updateLastSaved();
    setShowAdd(false);
  };

  const totalHours = logs?.reduce((s, w) => s + (w.hours || 0), 0) || 0;

  return (
    <div className="space-y-3">
      <div className="card p-3 text-center">
        <p className="text-2xl font-bold text-indigo-600">{totalHours}h</p>
        <p className="text-xs text-[var(--color-text-muted)]">Total horas registradas</p>
      </div>
      {logs?.map(w => (
        <div key={w.id} className="card p-3">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-[var(--color-text)]">{w.activity || 'Actividad'}</p>
            <span className="text-sm font-bold text-indigo-600">{w.hours}h</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">{new Date(w.date).toLocaleDateString('es-ES')}</p>
        </div>
      ))}
      <button className="btn btn-primary w-full" onClick={() => setShowAdd(true)}>+ Registrar horas</button>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Registrar Horas" size="sm">
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Fecha</label>
            <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Horas</label>
            <input className="input" type="number" step="0.5" min="0" value={form.hours}
              onChange={e => setForm({ ...form, hours: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Actividad</label>
            <input className="input" value={form.activity} placeholder="ej: Mecanizado de piezas"
              onChange={e => setForm({ ...form, activity: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary flex-1">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function InfoTab({ student }) {
  return (
    <div className="space-y-3">
      {[
        { label: 'Email', value: student.email },
        { label: 'Fecha nacimiento', value: student.birthDate ? new Date(student.birthDate).toLocaleDateString('es-ES') : '—' },
        { label: 'Asignaturas pendientes', value: student.pendingSubjects || 'Ninguna' },
        { label: 'Observaciones', value: student.observations || 'Sin observaciones' },
      ].map(({ label, value }) => (
        <div key={label} className="card p-3">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
          <p className="text-sm text-[var(--color-text)]">{value}</p>
        </div>
      ))}
      <div className="card p-3">
        <p className="text-xs text-[var(--color-text-muted)] mb-1">Repetidor</p>
        <Badge variant={student.isRepeater ? 'warning' : 'success'}>{student.isRepeater ? 'Sí' : 'No'}</Badge>
      </div>
    </div>
  );
}
