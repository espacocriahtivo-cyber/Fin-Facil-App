import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDateBR } from '../utils/export';
import { PeriodFilter, Transaction } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileSpreadsheet, 
  CheckCircle2, 
  Circle,
  Building2,
  User,
  ArrowRight,
  Edit3,
  Trash2
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewTransaction: (type?: 'income' | 'expense') => void;
  onOpenExport: () => void;
  onOpenNotifications: () => void;
  onOpenTransactionDetails: (transaction: Transaction) => void;
  onGoToTransactions: () => void;
  onGoToReports: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewTransaction,
  onOpenExport,
  onOpenNotifications,
  onOpenTransactionDetails,
  onGoToTransactions,
  onGoToReports,
}) => {
  const { 
    summary, 
    filteredTransactions, 
    scope, 
    period, 
    setPeriod, 
    pendingAlerts, 
    markAsPaid, 
    deleteTransaction,
    seedInitialDataIfEmpty,
    formatDisplayValue
  } = useFinancial();

  const [itemToDelete, setItemToDelete] = React.useState<Transaction | null>(null);

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: 'current_month', label: 'Este Mês' },
    { id: 'last_7_days', label: '7 Dias' },
    { id: 'last_30_days', label: '30 Dias' },
    { id: 'last_month', label: 'Mês Anterior' },
    { id: 'current_year', label: 'Ano Atual' },
  ];

  const recentTransactions = filteredTransactions.slice(0, 5);

  const overdueCount = pendingAlerts.filter((a) => a.status === 'overdue').length;
  const todayCount = pendingAlerts.filter((a) => a.status === 'due_today').length;

  // Calculo do indicador de equilíbrio financeiro (% de comprometimento)
  const expenseRatio = summary.totalIncome > 0 
    ? Math.min(Math.round((summary.totalExpense / summary.totalIncome) * 100), 100) 
    : summary.totalExpense > 0 ? 100 : 0;

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Period Filter Scrollable Pills */}
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
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Intelligent Alerts Banner for Pending / Overdue Bills */}
      {pendingAlerts.length > 0 && (
        <div
          onClick={onOpenNotifications}
          className={`cursor-pointer rounded-2xl p-3 border shadow-md flex items-center justify-between transition active:scale-[0.99] ${
            overdueCount > 0
              ? 'bg-red-500/10 border-red-500/30 text-red-200'
              : todayCount > 0
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-slate-800/90 border-slate-700 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                overdueCount > 0
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold">
                {overdueCount > 0
                  ? `${overdueCount} conta(s) em atraso!`
                  : todayCount > 0
                  ? `${todayCount} conta(s) vencem hoje!`
                  : `${pendingAlerts.length} pagamento(s) pendente(s)`}
              </h4>
              <p className="text-[11px] opacity-80">
                Total pendente: {formatCurrency(summary.pendingTotal)}. Toque para gerenciar.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 opacity-70 shrink-0" />
        </div>
      )}

      {/* Main Balance Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Wallet className="w-4 h-4 text-emerald-400" />
            {scope === 'all'
              ? 'Saldo Juntos (Pessoal & Negócio)'
              : scope === 'personal'
              ? 'Saldo Líquido Pessoal'
              : 'Saldo / Lucro do Negócio'}
          </span>
          <span className="text-[11px] bg-slate-800/90 px-2 py-0.5 rounded-full border border-slate-700/60 text-slate-300">
            Realizado
          </span>
        </div>

        <div className="flex items-baseline gap-2 my-2">
          <h2
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              summary.balance >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {formatDisplayValue(summary.balance)}
          </h2>
        </div>

        {/* Incomes & Expenses Split Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 mt-2 border-t border-slate-800/80">
          <div className="bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800/60">
            <div className="flex items-center gap-1 text-[11px] text-emerald-400/90 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Receitas Pagas</span>
            </div>
            <p className="text-base font-bold text-slate-100 mt-1 truncate">
              {formatDisplayValue(summary.totalIncome)}
            </p>
          </div>

          <div className="bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800/60">
            <div className="flex items-center gap-1 text-[11px] text-rose-400/90 font-medium">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Despesas Pagas</span>
            </div>
            <p className="text-base font-bold text-slate-100 mt-1 truncate">
              {formatDisplayValue(summary.totalExpense)}
            </p>
          </div>
        </div>

        {/* Barra de Equilíbrio Financeiro */}
        {summary.totalIncome > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 font-medium">Termômetro de Equilíbrio:</span>
              <span className={`font-bold ${
                expenseRatio <= 70 ? 'text-emerald-400' : expenseRatio <= 90 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {expenseRatio}% comprometido {expenseRatio <= 70 ? '• Saudável' : expenseRatio <= 90 ? '• Atenção' : '• Crítico'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  expenseRatio <= 70 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                    : expenseRatio <= 90 
                    ? 'bg-gradient-to-r from-teal-400 to-amber-500' 
                    : 'bg-gradient-to-r from-amber-500 to-rose-500'
                }`}
                style={{ width: `${Math.min(expenseRatio, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Financial Health Breakdown: Pessoal vs Micro Negócio Separator */}
      {scope === 'all' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-200">
                Separação: Pessoal vs Micro Negócio
              </span>
            </div>
            <button
              onClick={onGoToReports}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
            >
              Gráficos <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Box Pessoal */}
            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-2">
                <User className="w-3.5 h-3.5" />
                <span>Finanças Pessoais</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Receitas:</span>
                  <span className="text-emerald-400 font-medium">{formatDisplayValue(summary.personalIncome)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Despesas:</span>
                  <span className="text-rose-400 font-medium">{formatDisplayValue(summary.personalExpense)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-indigo-500/20 font-bold text-slate-200">
                  <span>Saldo PF:</span>
                  <span className={summary.personalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {formatDisplayValue(summary.personalBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Box Micro Negócio */}
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>Micro Negócio (PJ)</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Faturamento:</span>
                  <span className="text-emerald-400 font-medium">{formatDisplayValue(summary.businessIncome)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Custos PJ:</span>
                  <span className="text-rose-400 font-medium">{formatDisplayValue(summary.businessExpense)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-500/20 font-bold text-slate-200">
                  <span>Lucro PJ:</span>
                  <span className={summary.businessBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {formatDisplayValue(summary.businessBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {summary.proLaboreTotal > 0 && (
            <div className="mt-2.5 p-2 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Pró-labore transferido da empresa:</span>
              <span className="font-semibold text-purple-400">{formatDisplayValue(summary.proLaboreTotal)}</span>
            </div>
          )}
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onOpenNewTransaction('income')}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition active:scale-95"
        >
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 mb-1">
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium">+ Receita</span>
        </button>

        <button
          onClick={() => onOpenNewTransaction('expense')}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition active:scale-95"
        >
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 mb-1">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium">+ Despesa</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition active:scale-95"
        >
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 mb-1">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium">Exportar</span>
        </button>

        <button
          onClick={onOpenNotifications}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition active:scale-95"
        >
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium">Contas</span>
        </button>
      </div>

      {/* Recent Transactions List */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-200">
            Lançamentos Recentes ({filteredTransactions.length})
          </h3>
          <button
            onClick={onGoToTransactions}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-slate-400 mb-2">Nenhuma movimentação neste período.</p>
            <button
              onClick={seedInitialDataIfEmpty}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
            >
              Carregar Dados de Exemplo
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentTransactions.map((t) => {
              const isIncome = t.type === 'income';
              const isPaid = t.status === 'paid';

              return (
                <div
                  key={t.id}
                  className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-850/40 transition rounded-lg px-1"
                >
                  <div
                    onClick={() => onOpenTransactionDetails(t)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {isIncome ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-slate-100 truncate">
                          {t.description}
                        </p>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                            t.context === 'personal'
                              ? 'bg-indigo-500/15 text-indigo-300'
                              : 'bg-emerald-500/15 text-emerald-300'
                          }`}
                        >
                          {t.context === 'personal' ? 'PF' : 'PJ'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {t.category} • {formatDateBR(t.date)}
                      </p>
                    </div>
                  </div>

                  {/* Amount and Status Toggle */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold ${
                          isIncome ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatDisplayValue(t.amount)}
                      </span>
                      <p className="text-[9px] text-slate-400">
                        {isPaid ? 'Pago' : 'Pendente'}
                      </p>
                    </div>

                    {/* Actions: Edit, Delete, Paid Toggle */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onOpenTransactionDetails(t)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                        title="Editar lançamento"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setItemToDelete(t)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Apagar lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick Mark Paid Toggle */}
                      <button
                        onClick={() => markAsPaid(t.id)}
                        className="p-1 text-slate-400 hover:text-emerald-400 transition ml-0.5"
                        title={isPaid ? 'Conta paga' : 'Clique para marcar como pago'}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-amber-400 animate-pulse" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão no Dashboard */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3 animate-scaleUp">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Apagar Lançamento?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Deseja apagar <strong className="text-slate-100">{itemToDelete.description}</strong> ({formatDisplayValue(itemToDelete.amount)})?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await deleteTransaction(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition active:scale-95"
              >
                Sim, Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
