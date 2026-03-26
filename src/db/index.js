import Dexie from 'dexie';
import { scheduleAutoSync } from '../lib/autoSync';

export const db = new Dexie('CuadernoAulaDB');

db.version(1).stores({
  students:        '++id, name, surname, number, email, groupId, birthDate, isRepeater, photo, pendingSubjects, observations, updatedAt',
  learningOutcomes: '++id, code, description, weight, moduleId, evaluation, updatedAt',
  criteria:         '++id, code, description, raId, updatedAt',
  instruments:      '++id, name, date, evaluation, weight, moduleId, groupId, type, counts, updatedAt',
  instrument_criteria: '++id, instrumentId, criterionId, updatedAt',
  grades:           '++id, studentId, instrumentId, criterionId, value, date, updatedAt',
  settings:         'id, schoolName, teacherName, course, activeModuleId, activeGroupId, logo, minGrade, maxGrade, decimals, darkMode, lastSaved, syncStatus, syncMessage, lastSyncedAt, updatedAt',
  attendance:       '++id, studentId, date, status, sessionId, updatedAt',
  sessions:         '++id, date, title, content, tasks, evidence, incidents, groupId, moduleId, updatedAt',
  units:            '++id, number, title, moduleId, updatedAt',
  modules:          '++id, code, name, examsWeight, projectsWeight, obsWeight, model, groupId, hours, color, shortName, updatedAt',
  groups:           '++id, name, stage, year, evalCount, updatedAt',
  suggestions:      '++id, content, category, date, moduleId, status, updatedAt',
  workplace_logs:   '++id, studentId, date, hours, activity, moduleId, updatedAt'
});

