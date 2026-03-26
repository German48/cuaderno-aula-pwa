import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateLastSaved } from '../db';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import StatCard from '../components/ui/StatCard';
import { motion } from 'framer-motion';
import { Award, Plus, FileDown, Search } from 'lucide-react';
import { generateGradesPDF } from '../lib/pdf';

export default function GradesPage() {
  const settings = useLiveQuery(() => db.settings.get(1));
  const students = useLiveQuery(() =>
    settings?.activeGroupId ? db.students.where('groupId').equals(settings.activeGroupId).sortBy('number') : []
  , [settings?.activeGroupId]);
  const instruments = useLiveQuery(() =>
    settings?.activeModuleId ? db.instruments.where('moduleId').equals(settings.activeModuleId).toArray() : []
  , [settings?.activeModuleId]);
  const learningOutcomes = useLiveQuery(() =>
    settings?.activeModuleId ? db.learningOutcomes.where('moduleId').equals(settings.activeModuleId).toArray() : []
  , [settings?.activeModuleId]);
  const allGrades = useLiveQuery(() => db.grades.toArray(), []);
  const module = useLiveQuery(() =>
    settings?.activeModuleId ? db.modules.get(settings.activeModuleId) : null
  , [settings?.activeModuleId]);
  const group = useLiveQuery(() =>
    settings?.activeGroupId ? db.groups.get(settings.activeGroupId) : null
  , [settings?.activeGroupId]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [showAddInstrument, setShowAddInstrument] = useState(false);
  const [filterRA, setFilterRA] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [gradeForm, setGradeForm] = useState({ instrumentId: '', criterionId: '', value: '' });
  const [instrumentForm, setInstrumentForm] = useState({ name: '', date: '', type: 'exam', weight: '' });

  const criteria = useLiveQuery(() => db.criteria.toArray(), []);

  const filteredStudents = students?.filter(s => {
    if (!searchStudent) return true;
    return `${s.name} ${s.surname}`.toLowerCase().includes(searchStudent.toLowerCase());
  }) || [];

  const studentGrades = selectedStudent && allGrades
    ? allGrades.filter(g => g.studentId === selectedStudent.id)
    : [];

  const studentAvg = studentGrades.length
    ? (studentGrades.reduce((s, g) => s + g.value, 0) / studentGrades.length).toFixed(2)
    : null;

  const handleAddGrade = async (e) => {
    e.preventDefault();
    if (!gradeForm.value) return;
    await db.grades.add({
      studentId: selectedStudent.id,
      instrumentId: gradeForm.instrumentId ? parseInt(gradeForm.instrumentId) : null,
      criterionId: gradeForm.criterionId ? parseInt(gradeForm.criterionId) : null,
      value: parseFloat(gradeForm.value),
      date: new Date().toISOString(),
    });
    updateLastSaved();
    setShowAddGrade(false);
    setGradeForm({ instrumentId: '', criterionId: '', value: '' });
  };

  const handleAddInstrument = async (e) => {
    e.preventDefault();
    await db.instruments.add({
      name: instrumentForm.name,
      date: instrumentForm.date || new Date().toISOString().split('T')[0],
      type: instrumentForm.type,
      weight: parseFloat(instrumentForm.weight) || 0,
      moduleId: settings.activeModuleId,
      groupId: settings.activeGroupId,
      evaluation: '1',
      counts: true,
    });
    updateLastSaved();
    setShowAddInstrument(false);
    setInstrumentForm({ name: '', date: '', type: 'exam', weight: '' });
  };

  const exportPDF = () => {
    if (!students || !allGrades) return;
    generateGradesPDF(students, allGrades.filter(g =>
      students.some(s => s.id === g.studentId)
    ), module, group);
  };

  // Overall stats
  const allGroupGrades = allGrades?.filter(g => students?.some(s => s.id === g.studentId)) || [];
  const globalAvg = allGroupGrades.length
    ? (allGroupGrades.reduce((s, g) => s + g.value, 0) / allGroupGrades.length).toFixed(2)
    : '—';

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Calificaciones</h2>
        <div className="flex gap-2">
          <button className="btn btn-secondary text-xs py-1.5" onClick={() => setShowAddInstrument(true)}>
            <Plus size={14} /> Instrumento
          </button>
          <button className="btn btn-ghost text-xs py-1.5" onClick={exportPDF}>
            <FileDown size={14} /> PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Award} label="Media del grupo" value={globalAvg} color="#4F46E5" />
        <StatCard icon={Award} label="Instrumentos" value={instruments?.length || 0} color="#D97706" />
      </div>

      {/* Instrument filter */}
      {instruments?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Instrumentos</p>
          <div className="flex gap-2 flex-wrap">
            {instruments.map(i => (
              <button key={i.id}
                className="badge bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs px-3 py-1 cursor-pointer hover:border-indigo-300"
                onClick={() => setFilterRA(i.id.toString())}
              >
                {i.name}
              </button>
            ))}
            <button className="badge bg-slate-100 dark:bg-slate-700 text-xs px-2 py-1 cursor-pointer"
              onClick={() => setFilterRA('')}>
              Todos
            </button>
          </div>
        </div>
      )}

      {/* Student search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input className="input pl-9" placeholder="Buscar alumno..."
          value={searchStudent} onChange={e => setSearchStudent(e.target.value)} />
      </div>

      {/* Student grades table */}
      {!filteredStudents.length ? (
        <EmptyState icon={Award} title="Sin datos" description="No hay alumnos o calificaciones." />
      ) : (
        <div className="space-y-2">
          {filteredStudents.map(s => {
            const sg = allGrades?.filter(g => g.studentId === s.id && (!filterRA || g.instrumentId?.toString() === filterRA)) || [];
            const avg = sg.length ? (sg.reduce((a, g) => a + g.value, 0) / sg.length).toFixed(2) : '—';
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className={`card p-3 cursor-pointer border-2 transition-colors ${selectedStudent?.id === s.id ? 'border-indigo-400' : 'hover:border-slate-300'}`}
                onClick={() => setSelectedStudent(selectedStudent?.id === s.id ? null : s)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${s.name} ${s.surname}`} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{s.name} {s.surname}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{sg.length} nota(s)</p>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${avg !== '—' && parseFloat(avg) < 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {avg}
                  </span>
                </div>
                {selectedStudent?.id === s.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-[var(--color-border)]">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {sg.map(g => (
                        <Badge key={g.id} variant={g.value >= 5 ? 'success' : 'danger'} className="text-xs">
                          {parseFloat(g.value).toFixed(1)}
                        </Badge>
                      ))}
                    </div>
                    <button className="btn btn-primary text-xs w-full" onClick={(e) => { e.stopPropagation(); setShowAddGrade(true); }}>
                      + Añadir nota
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Grade Modal */}
      <Modal isOpen={showAddGrade} onClose={() => setShowAddGrade(false)} title={`Nota – ${selectedStudent?.name}`} size="sm">
        <form onSubmit={handleAddGrade} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Instrumento</label>
            <select className="input" value={gradeForm.instrumentId}
              onChange={e => setGradeForm({ ...gradeForm, instrumentId: e.target.value })}>
              <option value="">General</option>
              {instruments?.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Criterio</label>
            <select className="input" value={gradeForm.criterionId}
              onChange={e => setGradeForm({ ...gradeForm, criterionId: e.target.value })}>
              <option value="">—</option>
              {criteria?.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Valor (0-10)</label>
            <input className="input" type="number" step="0.01" min="0" max="10" value={gradeForm.value}
              onChange={e => setGradeForm({ ...gradeForm, value: e.target.value })} required />
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAddGrade(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary flex-1">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* Add Instrument Modal */}
      <Modal isOpen={showAddInstrument} onClose={() => setShowAddInstrument(false)} title="Nuevo Instrumento" size="sm">
        <form onSubmit={handleAddInstrument} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Nombre</label>
            <input className="input" value={instrumentForm.name}
              onChange={e => setInstrumentForm({ ...instrumentForm, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Fecha</label>
              <input className="input" type="date" value={instrumentForm.date}
                onChange={e => setInstrumentForm({ ...instrumentForm, date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Tipo</label>
              <select className="input" value={instrumentForm.type}
                onChange={e => setInstrumentForm({ ...instrumentForm, type: e.target.value })}>
                <option value="exam">Examen</option>
                <option value="project">Proyecto</option>
                <option value="task">Tarea</option>
                <option value="practice">Práctica</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Peso (%)</label>
            <input className="input" type="number" min="0" max="100" value={instrumentForm.weight}
              onChange={e => setInstrumentForm({ ...instrumentForm, weight: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAddInstrument(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary flex-1">Crear</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
