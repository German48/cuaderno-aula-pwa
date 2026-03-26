import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import DonutChart from '../components/ui/DonutChart';

const STATUS_LABELS = {
  present: 'Presentes',
  absent: 'Ausentes',
  delayed: 'Retrasos',
  justified: 'Justificadas',
};

export default function AttendanceHistoryPage() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const attendance = useLiveQuery(() =>
    settings?.activeGroupId
      ? db.attendance.toArray().then(async records => {
          const students = await db.students.where('groupId').equals(settings.activeGroupId).toArray();
          const studentIds = new Set(students.map(s => s.id));
          return records.filter(r => studentIds.has(r.studentId));
        })
      : []
  , [settings?.activeGroupId]);

  const grouped = Object.values((attendance || []).reduce((acc, record) => {
    const key = record.sessionId ? `session-${record.sessionId}` : `date-${record.date}`;
    if (!acc[key]) {
      acc[key] = {
        key,
        sessionId: record.sessionId || null,
        date: record.date,
        counts: { present: 0, absent: 0, delayed: 0, justified: 0 },
      };
    }
    if (acc[key].counts[record.status] !== undefined) {
      acc[key].counts[record.status] += 1;
    }
    return acc;
  }, {})).sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-[var(--color-text)]">Historial de Asistencia</h2>
      {grouped.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">No hay partes de asistencia registrados para este grupo.</p>
      ) : (
        <div className="space-y-4">
          {grouped.map(item => {
            const chartData = Object.entries(item.counts)
              .filter(([, value]) => value > 0)
              .map(([name, value]) => ({ name, value }));

            return (
              <div key={item.key} className="card p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {item.sessionId ? `Sesión #${item.sessionId}` : 'Parte sin sesión enlazada'}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {item.date ? new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24">
                    <DonutChart data={chartData} centerLabel="parte" centerValue={chartData.reduce((s, x) => s + x.value, 0)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm flex-1">
                    {Object.entries(item.counts).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <span className="text-[var(--color-text-muted)]">{STATUS_LABELS[k] || k}:</span>
                        <span className="font-medium text-[var(--color-text)]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
