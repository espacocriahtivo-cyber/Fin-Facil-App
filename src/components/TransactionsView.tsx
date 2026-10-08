import React, { useState, useMemo } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDateBR } from '../utils/export';
import { Transaction, TransactionType, TransactionStatus } from '../types';
import { 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  CheckCircle2, 
  Circle, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Edit3, 
  Plus
} from 'lucide-react';

interface TransactionsViewProps {
  onOpenNewTransaction: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenNewTransaction,
  onEditTransaction,
}) => {
  const { 
    filteredTransactions, 
    markAsPaid, 
    updateTransaction, 
    deleteTransaction, 
    duplicateTransaction,
    formatDisplayValue
  } = useFinancial();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | 'all'>('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);

  // Filter transactions
  const results = useMemo(() => {
    return filteredTransactions.filter((t) => {
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.paymentMethod && t.paymentMethod.toLowerCase().includes(q)) ||
        t.amount.toString().includes(q)
      );
    });
  }, [filteredTransactions, selectedType, selectedStatus, searchQuery]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    for (const t of results) {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    }
    return groups;
  }, [results]);

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const toggleStatus = async (t: Transaction) => {
    const newStatus = t.status === 'paid' ? 'pending' : 'paid';
    await updateTransaction(t.id, { status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este lançamento?')) {
      await deleteTransaction(id);
      setMenuOpenId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateTransaction(id);
    setMenuOpenId(null);
  };

  return (
    <div className="space-y-3 pb-24 animate-fadeIn">
      {/* Header and Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por descrição, categoria..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
        <button
          onClick={onOpenNewTransaction}
          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow transition active:scale-95"
          title="Novo Lançamento"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        {/* Type Filter */}
        <button
          onClick={() => setSelectedType('all')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            selectedType === 'all'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          Todos Tipos
        </button>
        <button
          onClick={() => setSelectedType('income')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            selectedType === 'income'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          Receitas
        </button>
        <button
          onClick={() => setSelectedType('expense')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            selectedType === 'expense'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          Despesas
        </button>

        <span className="text-slate-600">|</span>

        {/* Status Filter */}
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            selectedStatus === 'all'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          Todos Status
        </button>
        <button
          onClick={() => setSelectedStatus('paid')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            selectedStatus === 'paid'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          Pagos
        </button>
        <button
          onClick={() => setSelectedStatus('pending')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            selectedStatus === 'pending'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          Pendentes
        </button>
      </div>

      {/* Transaction List Grouped by Date */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
          <p className="text-sm font-medium text-slate-300 mb-1">Nenhum lançamento encontrado</p>
          <p className="text-xs text-slate-500 mb-4">
            {searchQuery
              ? 'Tente ajustar os filtros ou a busca digitada.'
              : 'Adicione sua primeira receita ou despesa para começar.'}
          </p>
          <button
            onClick={onOpenNewTransaction}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
          >
            Adicionar Transação
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDates.map((dateStr) => {
            const list = groupedTransactions[dateStr];
            const dateTotal = list.reduce((acc, curr) => {
              const val = curr.status === 'paid' ? curr.amount : 0;
              return curr.type === 'income' ? acc + val : acc - val;
            }, 0);

            return (
              <div key={dateStr} className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-sm">
                {/* Date header */}
                <div className="px-3.5 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300">
                    {formatDateBR(dateStr)}
                  </span>
                  <span
                    className={`font-medium ${
                      dateTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Saldo do dia: {formatDisplayValue(dateTotal)}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-slate-800/60">
                  {list.map((t) => {
                    const isIncome = t.type === 'income';
                    const isPaid = t.status === 'paid';
                    const isMenuOpen = menuOpenId === t.id;

                    return (
                      <div
                        key={t.id}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-slate-850/40 transition relative"
                      >
                        {/* Status Toggle & Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => toggleStatus(t)}
                            className="p-1 text-slate-400 hover:text-emerald-400 transition shrink-0"
                            title={isPaid ? 'Marcar como Pendente' : 'Marcar como Pago'}
                          >
                            {isPaid ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-amber-400 animate-pulse" />
                            )}
                          </button>

                          <div
                            onClick={() => onEditTransaction(t)}
                            className="cursor-pointer min-w-0 flex-1"
                          >
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-slate-100 truncate">
                                {t.description}
                              </p>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                                  t.context === 'personal'
                                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                                }`}
                              >
                                {t.context === 'personal' ? 'Pessoal' : 'Negócio'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="truncate">{t.category}</span>
                              {t.paymentMethod && <span>• {t.paymentMethod}</span>}
                              {t.dueDate && !isPaid && (
                                <span className="text-amber-400 font-medium">
                                  • Vence: {formatDateBR(t.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions Menu */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span
                              className={`text-xs font-bold ${
                                isIncome ? 'text-emerald-400' : 'text-slate-100'
                              }`}
                            >
                              {isIncome ? '+' : '-'} {formatDisplayValue(t.amount)}
                            </span>
                            <div className="flex justify-end">
                              <span
                                className={`text-[9px] px-1 rounded font-medium ${
                                  isPaid
                                    ? 'text-emerald-400'
                                    : 'text-amber-400 bg-amber-400/10'
                                }`}
                              >
                                {isPaid ? 'Pago' : 'Pendente'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Quick Direct Edit Button */}
                            <button
                              onClick={() => onEditTransaction(t)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition active:scale-95"
                              title="Editar lançamento"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Quick Direct Delete Button */}
                            <button
                              onClick={() => setItemToDelete(t)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-95"
                              title="Apagar lançamento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="relative">
                              <button
                                onClick={() => setMenuOpenId(isMenuOpen ? null : t.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                                title="Mais opções"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu */}
                              {isMenuOpen && (
                                <div className="absolute right-0 top-7 z-20 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 text-xs text-slate-200 animate-fadeIn">
                                  <button
                                    onClick={() => {
                                      onEditTransaction(t);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-left"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                                    <span>Editar</span>
                                  </button>

                                  <button
                                    onClick={() => handleDuplicate(t.id)}
                                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-left"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Duplicar</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setMenuOpenId(null);
                                      setItemToDelete(t);
                                    }}
                                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-rose-400 text-left"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Excluir</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação Rápida de Exclusão */}
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
