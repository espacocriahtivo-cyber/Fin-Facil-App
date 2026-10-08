export type TransactionContext = 'personal' | 'business';
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'paid' | 'pending';

export interface Transaction {
  id: string;
  userId: string;
  context: TransactionContext;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  status: TransactionStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  userId: string;
  displayName?: string;
  businessName?: string;
  currency?: string;
  notificationsEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ScopeFilter = 'all' | 'personal' | 'business';
export type PeriodFilter = 'current_month' | 'last_month' | 'last_7_days' | 'last_30_days' | 'current_year' | 'all';

export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
  context: TransactionContext;
}

export interface PendingAlert {
  transaction: Transaction;
  status: 'overdue' | 'due_today' | 'due_soon';
  daysDiff: number;
}
