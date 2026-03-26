import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateLastSaved } from '../db';
import { Check, X, Clock, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import DonutChart from '../components/ui/DonutChart';
import Badge from '../components/ui/Badge';

const STATUS_CONFIG = {
  P: { label: 'Presente', color: 'bg-green-500', textColor: 'text-white', icon: Check },
  A: { label: 'Ausente', color: 'bg-red-500', textColor: 'text-white', icon: X },
  R: { label: 'Retraso', color: 'bg-amber-500', textColor: 'text-white', icon: Clock },
  J: { label: 'Justificado', color: 'bg-blue-500', textColor: 'text-white', icon: FileText },
};

export default function AttendancePage() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const students = useLiveQuery(() =>
    settings?.activeGroupId ? db.students.where('groupId').equals(settings.activeGroupId).sortBy('number') : []
  , [settings?.activeGroupId]);

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [marks, setMarks] = useState({});
  const [saved, setSaved] = useState(false);

  // Load existing attendance for this date+group
  const existing = useLiveQuery(async () => {
    if (!settings?.activeGroupId || !date) return [];
    return db.attendance.where({ date, studentId: db._students }).and(r =>
      students?.find(s => s.id === r.studentId)
    ).toArray();
  }, [date, settings?.activeGroupId]);

  // Pre-fill from existing
  React.useEffect(() => {
    if (existing && existing.length > 0) {
      const m = {};
      existing.forEach(r => { m[r.studentId] = r.status; });
      setMarks(m);
    } else {
      setMarks({});
    }
    setSaved(false);
  }, [existing, date]);

  const mark = (studentId, status) => {
    setMarks(prev => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const counts = Object.values(marks).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, { P: 0, A: 0, R: 0, J: 0 });

  const total = Object.values(marks).length;
  const presentPct = total > 0 ? Math.round((counts.P + counts.R) / total * 100) : 0;

  const saveSession = async () => {
    const sessionId = Date.now();
    // Delete existing for this date
    const toDelete = await db.attendance.filter(r => r.date === date && students?.find(s => s.id === r.studentId)).toArray();
    await Promise.all(toDelete.map(r => db.attendance.delete(r.id)));
    // Add new
    const rows = Object.entries(marks).map(([studentId, status]) => ({
      studentId: +studentId, date, status, sessionId,
      updatedAt: new Date().toISOString()
    }));
    if (rows.length > 0) await db.attendance.bulkAdd(rows);
    await updateLastSaved();
    setSaved(true);
  };

  const prevDay = () => {
    const d = new Date(date); d.setDate(d.getDate() - 1);
    setDate(d.toISOString().slice(0, 10));
  };
  const nextDay = () => {
    const d = new Date(date); d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
  };

  const isToday = date === today;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Asistencia</h2>
        {isToday && <Badge color="bg-green-100 text-green-800">Hoy</Badge>}
      </div>

      {/* Date picker */}
      <div className="card p-3">
        <div className="flex items-center justify-between">
          <button onClick={prevDay} className="btn btn-ghost p-2"><ChevronLeft size={18} /></button>
          <input type="date" className="input text-center font-medium" value={date} onChange={e => { setDate(e.target.value); setSaved(false); }} />
          <button onClick={nextDay} className="btn btn-ghost p-2"><ChevronRight size={18} /></button>
        </div>
        <p className="text-center text-xs text-[var(--color-text-muted)] mt-1">
          {new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Student list */}
      {(!students || students.length === 0) ? (
        <p className="text-[var(--color-text-muted)]">No hay alumnos en este grupo.</p>
      ) : (
        <div className="space-y-2">
          {students.map(s => {
            const current = marks[s.id];
            return (
              <div key={s.id} className="card p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-600">{s.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-text)] truncate">{s.name} {s.surname}</p>
                </div>
                <div className="flex gap-1">
                  {Object.entries(STATUS_CONFIG).map(([k, cfg]) => {
                    const Icon = cfg.icon;
                    const active = current === k;
                    return (
                      <button
                        key={k}
                        onClick={() => mark(s.id, k)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${active ? `${cfg.color} ${cfg.textColor} scale-110` : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                        title={cfg.label}
                      >
                        <Icon size={14} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary + Save */}
      {total > 0 && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 flex-shrink-0">
              <DonutChart data={counts} />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
                <div key={k} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${cfg.color}`} />
                  <span className="text-[var(--color-text-muted)]">{cfg.label}:</span>
                  <span className="font-semibold">{counts[k]}</span>
                </div>
              ))}
              <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                <span className="text-[var(--color-text-muted)]">Presentes: </span>
                <span className="font-bold text-primary">{presentPct}%</span>
              </div>
            </div>
          </div>
          <button onClick={saveSession} className={`btn w-full ${saved ? 'btn-secondary' : 'btn-primary'}`}>
            {saved ? '✓ Guardado' : 'Guardar parte'}
          </button>
        </div>
      )}
    </div>
  );
}
