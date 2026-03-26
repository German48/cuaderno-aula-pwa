import { db } from '../db';

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows) {
  if (!rows.length) return '';
  const keys = Array.from(rows.reduce((set, row) => {
    Object.keys(row || {}).forEach(k => set.add(k));
    return set;
  }, new Set()));

  const lines = [keys.join(';')];
  for (const row of rows) {
    lines.push(keys.map(key => escapeCsv(row[key])).join(';'));
  }
  return lines.join('\n');
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportCsvBundle() {
  const tableNames = [
    'students', 'learningOutcomes', 'criteria', 'instruments',
    'instrument_criteria', 'grades', 'settings', 'attendance',
    'sessions', 'units', 'modules', 'groups', 'suggestions', 'workplace_logs'
  ];

  const date = new Date().toISOString().split('T')[0];

  for (const name of tableNames) {
    const rows = await db[name].toArray();
    const csv = toCsv(rows);
    downloadBlob(csv, `cuaderno_${name}_${date}.csv`, 'text/csv;charset=utf-8;');
  }
}
