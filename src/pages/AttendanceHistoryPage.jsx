import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { PieChart } from 'lucide-react';
import DonutChart from '../components/ui/DonutChart';

export default function AttendanceHistoryPage() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const sessions = useLiveQuery(() =>
    settings?.activeGroupId
      ? db.attendance.where('sessionId').above(0).toArray()
      : []
  );

  const grouped = sessions?.reduce((acc, r) => {
    if (!acc[r.sessionId]) acc[r.sessionId] = { P: 0, A: 0, R: 0, J: 0 };
    if (acc[r.sessionId][r.status]) acc[r.sessionId][r.status]++;
    return acc;
  }, {}) || {};

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-[var(--color-text)]">Historial de Asistencia</h2>
      {Object.keys(grouped).length === 0 ? (
        <p className="text-[var(--color-text-muted)]">No hay sesiones registradas.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([sid, counts]) => (
            <div key={sid} className="card p-4">
              <p className="text-sm font-medium text-[var(--color-text)] mb-3">Sesión #{sid}</p>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24">
                  <DonutChart data={counts} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(counts).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <span className="text-[var(--color-text-muted)]">{k}:</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
