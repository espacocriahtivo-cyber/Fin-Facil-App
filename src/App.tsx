import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Header } from './components/Header';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ExportModal } from './components/ExportModal';
import { AuthModal } from './components/AuthModal';
import { FinFacilLogo } from './components/FinFacilLogo';
import { Transaction, TransactionType } from './types';
import { Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading: financialLoading, transactions, seedInitialDataIfEmpty } = useFinancial();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auto seed initial demo data if user is authenticated and has no data yet
  useEffect(() => {
    if (user && !financialLoading && transactions.length === 0) {
      seedInitialDataIfEmpty();
    }
  }, [user, financialLoading, transactions.length]);

  const handleOpenNewTransaction = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setModalInitialType(type);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setIsTransactionModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl flex flex-col items-center mb-6 animate-pulse">
          <FinFacilLogo size={74} variant="full" />
        </div>
        <Loader2 className="w-5 h-5 text-emerald-400 animate-spin mb-2" />
        <p className="text-xs text-slate-400 font-medium">Carregando o Fin Fácil App...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-3">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenNewTransaction={handleOpenNewTransaction}
            onOpenExport={() => setIsExportModalOpen(true)}
            onOpenNotifications={() => setIsNotificationsModalOpen(true)}
            onOpenTransactionDetails={handleEditTransaction}
            onGoToTransactions={() => setActiveTab('transactions')}
            onGoToReports={() => setActiveTab('reports')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {activeTab === 'reports' && <ReportsView />}

        {activeTab === 'settings' && (
          <SettingsView
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenNotifications={() => setIsNotificationsModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
      />

      {/* Modals & Dialogs */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        initialType={modalInitialType}
        editingTransaction={editingTransaction}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FinancialProvider>
        <MainAppContent />
      </FinancialProvider>
    </AuthProvider>
  );
}
