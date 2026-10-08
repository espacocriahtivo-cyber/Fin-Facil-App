import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Transaction, ScopeFilter } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function exportTransactionsToExcel(
  transactions: Transaction[],
  scope: ScopeFilter,
  periodLabel: string
): void {
  // Detailed data
  const dataRows = transactions.map((t) => ({
    Data: formatDateBR(t.date),
    Vencimento: t.dueDate ? formatDateBR(t.dueDate) : '-',
    Âmbito: t.context === 'personal' ? 'Pessoal' : 'Micro Negócio',
    Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
    Categoria: t.category,
    Descrição: t.description,
    'Forma Pagamento': t.paymentMethod || '-',
    Status: t.status === 'paid' ? 'Pago' : 'Pendente',
    'Valor (R$)': t.amount,
    Observações: t.notes || '',
  }));

  // Calculations for summary sheet
  const personalIncomes = transactions
    .filter((t) => t.context === 'personal' && t.type === 'income' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const personalExpenses = transactions
    .filter((t) => t.context === 'personal' && t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const businessIncomes = transactions
    .filter((t) => t.context === 'business' && t.type === 'income' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const businessExpenses = transactions
    .filter((t) => t.context === 'business' && t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingTotal = transactions
    .filter((t) => t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  const summaryRows = [
    { Indicador: 'Período do Relatório', Valor: periodLabel },
    { Indicador: 'Filtro de Âmbito', Valor: scope === 'all' ? 'Pessoal + Micro Negócio' : scope === 'personal' ? 'Apenas Pessoal' : 'Apenas Micro Negócio' },
    { Indicador: '--- PESSOAL ---', Valor: '' },
    { Indicador: 'Receitas Pessoais Pagas (R$)', Valor: personalIncomes },
    { Indicador: 'Despesas Pessoais Pagas (R$)', Valor: personalExpenses },
    { Indicador: 'Saldo Líquido Pessoal (R$)', Valor: personalIncomes - personalExpenses },
    { Indicador: '--- MICRO NEGÓCIO ---', Valor: '' },
    { Indicador: 'Faturamento / Receitas PJ (R$)', Valor: businessIncomes },
    { Indicador: 'Custos / Despesas PJ (R$)', Valor: businessExpenses },
    { Indicador: 'Resultado / Lucro PJ (R$)', Valor: businessIncomes - businessExpenses },
    { Indicador: '--- CONSOLIDAÇÃO GERAL ---', Valor: '' },
    { Indicador: 'Total Receitas Gerais (R$)', Valor: personalIncomes + businessIncomes },
    { Indicador: 'Total Despesas Gerais (R$)', Valor: personalExpenses + businessExpenses },
    { Indicador: 'Saldo Total em Caixa (R$)', Valor: (personalIncomes + businessIncomes) - (personalExpenses + businessExpenses) },
    { Indicador: 'Total Contas Pendentes (R$)', Valor: pendingTotal },
  ];

  const wb = XLSX.utils.book_new();

  // Create worksheets
  const wsTransactions = XLSX.utils.json_to_sheet(dataRows);
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);

  // Set widths
  wsTransactions['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 20 },
    { wch: 28 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 25 },
  ];

  wsSummary['!cols'] = [{ wch: 35 }, { wch: 25 }];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Financeiro');
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Lançamentos Detalhados');

  const todayStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `FinFacil_Relatorio_${todayStr}.xlsx`);
}

export function exportTransactionsToPDF(
  transactions: Transaction[],
  scope: ScopeFilter,
  periodLabel: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Fin Fácil App - Relatório Financeiro', 14, 13);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  const scopeText = scope === 'all' ? 'Pessoal & Micro Negócio' : scope === 'personal' ? 'Controle Pessoal' : 'Micro Negócio';
  doc.text(`Âmbito: ${scopeText} | Período: ${periodLabel} | Emitido: ${new Date().toLocaleDateString('pt-BR')}`, 14, 21);

  // Summary Metrics calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const pendingAmount = transactions
    .filter((t) => t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  // Summary Boxes
  const startY = 34;
  const boxWidth = (pageWidth - 28 - 9) / 4;
  const boxHeight = 16;

  // Box 1: Receitas
  doc.setFillColor(240, 253, 244); // green-50
  doc.setDrawColor(187, 247, 208); // green-200
  doc.roundedRect(14, startY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52); // green-800
  doc.text('RECEITAS PAGAS', 16, startY + 5);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(totalIncome), 16, startY + 12);

  // Box 2: Despesas
  const b2X = 14 + boxWidth + 3;
  doc.setFillColor(254, 242, 242); // red-50
  doc.setDrawColor(254, 202, 202); // red-200
  doc.roundedRect(b2X, startY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(153, 27, 27); // red-800
  doc.text('DESPESAS PAGAS', b2X + 2, startY + 5);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(totalExpense), b2X + 2, startY + 12);

  // Box 3: Saldo
  const b3X = b2X + boxWidth + 3;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(b3X, startY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('SALDO LÍQUIDO', b3X + 2, startY + 5);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(balance >= 0 ? 22 : 153, balance >= 0 ? 101 : 27, balance >= 0 ? 52 : 27);
  doc.text(formatCurrency(balance), b3X + 2, startY + 12);

  // Box 4: Pendentes
  const b4X = b3X + boxWidth + 3;
  doc.setFillColor(254, 249, 195); // amber-50
  doc.setDrawColor(253, 224, 71); // amber-300
  doc.roundedRect(b4X, startY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(133, 77, 14); // amber-800
  doc.text('A PAGAR / RECEBER', b4X + 2, startY + 5);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(pendingAmount), b4X + 2, startY + 12);

  // Table Data
  const tableRows = transactions.map((t) => [
    formatDateBR(t.date),
    t.context === 'personal' ? 'Pessoal' : 'Micro Neg.',
    t.type === 'income' ? '+ Receita' : '- Despesa',
    t.category,
    t.description,
    t.status === 'paid' ? 'Pago' : 'Pendente',
    formatCurrency(t.amount),
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['Data', 'Âmbito', 'Tipo', 'Categoria', 'Descrição', 'Status', 'Valor']],
    body: tableRows,
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 22 },
      2: { cellWidth: 20 },
      3: { cellWidth: 28 },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 18 },
      6: { cellWidth: 25, halign: 'right' },
    },
    didParseCell: (data) => {
      // Highlight Income vs Expense
      if (data.section === 'body' && data.column.index === 2) {
        if (data.cell.raw === '+ Receita') {
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [153, 27, 27];
        }
      }
      // Highlight Status
      if (data.section === 'body' && data.column.index === 5) {
        if (data.cell.raw === 'Pendente') {
          data.cell.styles.textColor = [180, 83, 9];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  const todayStr = new Date().toISOString().split('T')[0];
  doc.save(`FinanSync_Relatorio_${todayStr}.pdf`);
}
