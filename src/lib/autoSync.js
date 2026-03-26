import { db } from '../db';
import { pushAllToSupabase } from './supabaseSync';
import { supabaseEnabled } from './supabase';

let syncTimer = null;
let syncing = false;

export function scheduleAutoSync(delay = 2000) {
  if (!supabaseEnabled) return;

  if (syncTimer) clearTimeout(syncTimer);

  syncTimer = setTimeout(async () => {
    if (syncing) return;
    syncing = true;
    try {
      await pushAllToSupabase();
    } catch (error) {
      await db.settings.update(1, {
        syncStatus: 'error',
        syncMessage: error?.message || 'Error de sincronización automática',
      });
    } finally {
      syncing = false;
      syncTimer = null;
    }
  }, delay);
}
