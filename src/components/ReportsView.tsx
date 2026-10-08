import React, { useState, useMemo } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, exportTransactionsToExcel, exportTransactionsToPDF } from '../utils/export';
import { TransactionType, PeriodFilter } from '../types';
import { 
  FileSpreadsheet, 
  FileText, 
  PieChart as PieIcon, 
  BarChart3, 
  Building2, 
  User, 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  DollarSign
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { filteredTransactions, scope, period, setPeriod, summary, formatDisplayValue } = useFinancial();

  const [chartType, setChartType] = useState<TransactionType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: 'current_month', label: 'Este Mês' },
    { id: 'last_7_days', label: '7 Dias' },
    { id: 'last_30_days', label: '30 Dias' },
    { id: 'last_month', label: 'Mês Anterior' },
    { id: 'current_year', label: 'Ano Atual' },
    { id: 'all', label: 'Todo Período' },
  ];

  const currentPeriodLabel = periods.find((p) => p.id === period)?.label || 'Personalizado';

  // Category breakdown calculation
  const categoryData = useMemo(() => {
    const map: { [cat: string]: number } = {};
    let total = 0;

    for (const t of filteredTransactions) {
      if (t.type === chartType && t.status === 'paid') {
        map[t.category] = (map[t.category] || 0) + t.amount;
        total += t.amount;
      }
    }

    const items = Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }));

    // Sort descending
    items.sort((a, b) => b.amount - a.amount);
    return { items, total };
  }, [filteredTransactions, chartType]);

  // Color palette for category donut chart
  const palette = [
    '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#EC4899', '#14B8A6', '#F97316', '#6366F1'
  ];

  // Cash flow by date calculation for Bar Chart
  const timeEvolution = useMemo(() => {
    const datesMap: { [date: string]: { income: number; expense: number } } = {};

    for (const t of filteredTransactions) {
      if (t.status === 'paid') {
        if (!datesMap[t.date]) {
          datesMap[t.date] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
          datesMap[t.date].income += t.amount;
        } else {
          datesMap[t.date].expense += t.amount;
        }
      }
    }

    // Sort ascending by date
    const sortedDates = Object.keys(datesMap).sort();
    // Pick at most the last 10 date points to avoid clutter on mobile
    const recentDates = sortedDates.slice(-10);

    const maxVal = Math.max(
      ...recentDates.map((d) => Math.max(datesMap[d].income, datesMap[d].expense)),
      1
    );

    return {
      points: recentDates.map((date) => ({
        date,
        shortDate: date.slice(5), // MM-DD
        income: datesMap[date].income,
        expense: datesMap[date].expense,
      })),
      maxVal,
    };
  }, [filteredTransactions]);

  // Calculations for Personal vs Business comparison matrix
  const businessProfitMargin =
    summary.businessIncome > 0
      ? ((summary.businessBalance / summary.businessIncome) * 100).toFixed(1)
      : '0.0';

  const personalSavingsRate =
    summary.personalIncome > 0
      ? ((summary.personalBalance / summary.personalIncome) * 100).toFixed(1)
      : '0.0';

  const handleExportPDF = () => {
    exportTransactionsToPDF(filteredTransactions, scope, currentPeriodLabel);
  };

  const handleExportExcel = () => {
    exportTransactionsToExcel(filteredTransactions, scope, currentPeriodLabel);
  };

  // SVG Donut calculation helper
  let cumulativeAngle = 0;
  const donutSlices = categoryData.items.map((item, idx) => {
    const sliceAngle = (item.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += sliceAngle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = (((startAngle + sliceAngle) - 90) * Math.PI) / 180;

    const cx = 100;
    const cy = 100;
    const r = 80;
    const ir = 50;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const ix1 = cx + ir * Math.cos(endRad);
    const iy1 = cy + ir * Math.sin(endRad);
    const ix2 = cx + ir * Math.cos(startRad);
    const iy2 = cy + ir * Math.sin(startRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = `
      M ${x1} ${y1}
      A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}
      L ${ix1} ${iy1}
      A ${ir} ${ir} 0 ${largeArc} 0 ${ix2} ${iy2}
      Z
    `;

    return {
      ...item,
      pathData,
      color: palette[idx % palette.length],
    };
  });

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Relatórios & Análise Gráfica
          </h2>
          <p className="text-[11px] text-slate-400">
            Separação Pessoal vs PJ e inteligência de fluxo
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-semibold transition active:scale-95"
            title="Exportar Relatório PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Baixar PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition active:scale-95"
            title="Exportar Planilha Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Baixar Excel</span>
          </button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {periods.map((p) => {
          const isActive = period === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* SEPARATION MATRIX: Pessoal vs Micro Negócio Side-by-Side */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">
              Matriz Comparativa: Pessoal vs Micro Negócio
            </h3>
            <p className="text-[10px] text-slate-400">
              Análise separada para não misturar finanças físicas e jurídicas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Card Micro Negócio */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Micro Negócio (PJ)
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                Margem: {businessProfitMargin}%
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>Faturamento (Vendas/Serviços):</span>
                <span className="font-bold text-emerald-400">{formatDisplayValue(summary.businessIncome)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Custos Operacionais & Insumos:</span>
                <span className="font-bold text-rose-400">{formatDisplayValue(summary.businessExpense)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-emerald-500/20 text-xs font-bold text-slate-100">
                <span>Lucro Líquido PJ:</span>
                <span className={summary.businessBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatDisplayValue(summary.businessBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Card Pessoal */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-indigo-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Controle Pessoal (PF)
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                Taxa Poupança: {personalSavingsRate}%
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>Renda Pessoal Realizada:</span>
                <span className="font-bold text-emerald-400">{formatDisplayValue(summary.personalIncome)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Despesas Domésticas:</span>
                <span className="font-bold text-rose-400">{formatDisplayValue(summary.personalExpense)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-indigo-500/20 text-xs font-bold text-slate-100">
                <span>Saldo Líquido Pessoal:</span>
                <span className={summary.personalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatDisplayValue(summary.personalBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tip for small business owners */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-300">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Dica de Equilíbrio:</strong> Defina um valor fixo de <em>Pró-Labore</em> para ser retirado do seu negócio todo mês e lançado como despesa PJ e receita PF. Isso preserva o caixa da empresa e equilibra sua vida financeira!
          </p>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN CHART (DONUT) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-100">
              Distribuição por Categoria
            </h3>
          </div>

          {/* Toggle Despesas vs Receitas */}
          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-medium flex">
            <button
              onClick={() => {
                setChartType('expense');
                setSelectedCategory(null);
              }}
              className={`px-2 py-1 rounded-md transition ${
                chartType === 'expense'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => {
                setChartType('income');
                setSelectedCategory(null);
              }}
              className={`px-2 py-1 rounded-md transition ${
                chartType === 'income'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Receitas
            </button>
          </div>
        </div>

        {categoryData.items.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Nenhuma {chartType === 'expense' ? 'despesa' : 'receita'} registrada neste período.
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {donutSlices.map((slice, idx) => (
                  <path
                    key={idx}
                    d={slice.pathData}
                    fill={slice.color}
                    className="transition-all hover:opacity-80 cursor-pointer"
                    onClick={() => setSelectedCategory(slice.category)}
                  />
                ))}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
                <span className="text-[10px] text-slate-400 font-medium">Total</span>
                <span className="text-xs font-bold text-slate-100 truncate max-w-[100px]">
                  {formatDisplayValue(categoryData.total)}
                </span>
              </div>
            </div>

            {/* Category Legend & List */}
            <div className="flex-1 w-full space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
              {donutSlices.map((slice, idx) => {
                const isSelected = selectedCategory === slice.category;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedCategory(isSelected ? null : slice.category)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                      isSelected ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-850/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="truncate text-slate-200 text-xs font-medium">
                        {slice.category}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-semibold text-slate-100 text-xs">
                        {formatDisplayValue(slice.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1.5">
                        ({slice.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* TIME EVOLUTION CHART: Cash flow over dates */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-100">
              Evolução Temporal: Receitas x Despesas
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Receitas
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Despesas
            </span>
          </div>
        </div>

        {timeEvolution.points.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Nenhuma movimentação registrada no gráfico temporal.
          </div>
        ) : (
          <div className="h-44 flex items-end gap-2 pt-6 pb-2 px-1 border-b border-slate-800 overflow-x-auto">
            {timeEvolution.points.map((pt, i) => {
              const incomeHeight = Math.max((pt.income / timeEvolution.maxVal) * 100, 3);
              const expenseHeight = Math.max((pt.expense / timeEvolution.maxVal) * 100, 3);

              return (
                <div key={i} className="flex-1 flex flex-col items-center min-w-[36px] h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-[85%]">
                    {/* Income bar */}
                    <div
                      style={{ height: `${incomeHeight}%` }}
                      className="w-3 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all group-hover:brightness-125"
                      title={`Receitas em ${pt.date}: ${formatCurrency(pt.income)}`}
                    />
                    {/* Expense bar */}
                    <div
                      style={{ height: `${expenseHeight}%` }}
                      className="w-3 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all group-hover:brightness-125"
                      title={`Despesas em ${pt.date}: ${formatCurrency(pt.expense)}`}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 truncate">
                    {pt.shortDate}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
