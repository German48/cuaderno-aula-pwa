-- Supabase schema base para Cuaderno de Aula PWA
-- Ejecutar en el SQL Editor de Supabase

create table if not exists groups (
  id bigint primary key,
  name text,
  stage text,
  year integer,
  evalCount integer
);

create table if not exists modules (
  id bigint primary key,
  code text,
  name text,
  shortName text,
  color text,
  examsWeight numeric,
  projectsWeight numeric,
  obsWeight numeric,
  groupId bigint
);

create table if not exists students (
  id bigint primary key,
  groupId bigint,
  number integer,
  name text,
  surname text,
  email text,
  birthDate text,
  isRepeater integer,
  photo text,
  pendingSubjects text,
  observations text
);

create table if not exists learningOutcomes (
  id bigint primary key,
  code text,
  description text,
  weight numeric,
  evaluation text,
  moduleId bigint
);

create table if not exists criteria (
  id bigint primary key,
  code text,
  description text,
  raId bigint
);

create table if not exists instruments (
  id bigint primary key,
  name text,
  type text,
  weight numeric,
  moduleId bigint,
  evaluation text,
  notes text
);

create table if not exists instrument_criteria (
  id bigint primary key,
  instrumentId bigint,
  criterionId bigint
);

create table if not exists grades (
  id bigint primary key,
  studentId bigint,
  moduleId bigint,
  instrumentId bigint,
  date text,
  value numeric,
  notes text
);

create table if not exists attendance (
  id bigint primary key,
  studentId bigint,
  date text,
  status text,
  notes text,
  sessionId bigint
);

create table if not exists sessions (
  id bigint primary key,
  title text,
  content text,
  tasks text,
  evidence text,
  incidents text,
  date text,
  moduleId bigint,
  groupId bigint
);

create table if not exists units (
  id bigint primary key,
  number integer,
  title text,
  moduleId bigint
);

create table if not exists suggestions (
  id bigint primary key,
  content text,
  category text,
  moduleId bigint,
  status text,
  date text
);

create table if not exists workplace_logs (
  id bigint primary key,
  studentId bigint,
  date text,
  hours numeric,
  activity text,
  moduleId bigint
);

create table if not exists settings (
  id bigint primary key,
  schoolName text,
  teacherName text,
  course text,
  activeModuleId bigint,
  activeGroupId bigint,
  logo text,
  minGrade numeric,
  maxGrade numeric,
  decimals integer,
  darkMode boolean,
  lastSaved text
);

create index if not exists idx_students_groupId on students(groupId);
create index if not exists idx_modules_groupId on modules(groupId);
create index if not exists idx_learningOutcomes_moduleId on learningOutcomes(moduleId);
create index if not exists idx_criteria_raId on criteria(raId);
create index if not exists idx_instruments_moduleId on instruments(moduleId);
create index if not exists idx_grades_studentId on grades(studentId);
create index if not exists idx_grades_moduleId on grades(moduleId);
create index if not exists idx_attendance_studentId on attendance(studentId);
create index if not exists idx_attendance_sessionId on attendance(sessionId);
create index if not exists idx_sessions_groupId on sessions(groupId);
create index if not exists idx_units_moduleId on units(moduleId);
create index if not exists idx_workplace_logs_studentId on workplace_logs(studentId);
