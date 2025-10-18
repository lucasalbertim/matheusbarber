import { jsPDF } from 'jspdf';

export function exportMetricsPDF({ metrics, filters, logoUrl }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'A4' });

  // Cabeçalho com logo
  if (logoUrl) {
    doc.addImage(logoUrl, 'JPEG', 15, 10, 30, 30);
  }
  doc.setFontSize(18);
  doc.text('Relatório de Métricas', 55, 20);
  doc.setFontSize(12);
  doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 55, 28);
  doc.text(`Período: ${filters.startDate || '-'} até ${filters.endDate || '-'}`, 55, 36);
  doc.text(`Tipo de Atendimento: ${filters.attendanceType === 'all' ? 'Todos' : filters.attendanceType === 'presential' ? 'Presencial' : 'Agendado'}`, 55, 44);

  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(15, 50, 195, 50);

  // Tabela de métricas
  doc.setFontSize(14);
  doc.text('Resumo das Métricas', 15, 60);
  doc.setFontSize(12);
  const tableStartY = 65;
  const rowHeight = 10;
  const metricsData = [
    ['Receita Total', 'R$' + metrics.totalRevenue.toFixed(2)],
    ['Total de Clientes', metrics.totalClients],
    ['Total de Atendimentos', metrics.totalAttendances],
    ['Ticket Médio', 'R$' + metrics.averageTicket.toFixed(2)],
  ];
  metricsData.forEach(([label, value], i) => {
    doc.text(label, 20, tableStartY + i * rowHeight);
    doc.text(String(value), 120, tableStartY + i * rowHeight);
  });

  // Rodapé
  doc.setFontSize(10);
  doc.text('Documento gerado automaticamente pelo sistema Matheus Barber', 15, 285);

  doc.save(`relatorio-metricas-${new Date().toISOString().split('T')[0]}.pdf`);
}
