import { db } from '../db';
import { supabase, supabaseEnabled, SUPABASE_TABLES } from './supabase';

async function setSyncState(syncStatus, syncMessage) {
  await db.settings.update(1, {
    syncStatus,
    syncMessage,
    ...(syncStatus === 'ok' ? { lastSyncedAt: new Date().toISOString() } : {}),
  });
}

export async function pushAllToSupabase(onProgress) {
  if (!supabaseEnabled || !supabase) {
    await setSyncState('error', 'Supabase no está configurado');
    throw new Error('Supabase no está configurado. Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
  }

  await setSyncState('syncing', 'Sincronizando con Supabase…');

  try {
    for (let i = 0; i < SUPABASE_TABLES.length; i++) {
      const table = SUPABASE_TABLES[i];
      if (onProgress) onProgress(`Sincronizando ${table}...`, i / SUPABASE_TABLES.length);

      const rows = await db[table].toArray();

      const { error: deleteError } = await supabase.from(table).delete().not('id', 'is', null);
      if (deleteError) throw deleteError;

      if (rows.length) {
        const { error: insertError } = await supabase.from(table).insert(rows);
        if (insertError) throw insertError;
      }
    }

    await db.settings.update(1, {
      syncStatus: 'ok',
      syncMessage: 'Sincronizado correctamente con Supabase',
      lastSyncedAt: new Date().toISOString(),
    });
    if (onProgress) onProgress('Sincronización completada', 1);
  } catch (error) {
    await db.settings.update(1, {
      syncStatus: 'error',
      syncMessage: error?.message || 'Error de sincronización con Supabase',
    });
    throw error;
  }
}
