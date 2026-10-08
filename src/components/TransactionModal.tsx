import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { 
  Transaction, 
  TransactionContext, 
  TransactionType, 
  TransactionStatus 
} from '../types';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/categories';
import { X, CheckCircle2, Building2, User, Calendar, Tag, CreditCard, AlignLeft, Trash2, AlertTriangle } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  initialType = 'expense',
  editingTransaction,
  onClose,
}) => {
  const { addTransaction, updateTransaction, deleteTransaction, scope } = useFinancial();

  const [type, setType] = useState<TransactionType>(initialType);
  const [context, setContext] = useState<TransactionContext>(
    scope === 'business' ? 'business' : 'personal'
  );
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<TransactionStatus>('paid');
  const [dueDate, setDueDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Pix');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Synchronize when editing or opening
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setContext(editingTransaction.context);
      setAmountStr(editingTransaction.amount.toString());
      setDescription(editingTransaction.description);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setStatus(editingTransaction.status);
      setDueDate(editingTransaction.dueDate || '');
      setPaymentMethod(editingTransaction.paymentMethod || 'Pix');
      setNotes(editingTransaction.notes || '');
    } else {
      setType(initialType);
      setContext(scope === 'business' ? 'business' : 'personal');
      setAmountStr('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('paid');
      setDueDate('');
      setPaymentMethod('Pix');
      setNotes('');
      // Set default category
      const defaultCat = CATEGORIES.find(
        (c) => c.context === (scope === 'business' ? 'business' : 'personal') && c.defaultType === initialType
      );
      setCategory(defaultCat ? defaultCat.name : '');
    }
    setShowDeleteConfirm(false);
    setErrorMsg('');
  }, [editingTransaction, initialType, isOpen, scope]);

  if (!isOpen) return null;

  // Filter categories matching current context and type
  const availableCategories = CATEGORIES.filter(
    (c) => c.context === context && c.defaultType === type
  );

  const handleDeleteTransaction = async () => {
    if (!editingTransaction) return;
    setIsSubmitting(true);
    try {
      await deleteTransaction(editingTransaction.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao excluir lançamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Por favor, informe um valor válido maior que zero.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Informe uma descrição para o lançamento.');
      return;
    }

    if (!category.trim()) {
      setErrorMsg('Selecione uma categoria.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          type,
          context,
          amount: parsedAmount,
          description: description.trim(),
          category: category.trim(),
          date,
          status,
          dueDate: status === 'pending' ? (dueDate || date) : '',
          paymentMethod,
          notes: notes.trim(),
        });
      } else {
        await addTransaction({
          type,
          context,
          amount: parsedAmount,
          description: description.trim(),
          category: category.trim(),
          date,
          status,
          dueDate: status === 'pending' ? (dueDate || date) : '',
          paymentMethod,
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar transação. Verifique sua conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h3>
          <div className="flex items-center gap-1.5">
            {editingTransaction && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className={`p-1.5 rounded-xl transition ${
                  showDeleteConfirm
                    ? 'bg-rose-500 text-white'
                    : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/15'
                }`}
                title="Apagar este lançamento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Toggle Type: Despesa vs Receita */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const defaultCat = CATEGORIES.find(
                  (c) => c.context === context && c.defaultType === 'expense'
                );
                if (defaultCat) setCategory(defaultCat.name);
              }}
              className={`py-2 rounded-xl transition ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              - Despesa
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const defaultCat = CATEGORIES.find(
                  (c) => c.context === context && c.defaultType === 'income'
                );
                if (defaultCat) setCategory(defaultCat.name);
              }}
              className={`py-2 rounded-xl transition ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              + Receita
            </button>
          </div>

          {/* Toggle Scope: Pessoal vs Micro Negócio */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Âmbito Financeiro
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setContext('personal');
                  const defaultCat = CATEGORIES.find(
                    (c) => c.context === 'personal' && c.defaultType === type
                  );
                  if (defaultCat) setCategory(defaultCat.name);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition ${
                  context === 'personal'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Controle Pessoal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setContext('business');
                  const defaultCat = CATEGORIES.find(
                    (c) => c.context === 'business' && c.defaultType === type
                  );
                  if (defaultCat) setCategory(defaultCat.name);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition ${
                  context === 'business'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Micro Negócio (PJ)</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Valor (R$)</span>
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="text-[10px] text-slate-400 hover:text-rose-400"
                >
                  Limpar
                </button>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0,00"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-2xl font-black text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Quick Value Helper Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
              <span className="text-[10px] text-slate-500 shrink-0">Atalhos:</span>
              {[20, 50, 100, 200, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    const current = parseFloat(amountStr) || 0;
                    setAmountStr((current + val).toString());
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium transition active:scale-95 shrink-0"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Descrição
            </label>
            <input
              type="text"
              required
              maxLength={160}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Fornecedor de embalagens, Aluguel, Venda cliente..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Category Selector Chips */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Categoria</span>
              <span className="text-[10px] text-emerald-400 font-semibold">{category}</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              {category && !availableCategories.some((c) => c.name === category) && (
                <button
                  type="button"
                  onClick={() => setCategory(category)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-200 text-slate-900 shadow"
                >
                  {category}
                </button>
              )}
              {availableCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      isSelected
                        ? 'bg-slate-200 text-slate-900 font-bold shadow'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ou digite o nome da categoria..."
              className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Data
                </label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setDate(today);
                    }}
                    className={`px-1.5 py-0.2 rounded transition ${
                      date === new Date().toISOString().split('T')[0]
                        ? 'text-emerald-400 font-bold bg-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setDate(yesterday.toISOString().split('T')[0]);
                    }}
                    className="px-1.5 py-0.2 rounded text-slate-400 hover:text-slate-200"
                  >
                    Ontem
                  </button>
                </div>
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setStatus('paid')}
                  className={`py-1 rounded-lg font-medium transition ${
                    status === 'paid'
                      ? 'bg-teal-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Pago
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`py-1 rounded-lg font-medium transition ${
                    status === 'pending'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Pendente
                </button>
              </div>
            </div>
          </div>

          {/* Due date if pending */}
          {status === 'pending' && (
            <div className="space-y-1 animate-fadeIn">
              <label className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Data de Vencimento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> Forma de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <AlignLeft className="w-3 h-3" /> Observações (Opcional)
            </label>
            <textarea
              maxLength={500}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Nota fiscal, número do pedido, parcelamento..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          {/* Submit and Delete Actions */}
          <div className="pt-2 space-y-2">
            {showDeleteConfirm ? (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Deseja realmente apagar este lançamento?</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  O registro será removido permanentemente do seu saldo e relatórios.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteTransaction}
                    disabled={isSubmitting}
                    className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center justify-center gap-1 shadow-md shadow-rose-600/30 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Apagando...' : 'Sim, Apagar'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Salvando...'
                    : editingTransaction
                    ? 'Atualizar Lançamento'
                    : 'Salvar Lançamento'}
                </button>

                {editingTransaction && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs flex items-center justify-center gap-1.5 border border-rose-500/20 transition active:scale-[0.98]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Apagar este Lançamento</span>
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
