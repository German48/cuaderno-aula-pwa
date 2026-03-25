# SPEC.md — Cuaderno de Aula PWA

## 1. Concept & Vision

**Cuaderno de Aula** es una PWA para la gestión daily del aula en FP (Fabricación e Instalación de Carpintería y Mueble). Diseñada para funcionar 100% offline, permite gestionar estudiantes, asistencia, calificaciones por Resultados de Aprendizaje (RA), partes de taller y exportación de informes. Está pensada para Germans como herramienta de trabajo diaria, no como software corporativo genérico.

**Personalidad:** Profesional pero con carácter propio. Como un buen cuaderno de profesor: limpio, funcional, con la calidez del taller de carpintería en los detalles visuales.

---

## 2. Design Language

### Aesthetic Direction
Inspiración: **Carpintería premium + pizarra de taller.** Madera cálida + tiza + estructura industrial. No genérica educativa.

### Color Palette
```
--color-primary:       #4F46E5   (Índigo — confianza, profesionalismo)
--color-primary-dark:  #3730A3
--color-accent:        #D97706   (Ámbar — calor del taller, madera)
--color-accent-light:   #FEF3C7
--color-success:        #059669
--color-warning:        #DC2626
--color-bg:             #F8FAFC
--color-surface:        #FFFFFF
--color-border:         #E2E8F0
--color-text:           #1E293B
--color-text-muted:     #64748B
--color-dark-bg:        #0F172A
--color-dark-surface:   #1E293B
--color-dark-text:      #F1F5F9
```

### Typography
- **Font principal:** Inter (Google Fonts) — clean, legible, profesional
- **Títulos:** Inter 700
- **Cuerpo:** Inter 400/500
- **Fallback:** system-ui, sans-serif

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Border radius: 8px (cards), 6px (inputs), 12px (modals)
- Shadows: subtle, layered

### Motion
- Framer Motion para transiciones de página y modales
- Duración estándar: 200ms ease-out
- Animación de entrada: fade + slide sutil desde abajo
- Indicadores de carga: skeleton screens (no spinners)

### Visual Assets
- Iconos: Lucide React
- Sin imágenes externas obligatorias (offline-first)
- Logo institucional configurable por el usuario

---

## 3. Layout & Structure

### App Shell
```
┌─────────────────────────────────────┐
│  HEADER (logo + curso activo)       │
│  Selector grupo | Selector módulo   │
├─────────────────────────────────────┤
│                                     │
│         PÁGINA ACTIVA               │
│                                     │
├─────────────────────────────────────┤
│  NAV (5 tabs: Dashboard, Alumnos,   │
│  Calificaciones, Asistencia, Más)    │
└─────────────────────────────────────┘
```

### Navegación (Bottom tabs — móvil primero)
1. **Inicio** → Dashboard
2. **Alumnos** → Students
3. **Notas** → Grades
4. **Asistencia** → Attendance
5. **Más** → Submenu: Taller, Sesiones, Currículo, Config

### Responsive Strategy
- Mobile-first (375px base)
- Tablet: mismo layout, más espacio
- Desktop: sidebar fija izquierda, contenido principal derecha

---

## 4. Features & Interactions

### 4.1 Configuración Inicial (First Run)
- Selector de curso (ej: 2025/2026)
- Nombre del centro
- Nombre del profesor
- Logo del centro (subida de imagen local → base64 en IndexedDB)
- Crear/importar grupos y módulos

### 4.2 Dashboard
- Resumen del día actual
- Alerta de estudiantes sin foto
- Próximas sesiones registradas
- Accesos rápidos a: Pasar lista, Añadir incidencia, Ver estadísticas
- Contador de asistencia del mes (presente / ausente / retraso)

### 4.3 Gestión de Alumnos
- Lista con foto, nombre, número
- Buscador (nombre, apellidos)
- Filtro por grupo
- Ficha individual: datos personales + foto + expediente + observaciones
- Subida de foto (cámara o archivo, compresión automática)
- Marcar repetidor
- Botón de llamada/alerta rápida
- Exportar lista a PDF

### 4.4 Calificaciones
- Vista por módulo / grupo activo
- Cada estudiante → tabla de RA con notas por instrumento
- Instrumentos de evaluación: nombre, fecha, tipo, peso
- Modelo de evaluación configurable: ponderado (exámenes %, proyectos %, obs %)
- Notas sobre 10, con 2 decimales
- Indicador visual: color de fondo según calificación (rojo <5, amarillo 5-7, verde >7)
- Exportar informe de calificaciones a PDF

### 4.5 Asistencia
- Selector de fecha
- Pasar lista rápida: presente (P), ausente (A), retraso (R), justificante (J)
- Resumen visual: donut chart con totales
- Historial de sesiones de asistencia
- Botón "Hoy" para volver a fecha actual
- Exportar parte de asistencia a PDF

### 4.6 Taller / FCT
- Registro de horas de taller/FCT por estudiante
- Campos: fecha, horas, actividad, módulo
- Objetivo de horas configurable
- Barra de progreso por estudiante
- Resumen de horas totales

### 4.7 Sesiones de Clase
- Registrar sesión: fecha, título, contenido, tareas, incidencias
- Vinculada a grupo y módulo
- Historial de sesiones por módulo

### 4.8 Currículo
- MódulosProfesionales con sus RA
- Criterios de Evaluación (CE) por RA
- UnidadesDidácticas por módulo
- CRUD completo de RA y CE

