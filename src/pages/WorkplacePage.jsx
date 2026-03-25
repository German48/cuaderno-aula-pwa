import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateLastSaved } from '../db';
import { Plus, Trash2, Clock, Wrench } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';

export default function WorkplacePage() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const students = useLiveQuery(() =>
    settings?.activeGroupId ? db.students.where('groupId').equals(settings.activeGroupId).sortBy('number') : []
  );
  const logs = useLiveQuery(() => db.workplace_logs.toArray()) || [];
  const module = useLiveQuery(() => settings?.activeModuleId ? db.modules.get(settings.activeModuleId) : null);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ studentId: null, date: '', hours: 0, activity: '' });
  const GOAL_HOURS = 160; // configurable target

  const studentHours = {};
  students?.forEach(s => { studentHours[s.id] = 0; });
  logs.forEach(l => {
    if (studentHours[l.studentId] !== undefined) studentHours[l.studentId] += l.hours || 0;
  });

  const openAdd = (studentId = null) => {
    setForm({ studentId: studentId || students?.[0]?.id || null, date: new Date().toISOString().slice(0, 10), hours: 8, activity: '' });
    setEditing({});
  };

  const save = async () => {
    if (!form.studentId) return;
    await db.workplace_logs.add({
      studentId: +form.studentId,
      date: form.date,
      hours: +form.hours,
      activity: form.activity,
      moduleId: settings?.activeModuleId || null
    });
    await updateLastSaved();
    setEditing(null);
  };

  const remove = async (id) => { await db.workplace_logs.delete(id); await updateLastSaved(); };

  const studentLogs = (id) => logs.filter(l => l.studentId === id).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Taller / FCT</h2>
        <button onClick={() => openAdd()} className="btn btn-primary text-sm"><Plus size={14} /> Registrar horas</button>
      </div>

      <div className="card p-3 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          <Wrench size={14} className="inline mr-1" />
          Objetivo: <strong>{GOAL_HOURS}h</strong> · Módulo activo: <strong>{module?.shortName || 'Sin módulo'}</strong>
        </p>
      </div>

      {!students?.length ? (
        <p className="text-[var(--color-text-muted)]">No hay alumnos en el grupo activo.</p>
      ) : (
        <div className="space-y-4">
          {students.map(s => {
            const total = studentHours[s.id] || 0;
            const pct = Math.min(Math.round((total / GOAL_HOURS) * 100), 100);
            const isComplete = pct >= 100;
            return (
              <div key={s.id} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={`${s.name} ${s.surname}`} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-text)] truncate">{s.name} {s.surname}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{total}h registradas · {pct}%</p>
                  </div>
                  <button onClick={() => openAdd(s.id)} className="btn btn-ghost text-xs">+ Hora</button>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                  <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: isComplete ? '#059669' : s.isRepeater ? '#D97706' : '#4F46E5' }} />
                </div>
                {studentLogs(s.id).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {studentLogs(s.id).slice(0, 3).map(l => (
                      <div key={l.id} className="flex items-center justify-between text-xs">
                        <span className="text-[var(--color-text-muted)]">{l.date} · {l.activity || '—'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{l.hours}h</span>
                          <button onClick={() => remove(l.id)} className="text-red-400 hover:text-red-600"><Trash2 size={10} /></button>
                        </div>
                      </div>
                    ))}
                    {studentLogs(s.id).length > 3 && (
                      <p className="text-xs text-[var(--color-text-muted)] text-center">+ {studentLogs(s.id).length - 3} más</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing !== null && (
        <Modal onClose={() => setEditing(null)} title="Registrar horas">
          <div className="space-y-3">
            <select className="input" value={form.studentId || ''} onChange={e => setForm({ ...form, studentId: +e.target.value })}>
              <option value="">Seleccionar alumno</option>
              {students?.map(s => <option key={s.id} value={s.id}>{s.name} {s.surname}</option>)}
            </select>
            <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <input className="input" type="number" min="1" max="12" placeholder="Horas" value={form.hours} onChange={e => setForm({ ...form, hours: +e.target.value })} />
            <input className="input" placeholder="Actividad (ej: Mecanizado CNC)" value={form.activity} onChange={e => setForm({ ...form, activity: e.target.value })} />
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
