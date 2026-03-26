import React from 'react';

export default function Avatar({ name, photo, size = 'md', hoverZoom = false }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-xl' };
  const cls = sizes[size] || sizes.md;

  const initials = name
    ? name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : '?';

  const colors = [
    'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-pink-500', 'bg-violet-500', 'bg-teal-500', 'bg-orange-500'
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;

  const avatarCore = photo
    ? <img src={photo} alt={name} className={`${cls} rounded-full object-cover bg-slate-100 flex-shrink-0`} />
    : <div className={`${cls} ${colors[idx]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>{initials}</div>;

  if (!hoverZoom) return avatarCore;

  return (
    <div className="relative group flex-shrink-0">
      <div className="cursor-zoom-in">{avatarCore}</div>
      <div className="pointer-events-none absolute left-1/2 top-full z-40 hidden -translate-x-1/2 pt-2 group-hover:block">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-2xl">
          {photo ? (
            <img src={photo} alt={name} className="w-28 h-28 rounded-xl object-cover bg-slate-100" />
          ) : (
            <div className={`w-28 h-28 ${colors[idx]} rounded-xl flex items-center justify-center text-white text-3xl font-bold`}>
              {initials}
            </div>
          )}
          <p className="mt-2 max-w-[112px] text-center text-[11px] font-medium text-[var(--color-text)] leading-tight">{name}</p>
        </div>
      </div>
    </div>
  );


}