### 4.9 Sugerencias
- Libro de sugerencias abierto a estudiantes (futuro)
- Panel interno del profesor para notas pedagógicas

### 4.10 Configuración
- Datos del centro y profesor
- Gestión de grupos
- Gestión de módulos
- Tema claro/oscuro
- Backup manual: exportar JSON
- Restaurar desde backup JSON
- Ajustes de evaluación (pesos, nota mínima, nota máxima, decimales)

### 4.11 PWA
- Instalable en Android/iOS/Windows/Mac
- Funciona 100% offline
- Service Worker con cache de app shell
- Notificación de nueva versión disponible

### Edge Cases
- Sin internet: todo funciona localmente
- Al reconectar: opción de sincronizar con Supabase
- Copia de seguridad automática cada 24h (local)
- Datos de demostración precargados (semilla) para que la app no esté vacía al primer uso

---

## 5. Component Inventory

### Layout
- `AppShell` — wrapper con header, nav, contenido
- `Header` — logo, curso activo, selector grupo/módulo
- `BottomNav` — 5 tabs con icono + label
- `Sidebar` (desktop) — navegación lateral colapsable

### Pages
- `DashboardPage`
- `StudentsPage` — lista + búsqueda
- `StudentDetailPage` — ficha completa
- `GradesPage` — tabla de notas por RA
- `AttendancePage` — pasar lista
- `AttendanceHistoryPage` — historial
- `WorkplacePage` — registro horas taller
- `SessionsPage` — registro sesiones
- `CurriculumPage` — módulos/RA/CE
- `SettingsPage`
- `SuggestionsPage`

### UI Primitives
- `Button` (primary, secondary, ghost, danger) — todos los estados
- `Input`, `Textarea`, `Select`
- `Card` — superficie con sombra
- `Badge` — estados, roles
- `Avatar` — foto de estudiante con fallback iniciales
- `StatCard` — número grande con icono y label
- `Modal` — overlay con animación
- `Skeleton` — carga
- `Toast` — notificaciones
- `EmptyState` — mensaje cuando no hay datos
- `ConfirmDialog` — confirmación de acciones destructivas
- `DonutChart` — asistencia

### States por componente
- Default, hover, active, disabled, loading, error, empty

---

## 6. Technical Approach

### Stack
- **Framework:** Vite + React 19
- **Estilos:** Tailwind CSS v4 (vite-plugin-tailwind)
- **Base de datos:** Dexie (IndexedDB wrapper) — offline-first
- **Navegación:** React Router v7
- **Animaciones:** Framer Motion
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **PWA:** vite-plugin-pwa (Workbox)
- **Build:** GitHub Pages (como solicitudes-material)

### Estructura del proyecto
```
cuaderno-aula-pwa/
├── public/
│   ├── manifest.json          (generado por vite-plugin-pwa)
│   └── icons/                 (192, 512, maskable)
├── src/
│   ├── db/
│   │   ├── index.js           (Dexie + schema)
│   │   └── seed.js            (datos de demostración)
│   ├── components/
│   │   ├── ui/                (Button, Card, Input, Modal...)
│   │   ├── layout/            (AppShell, Header, BottomNav...)
│   │   └── features/          (StudentCard, GradeTable...)
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── StudentsPage.jsx
│   │   ├── StudentDetailPage.jsx
│   │   ├── GradesPage.jsx
│   │   ├── AttendancePage.jsx
│   │   ├── WorkplacePage.jsx
│   │   ├── SessionsPage.jsx
│   │   ├── CurriculumPage.jsx
│   │   ├── SuggestionsPage.jsx
│   │   └── SettingsPage.jsx
│   ├── hooks/
│   │   ├── useDatabase.js
│   │   ├── useAttendance.js
│   │   └── useGrades.js
│   ├── lib/
│   │   ├── pdf.js             (exportación PDF con jsPDF)
│   │   └── backup.js          (export/import JSON)
│   ├── router.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── index.html
```

### Modelo de datos (Dexie — igual que el original)
```js
db.version(9).stores({
  students:       '++id, name, surname, number, email, groupId, birthDate, isRepeater, photo, pendingSubjects, observations',
  learningOutcomes: '++id, code, description, weight, moduleId, evaluation',
  criteria:       '++id, code, description, raId',
  instruments:    '++id, name, date, evaluation, weight, moduleId, groupId, type, counts',
  instrument_criteria: '++id, instrumentId, criterionId',
  grades:         '++id, studentId, instrumentId, criterionId, value, date',
  settings:       'id, schoolName, teacherName, course, activeModuleId, activeGroupId, logo, minGrade, maxGrade, decimals, darkMode, lastSaved',
  attendance:     '++id, studentId, date, status, sessionId',
  sessions:       '++id, date, title, content, tasks, evidence, incidents, groupId, moduleId',
  units:          '++id, number, title, moduleId',
  modules:        '++id, code, name, examsWeight, projectsWeight, obsWeight, model, groupId, hours, color, shortName',
  groups:         '++id, name, stage, year, evalCount',
  suggestions:    '++id, content, category, date, moduleId, status',
  workplace_logs: '++id, studentId, date, hours, activity, moduleId'
});
```

### Despliegue
- GitHub Pages (igual que solicitudes-material)
- Repo: `https://github.com/German48/cuaderno-aula-pwa`
- URL: `https://german48.github.io/cuaderno-aula-pwa`

### Siguiente iteración (futuro)
- Sync con Supabase (proyecto dedicado)
- Login para estudiantes (ver sugerencias)
- App móvil nativa (Capacitor)
