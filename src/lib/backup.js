import { db } from '../db';

export async function exportDatabase() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tables: {},
  };

  const tableNames = [
    'students', 'learningOutcomes', 'criteria', 'instruments',
    'instrument_criteria', 'grades', 'settings', 'attendance',
    'sessions', 'units', 'modules', 'groups', 'suggestions', 'workplace_logs'
  ];

  for (const name of tableNames) {
    data.tables[name] = await db[name].toArray();
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cuaderno_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importDatabase(file, onProgress) {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!data.version || !data.tables) {
    throw new Error('Formato de backup no válido');
  }

  const tableNames = Object.keys(data.tables);

  for (let i = 0; i < tableNames.length; i++) {
    const name = tableNames[i];
    if (onProgress) onProgress(`Importando ${name}...`, i / tableNames.length);
    await db[name].clear();
    const rows = data.tables[name];
    if (rows && rows.length > 0) {
      await db[name].bulkAdd(rows);
    }
  }

  if (onProgress) onProgress('Importación completada', 1);
}
