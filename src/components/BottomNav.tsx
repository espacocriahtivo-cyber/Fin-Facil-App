import React from 'react';
import { 
  Home, 
  ArrowLeftRight, 
  Plus, 
  PieChart, 
  Settings 
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'transactions' | 'reports' | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenNewTransaction,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-[env(safe-area-inset-bottom,8px)] pt-1 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Tab: Dashboard */}
        <button
          onClick={() => onChangeTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Início</span>
        </button>

        {/* Tab: Transactions */}
        <button
          onClick={() => onChangeTab('transactions')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
            activeTab === 'transactions'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Lançamentos</span>
        </button>

        {/* Central Action FAB: Add Transaction */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            onClick={onOpenNewTransaction}
            className="w-13 h-13 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            aria-label="Adicionar Nova Transação"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab: Reports */}
        <button
          onClick={() => onChangeTab('reports')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
            activeTab === 'reports'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieChart className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Relatórios</span>
        </button>

        {/* Tab: Settings */}
        <button
          onClick={() => onChangeTab('settings')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
            activeTab === 'settings'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Ajustes</span>
        </button>
      </div>
    </div>
  );
};