export const seedDatabase = async () => {
  const count = await db.groups.count();
  if (count > 0) return;

  const grpAId = await db.groups.add({ name: '1º CFGS – Carpintería', stage: 'Superior', year: 1, evalCount: 3 });
  const grpBId = await db.groups.add({ name: '2º CFGS – Carpintería', stage: 'Superior', year: 2, evalCount: 2 });

  const mod1Id = await db.modules.add({
    code: '0985', name: 'Prototipos en Carpintería y Mueble',
    examsWeight: 20, projectsWeight: 80, obsWeight: 0, model: 'weighted',
    groupId: grpAId, shortName: 'PMB', color: '#4F46E5'
  });
  const mod2Id = await db.modules.add({
    code: '0467', name: 'Mecanizado de Madera',
    examsWeight: 50, projectsWeight: 35, obsWeight: 15, model: 'weighted',
    groupId: grpBId, shortName: 'MEC', color: '#06b6d4'
  });
  const mod3Id = await db.modules.add({
    code: '0987', name: 'Automatización en Carpintería y Mueble',
    examsWeight: 30, projectsWeight: 70, obsWeight: 0, model: 'weighted',
    groupId: grpAId, shortName: 'ATZ', color: '#10b981'
  });

  await db.students.bulkAdd([
    { name: 'Francisco Javier', surname: 'García Montesdeoca', number: 1, email: 'fj.garcia@ies-analuisa.es', groupId: grpAId, birthDate: '1974-12-24', isRepeater: 0, photo: null, pendingSubjects: '', observations: '' },
    { name: 'Javier Ascanio', surname: 'Mederos', number: 2, email: 'j.ascanio@ies-analuisa.es', groupId: grpAId, birthDate: '2005-02-23', isRepeater: 0, photo: null, pendingSubjects: '', observations: '' },
    { name: 'Ashley Ester', surname: 'Doreste', number: 3, email: 'a.ester@ies-analuisa.es', groupId: grpAId, birthDate: '2006-10-04', isRepeater: 0, photo: null, pendingSubjects: '', observations: '' },
    { name: 'Estefanía', surname: 'Ruiz', number: 4, email: 'e.ruiz@ies-analuisa.es', groupId: grpAId, birthDate: '1987-05-12', isRepeater: 0, photo: null, pendingSubjects: '', observations: '' },
    { name: 'Francisco Aymar', surname: 'Sosa', number: 5, email: 'f.aymar@ies-analuisa.es', groupId: grpAId, birthDate: '1994-12-07', isRepeater: 0, photo: null, pendingSubjects: '', observations: '' },
    { name: 'Elena', surname: 'Blanco Vigil', number: 1, email: 'e.blanco@ies-analuisa.es', groupId: grpBId, birthDate: '1990-05-15', isRepeater: 0, photo: null, pendingSubjects: '', observations: '' },
    { name: 'Pedro', surname: 'Guerra Sol', number: 2, email: 'p.guerra@ies-analuisa.es', groupId: grpBId, birthDate: '2004-11-20', isRepeater: 0, photo: null, pendingSubjects: '', observations: '' },
  ]);

  const ra1 = await db.learningOutcomes.add({ code: 'RA 1', description: 'Recopila información técnica para la construcción de prototipos', weight: 15, moduleId: mod1Id, evaluation: '1' });
  const ra2 = await db.learningOutcomes.add({ code: 'RA 2', description: 'Programa la fabricación de prototipos', weight: 20, moduleId: mod1Id, evaluation: '1' });
  const ra3 = await db.learningOutcomes.add({ code: 'RA 3', description: 'Elabora piezas y componentes para prototipos', weight: 25, moduleId: mod1Id, evaluation: '2' });
  const ra4 = await db.learningOutcomes.add({ code: 'RA 4', description: 'Monta prototipos de muebles y elementos', weight: 20, moduleId: mod1Id, evaluation: '2' });
  const ra5 = await db.learningOutcomes.add({ code: 'RA 5', description: 'Evalúa prototipos, realizando ensayos y proponiendo mejoras', weight: 20, moduleId: mod1Id, evaluation: '3' });

  await db.criteria.bulkAdd([
    { code: 'CE 1.a', description: 'Identifica requerimientos técnicos de posibles clientes', raId: ra1 },
    { code: 'CE 1.b', description: 'Analiza planos de fabricación y órdenes de trabajo', raId: ra1 },
    { code: 'CE 2.a', description: 'Define la secuencia de operaciones de mecanizado', raId: ra2 },
    { code: 'CE 3.a', description: 'Acomete el mecanizado con herramientas manuales y maquinaria', raId: ra3 },
    { code: 'CE 4.a', description: 'Realiza el ensamblaje funcional del prototipo', raId: ra4 },
    { code: 'CE 5.a', description: 'Verifica la calidad y seguridad del producto final', raId: ra5 },
  ]);

  await db.units.bulkAdd([
    { number: 1, title: 'Recopilación de Información Técnica para Prototipos', moduleId: mod1Id },
    { number: 2, title: 'Programación de la Fabricación de Prototipos', moduleId: mod1Id },
    { number: 3, title: 'Elaboración de Piezas y Componentes para Prototipos', moduleId: mod1Id },
    { number: 4, title: 'Montaje de Prototipos de Muebles y Elementos', moduleId: mod1Id },
    { number: 5, title: 'Evaluación y Certificación de Prototipos', moduleId: mod1Id },
  ]);

  await db.settings.put({
    id: 1,
    schoolName: 'IES Ana Luisa Benítez',
    teacherName: 'Germán Medina Castellano',
    course: '2025/2026',
    activeModuleId: mod1Id,
    activeGroupId: grpAId,
    logo: null,
    minGrade: 0,
    maxGrade: 10,
    decimals: 2,
    darkMode: false,
    lastSaved: new Date().toISOString(),
    syncStatus: 'idle',
    syncMessage: 'Sin sincronizar',
    lastSyncedAt: null
  });
};

export const updateLastSaved = async () => {
  await db.settings.update(1, {
    lastSaved: new Date().toISOString(),
    syncStatus: 'pending',
    syncMessage: 'Cambios pendientes de sincronizar',
  });
  scheduleAutoSync();
};
