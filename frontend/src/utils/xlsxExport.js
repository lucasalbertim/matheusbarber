import * as XLSX from 'xlsx';

export function exportMetricsXLSX({ metrics, filters }) {
  // Monta os dados do relatório
  const data = [
    ['Relatório de Métricas'],
    [`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`],
    [`Período: ${filters.startDate || '-'} até ${filters.endDate || '-'}`],
    [],
    ['Resumo das Métricas'],
    ['Receita Total', metrics.totalRevenue],
    ['Total de Clientes', metrics.totalClients],
    ['Total de Atendimentos', metrics.totalAttendances],
    ['Ticket Médio', Number(metrics.averageTicket).toFixed(2)],
    [],
    ['Documento gerado automaticamente pelo sistema Matheus Barber']
  ];

  // Cria a planilha
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

  // Gera o arquivo e faz download
  XLSX.writeFile(wb, `relatorio-metricas-${new Date().toISOString().split('T')[0]}.xlsx`);
}
