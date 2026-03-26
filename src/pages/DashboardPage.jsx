import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db, updateLastSaved } from '../db';
import StatCard from '../components/ui/StatCard';
import DonutChart from '../components/ui/DonutChart';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { Users, Award, ClipboardCheck, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const students = useLiveQuery(() =>
    settings?.activeGroupId ? db.students.where('groupId').equals(settings.activeGroupId).toArray() : []
  , [settings?.activeGroupId]);

  const grades = useLiveQuery(() =>
    settings?.activeGroupId
      ? db.students.where('groupId').equals(settings.activeGroupId).toArray()
          .then(ss => Promise.all(ss.map(s => db.grades.where('studentId').equals(s.id).toArray())))
          .then(arr => arr.flat())
      : []
  , [settings?.activeGroupId]);

  const attendance = useLiveQuery(() =>
    settings?.activeGroupId
      ? db.students.where('groupId').equals(settings.activeGroupId).toArray()
          .then(ss => {
            const today = new Date().toISOString().split('T')[0];
            return Promise.all(ss.map(s => db.attendance.where('studentId').equals(s.id).toArray()));
          })
          .then(arr => arr.flat())
      : []
  , [settings?.activeGroupId]);

  const sessions = useLiveQuery(() =>
    settings?.activeGroupId ? db.sessions.where('groupId').equals(settings.activeGroupId).toArray() : []
  , [settings?.activeGroupId]);

  const group = useLiveQuery(() =>
    settings?.activeGroupId ? db.groups.get(settings.activeGroupId) : null
  , [settings?.activeGroupId]);
  const module = useLiveQuery(() =>
    settings?.activeModuleId ? db.modules.get(settings.activeModuleId) : null
  , [settings?.activeModuleId]);

  const totalStudents = students?.length || 0;
  const avgGrade = grades?.length
    ? (grades.reduce((s, g) => s + g.value, 0) / grades.length).toFixed(2)
    : '—';
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance?.filter(r => r.date === today) || [];
  const presentToday = todayAttendance.filter(r => r.status === 'present').length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

  const donutData = [
    { name: 'Presente', value: presentToday },
    { name: 'Ausente', value: totalStudents - presentToday },
  ];

  const lastSession = sessions?.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return (
    <div className="p-4 space-y-5">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          Hola, {settings?.teacherName?.split(' ')[0] || 'Profesor'}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          {group?.name} · {module?.name}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users} label="Alumnos" value={totalStudents} color="#4F46E5" />
        <StatCard icon={Award} label="Media Global" value={avgGrade} color="#D97706" sublabel={module?.shortName} />
        <StatCard
          icon={ClipboardCheck}
          label="Asistencia Hoy"
          value={`${attendanceRate}%`}
          color="#059669"
        />
        <StatCard
          icon={Calendar}
          label="Sesiones"
          value={sessions?.length || 0}
          color="#06b6d4"
        />
      </div>

      {/* Attendance Donut */}
      {totalStudents > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-4 flex items-center gap-6">
          <DonutChart data={donutData} centerValue={`${attendanceRate}%`} centerLabel="hoy" size={110} />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-sm text-[var(--color-text)]">Presentes: {presentToday}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="text-sm text-[var(--color-text)]">Ausentes: {totalStudents - presentToday}</span>
            </div>
            <Link to="/attendance" className="btn btn-ghost text-xs mt-2 p-1.5">
              Pasar asistencia <ChevronRight size={12} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Last Session */}
      {lastSession && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-indigo-500" />
            <h3 className="font-semibold text-sm text-[var(--color-text)]">Última Sesión</h3>
          </div>
          <p className="text-sm font-medium text-[var(--color-text)]">{lastSession.title}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{new Date(lastSession.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          {lastSession.tasks && <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">{lastSession.tasks}</p>}
        </motion.div>
      )}

      {/* Student list preview */}
      {students && students.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-[var(--color-text)]">Alumnos del grupo</h3>
            <Link to="/students" className="text-xs text-indigo-500 hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {students.slice(0, 5).map(s => (
              <Link key={s.id} to={`/students/${s.id}`}
                className="card p-3 flex items-center gap-3 hover:border-indigo-200 transition-colors">
                <Avatar name={`${s.name} ${s.surname}`} photo={s.photo} size="sm" hoverZoom />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{s.name} {s.surname}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">#{s.number}</p>
                </div>
                {s.isRepeater ? <Badge variant="warning">R</Badge> : null}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Last saved */}
      {settings?.lastSaved && (
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Guardado: {new Date(settings.lastSaved).toLocaleString('es-ES')}
        </p>
      )}
    </div>
  );
}
