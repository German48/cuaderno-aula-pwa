import jsPDF from 'jspdf';

export function generateGradesPDF(students, grades, module, group) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text('Cuaderno de Aula – Informe de Calificaciones', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Módulo: ${module?.name || ''}`, 14, 30);
  doc.text(`Grupo: ${group?.name || ''}`, 14, 36);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 42);

  let y = 52;
  doc.setDrawColor(200);
  doc.line(14, y - 2, pageWidth - 14, y - 2);

  students.forEach((student, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFontSize(10);
    doc.setTextColor(30);
    doc.text(`${student.number}. ${student.name} ${student.surname}`, 14, y);
    const stGrades = grades.filter(g => g.studentId === student.id);
    const avg = stGrades.length ? (stGrades.reduce((s, g) => s + g.value, 0) / stGrades.length).toFixed(2) : '—';
    doc.text(`Media: ${avg}`, 140, y);
    y += 6;
  });

  doc.save(`calificaciones_${module?.shortName || 'mod'}_${Date.now()}.pdf`);
}

export function generateAttendancePDF(students, records, group, date) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text('Cuaderno de Aula – Parte de Asistencia', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Grupo: ${group?.name || ''}`, 14, 30);
  doc.text(`Fecha: ${date}`, 14, 36);

  let y = 46;
  doc.setDrawColor(200);
  doc.line(14, y - 2, pageWidth - 14, y - 2);

  const statusColors = { present: [5, 150, 105], absent: [220, 38, 38], delayed: [245, 158, 11], justified: [100, 116, 139] };
  const statusLabels = { present: '✓ Presente', absent: '✗ Falta', delayed: '◷ Retraso', justified: '◦ Justificado' };

  students.forEach((student, i) => {
    if (y > 275) { doc.addPage(); y = 20; }
    const rec = records.find(r => r.studentId === student.id);
    doc.setFontSize(9);
    doc.setTextColor(30);
    doc.text(`${student.number}. ${student.name} ${student.surname}`, 14, y);
    const status = rec?.status || 'present';
    const [r, g, b] = statusColors[status] || [100, 116, 139];
    doc.setTextColor(r, g, b);
    doc.text(statusLabels[status] || status, 140, y);
    y += 6;
  });

  doc.save(`asistencia_${date}_${Date.now()}.pdf`);
}
