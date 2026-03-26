import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db, seedDatabase } from './db';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import StudentDetailPage from './pages/StudentDetailPage';
import GradesPage from './pages/GradesPage';
import AttendancePage from './pages/AttendancePage';
import AttendanceHistoryPage from './pages/AttendanceHistoryPage';
import WorkplacePage from './pages/WorkplacePage';
import SessionsPage from './pages/SessionsPage';
import CurriculumPage from './pages/CurriculumPage';
import SuggestionsPage from './pages/SuggestionsPage';
import SettingsPage from './pages/SettingsPage';
import MorePage from './pages/MorePage';

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDatabase().then(async () => {
      const settings = await db.settings.get(1);
      document.documentElement.classList.toggle('dark', !!settings?.darkMode);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;

    const applyTheme = async () => {
      const settings = await db.settings.get(1);
      document.documentElement.classList.toggle('dark', !!settings?.darkMode);
    };

    applyTheme();
    const onVisibility = () => {
      if (!document.hidden) applyTheme();
    };

    window.addEventListener('focus', applyTheme);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', applyTheme);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [ready]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Cargando Cuaderno de Aula...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/attendance/history" element={<AttendanceHistoryPage />} />
          <Route path="/workplace" element={<WorkplacePage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/curriculum" element={<CurriculumPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
