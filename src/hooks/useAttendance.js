import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { updateLastSaved } from '../db';

export function useAttendance(groupId, date) {
  const records = useLiveQuery(
    () => groupId
      ? db.attendance.where('date').equals(date || new Date().toISOString().split('T')[0]).and(r => {
          return db.students.where('id').equals(r.studentId).first().then(s => s && s.groupId === groupId);
        }).toArray()
      : [],
    [groupId, date]
  );

  const students = useLiveQuery(
    () => groupId ? db.students.where('groupId').equals(groupId).sortBy('number') : [],
    [groupId]
  );

  const mark = async (studentId, status) => {
    const d = date || new Date().toISOString().split('T')[0];
    const existing = await db.attendance.where({ studentId, date: d }).first();
    if (existing) {
      await db.attendance.update(existing.id, { status });
    } else {
      await db.attendance.add({ studentId, date: d, status });
    }
    updateLastSaved();
  };

  const getStatus = (studentId) => {
    if (!records) return null;
    const rec = records.find(r => r.studentId === studentId);
    return rec?.status || null;
  };

  return { students, records, mark, getStatus };
}
