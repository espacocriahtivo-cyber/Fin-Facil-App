import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { 
  Transaction, 
  ScopeFilter, 
  PeriodFilter, 
  PendingAlert 
} from '../types';
import { handleFirestoreError, OperationType } from '../utils/errors';
import { calculatePendingAlerts, notifyPendingBillsIfAllowed } from '../utils/notifications';

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pendingTotal: number;
  personalIncome: number;
  personalExpense: number;
  personalBalance: number;
  businessIncome: number;
  businessExpense: number;
  businessBalance: number;
  proLaboreTotal: number;
}

interface FinancialContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  loading: boolean;
  scope: ScopeFilter;
  setScope: (scope: ScopeFilter) => void;
  period: PeriodFilter;
  setPeriod: (period: PeriodFilter) => void;
  summary: FinancialSummary;
  pendingAlerts: PendingAlert[];
  isOnline: boolean;
  showBalances: boolean;
  toggleShowBalances: () => void;
  formatDisplayValue: (value: number) => string;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearAllTransactions: () => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
  duplicateTransaction: (id: string) => Promise<string>;
  seedInitialDataIfEmpty: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<ScopeFilter>('all');
  const [period, setPeriod] = useState<PeriodFilter>('current_month');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showBalances, setShowBalances] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('equilibra_show_balances');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });

  const toggleShowBalances = () => {
    setShowBalances((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('equilibra_show_balances', String(next));
      }
      return next;
    });
  };

  const formatDisplayValue = (value: number): string => {
    if (!showBalances) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Realtime Firestore listener
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const path = 'transactions';
    const q = query(collection(db, path), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as Transaction);
        });

        // Sort descending by date
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Check pending bill alerts and trigger notification if permitted
  useEffect(() => {
    if (transactions.length > 0) {
      const alerts = calculatePendingAlerts(transactions);
      if (alerts.length > 0) {
        notifyPendingBillsIfAllowed(alerts);
      }
    }
  }, [transactions]);

  // Seed default demo transactions if empty
  const seedInitialDataIfEmpty = async () => {
    if (!user || transactions.length > 0) return;

    const today = new Date();
    const toDateStr = (d: Date) => d.toISOString().split('T')[0];

    const d1 = new Date(today);
    d1.setDate(d1.getDate() - 1);

    const d2 = new Date(today);
    d2.setDate(d2.getDate() - 3);

    const dDueSoon = new Date(today);
    dDueSoon.setDate(dDueSoon.getDate() + 2);

    const sampleData: Array<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = [
      // Pessoal
      {
        context: 'personal',
        type: 'income',
        amount: 3500.0,
        category: 'Salário Principal',
        description: 'Salário do Mês (CLT/Principal)',
        date: toDateStr(d2),
        status: 'paid',
        paymentMethod: 'Pix',
        notes: 'Depósito em conta corrente'
      },
      {
        context: 'personal',
        type: 'expense',
        amount: 850.0,
        category: 'Alimentação & Mercado',
        description: 'Compras mensais de supermercado',
        date: toDateStr(d1),
        status: 'paid',
        paymentMethod: 'Cartão de Débito',
      },
      {
        context: 'personal',
        type: 'expense',
        amount: 1200.0,
        category: 'Moradia (Aluguel, Luz, Água)',
        description: 'Aluguel do apartamento',
        date: toDateStr(today),
        dueDate: toDateStr(dDueSoon),
        status: 'pending',
        paymentMethod: 'Boleto Bancário',
        notes: 'Vence em 2 dias'
      },
      // Micro Negócio
      {
        context: 'business',
        type: 'income',
        amount: 5200.0,
        category: 'Prestação de Serviços',
        description: 'Projeto de Consultoria / Clientes',
        date: toDateStr(d2),
        status: 'paid',
        paymentMethod: 'Pix',
        notes: 'Nota Fiscal 104 emitida'
      },
      {
        context: 'business',
        type: 'expense',
        amount: 1450.0,
        category: 'Custos de Mercadoria / Insumos',
        description: 'Reposição de estoque com fornecedor',
        date: toDateStr(d1),
        status: 'paid',
        paymentMethod: 'Pix',
      },
      {
        context: 'business',
        type: 'expense',
        amount: 75.0,
        category: 'Impostos (DAS-MEI / Tributos)',
        description: 'Guia DAS-MEI Mensal',
        date: toDateStr(today),
        dueDate: toDateStr(today),
        status: 'pending',
        paymentMethod: 'Boleto Bancário',
        notes: 'Vence hoje!'
      },
      {
        context: 'business',
        type: 'expense',
        amount: 1500.0,
        category: 'Pró-Labore (Retirada Sócios)',
        description: 'Retirada de Pró-labore para conta Pessoal',
        date: toDateStr(d2),
        status: 'paid',
        paymentMethod: 'Transferência (TED)',
        notes: 'Transferido para despesas pessoais'
      }
    ];

    try {
      const batch = writeBatch(db);
      for (const item of sampleData) {
        const newDocRef = doc(collection(db, 'transactions'));
        batch.set(newDocRef, {
          ...item,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions');
    }
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');
    const path = 'transactions';
    const newDocRef = doc(collection(db, path));
    const now = new Date().toISOString();

    const cleanData: Record<string, any> = {
      userId: user.uid,
      context: data.context,
      type: data.type,
      amount: Number(data.amount),
      category: data.category.trim(),
      description: data.description.trim(),
      date: data.date,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };

    if (data.dueDate) cleanData.dueDate = data.dueDate;
    if (data.paymentMethod) cleanData.paymentMethod = data.paymentMethod;
    if (data.notes) cleanData.notes = data.notes.trim();

    const newTransaction: Transaction = {
      id: newDocRef.id,
      ...cleanData
    } as Transaction;

    // Optimistic local state update for instant 0ms UI response
    setTransactions((prev) => [newTransaction, ...prev]);

    try {
      await setDoc(newDocRef, cleanData);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return newDocRef.id;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const path = `transactions/${id}`;
    const cleanUpdates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };
    if (user) {
      cleanUpdates.userId = user.uid;
    }

    // Clean every field so no undefined values ever reach Firestore
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = key === 'amount' ? Number(value) : value;
      } else {
        cleanUpdates[key] = '';
      }
    }

    // Optimistic local state update for instant UI feedback
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...cleanUpdates } : t))
    );

    if (user) {
      try {
        await updateDoc(doc(db, 'transactions', id), cleanUpdates);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    const path = `transactions/${id}`;

    // Optimistic local state update: item is removed instantly
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (user) {
      try {
        await deleteDoc(doc(db, 'transactions', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  const clearAllTransactions = async () => {
    setTransactions([]);
    if (!user || transactions.length === 0) return;
    try {
      const batch = writeBatch(db);
      for (const t of transactions) {
        batch.delete(doc(db, 'transactions', t.id));
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'transactions');
    }
  };

  const markAsPaid = async (id: string) => {
    await updateTransaction(id, { status: 'paid' });
  };

  const duplicateTransaction = async (id: string): Promise<string> => {
    const existing = transactions.find((t) => t.id === id);
    if (!existing) throw new Error('Transação não encontrada');

    const todayStr = new Date().toISOString().split('T')[0];
    return await addTransaction({
      context: existing.context,
      type: existing.type,
      amount: existing.amount,
      category: existing.category,
      description: `${existing.description} (Cópia)`,
      date: todayStr,
      dueDate: existing.dueDate,
      status: existing.status,
      paymentMethod: existing.paymentMethod,
      notes: existing.notes
    });
  };

  // Filtered transactions by Scope & Period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter((t) => {
      // Scope filter
      if (scope !== 'all' && t.context !== scope) {
        return false;
      }

      // Period filter
      if (period === 'all') return true;

      const [y, m, d] = t.date.split('-').map(Number);
      const tDate = new Date(y, m - 1, d);

      if (period === 'current_month') {
        return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
      }
      if (period === 'last_month') {
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        return tDate.getFullYear() === lastMonthDate.getFullYear() && tDate.getMonth() === lastMonthDate.getMonth();
      }
      if (period === 'last_7_days') {
        const diffDays = (now.getTime() - tDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (period === 'last_30_days') {
        const diffDays = (now.getTime() - tDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      if (period === 'current_year') {
        return tDate.getFullYear() === currentYear;
      }

      return true;
    });
  }, [transactions, scope, period]);

  // Compute financial summary
  const summary = useMemo<FinancialSummary>(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let pendingTotal = 0;
    let personalIncome = 0;
    let personalExpense = 0;
    let businessIncome = 0;
    let businessExpense = 0;
    let proLaboreTotal = 0;

    for (const t of filteredTransactions) {
      const amount = Number(t.amount) || 0;

      if (t.status === 'pending') {
        pendingTotal += amount;
      } else {
        // Paid transactions contribute to actual realized balance
        if (t.type === 'income') {
          totalIncome += amount;
          if (t.context === 'personal') personalIncome += amount;
          if (t.context === 'business') businessIncome += amount;
        } else {
          totalExpense += amount;
          if (t.context === 'personal') personalExpense += amount;
          if (t.context === 'business') {
            businessExpense += amount;
            if (t.category.includes('Pró-Labore')) {
              proLaboreTotal += amount;
            }
          }
        }
      }
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      pendingTotal,
      personalIncome,
      personalExpense,
      personalBalance: personalIncome - personalExpense,
      businessIncome,
      businessExpense,
      businessBalance: businessIncome - businessExpense,
      proLaboreTotal,
    };
  }, [filteredTransactions]);

  const pendingAlerts = useMemo(() => {
    return calculatePendingAlerts(transactions);
  }, [transactions]);

  return (
    <FinancialContext.Provider
      value={{
        transactions,
        filteredTransactions,
        loading,
        scope,
        setScope,
        period,
        setPeriod,
        summary,
        pendingAlerts,
        isOnline,
        showBalances,
        toggleShowBalances,
        formatDisplayValue,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        clearAllTransactions,
        markAsPaid,
        duplicateTransaction,
        seedInitialDataIfEmpty
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
