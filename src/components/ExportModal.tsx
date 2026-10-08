import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { exportTransactionsToExcel, exportTransactionsToPDF } from '../utils/export';
import { ScopeFilter, PeriodFilter } from '../types';
import { X, FileText, FileSpreadsheet, Download, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { transactions } = useFinancial();

  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf');
  const [selectedScope, setSelectedScope] = useState<ScopeFilter>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('current_month');
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: 'current_month', label: 'Este Mês' },
    { id: 'last_month', label: 'Mês Anterior' },
    { id: 'last_30_days', label: 'Últimos 30 Dias' },
    { id: 'current_year', label: 'Ano Atual' },
    { id: 'all', label: 'Todo o Histórico' },
  ];

  const handleDownload = () => {
    setDownloading(true);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Filter transactions according to export modal choices
    const toExport = transactions.filter((t) => {
      if (selectedScope !== 'all' && t.context !== selectedScope) return false;

      if (selectedPeriod === 'all') return true;

      const [y, m, d] = t.date.split('-').map(Number);
      const tDate = new Date(y, m - 1, d);

      if (selectedPeriod === 'current_month') {
        return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
      }
      if (selectedPeriod === 'last_month') {
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        return tDate.getFullYear() === lastMonthDate.getFullYear() && tDate.getMonth() === lastMonthDate.getMonth();
      }
      if (selectedPeriod === 'last_30_days') {
        const diffDays = (now.getTime() - tDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      if (selectedPeriod === 'current_year') {
        return tDate.getFullYear() === currentYear;
      }

      return true;
    });

    const periodLabel = periods.find((p) => p.id === selectedPeriod)?.label || 'Geral';

    setTimeout(() => {
      if (selectedFormat === 'pdf') {
        exportTransactionsToPDF(toExport, selectedScope, periodLabel);
      } else {
        exportTransactionsToExcel(toExport, selectedScope, periodLabel);
      }
      setDownloading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Exportação Financeira</h3>
              <p className="text-[11px] text-slate-400">Gere relatórios para você e seu contador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Formato do Arquivo
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedFormat('pdf')}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border transition text-left ${
                selectedFormat === 'pdf'
                  ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-5 h-5 text-rose-400" />
              <div>
                <p className="text-xs font-semibold text-white">Relatório PDF</p>
                <p className="text-[10px] text-slate-400">Pronto para imprimir</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFormat('excel')}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border transition text-left ${
                selectedFormat === 'excel'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs font-semibold text-white">Planilha Excel</p>
                <p className="text-[10px] text-slate-400">Arquivo .xlsx com abas</p>
              </div>
            </button>
          </div>
        </div>

        {/* Scope Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Âmbito
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setSelectedScope('all')}
              className={`py-1.5 rounded-lg transition font-medium ${
                selectedScope === 'all'
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ambos
            </button>
            <button
              type="button"
              onClick={() => setSelectedScope('personal')}
              className={`py-1.5 rounded-lg transition font-medium ${
                selectedScope === 'personal'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pessoal
            </button>
            <button
              type="button"
              onClick={() => setSelectedScope('business')}
              className={`py-1.5 rounded-lg transition font-medium ${
                selectedScope === 'business'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Negócio
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Período
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as PeriodFilter)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Download Action */}
        <div className="pt-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Gerando arquivo...' : `Baixar ${selectedFormat.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
