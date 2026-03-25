import React from 'react';

export default function Avatar({ name, photo, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  const cls = sizes[size] || sizes.md;

  if (photo) {
    return <img src={photo} alt={name} className={`${cls} rounded-full object-cover bg-slate-100`} />;
  }

  const initials = name
    ? name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : '?';

  const colors = [
    'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-pink-500', 'bg-violet-500', 'bg-teal-500', 'bg-orange-500'
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;

  return (
    <div className={`${cls} ${colors[idx]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}
