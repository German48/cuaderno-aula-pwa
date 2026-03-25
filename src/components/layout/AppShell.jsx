import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

export default function AppShell({ children }) {
  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg)]">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
