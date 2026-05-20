/**
 * Domain Layer: Core Entity Interfaces
 * These are the pure business domain models used throughout the application.
 * No framework or implementation details here.
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'OTHER';

export interface Income {
  id: string;
  userId: string;
  accountId: string;
  description: string;
  amount: number;
  incomeType: IncomeType;
  date: Date;
  isRecurring: boolean;
  recurrencePattern?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IncomeType = 'SALARY' | 'BONUS' | 'FREELANCE' | 'INVESTMENT' | 'OTHER';

export interface FixedExpense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  expenseType: ExpenseType;
  dueDate: number; // Day of month (1-31)
  isActive: boolean;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseType =
  | 'RENT'
  | 'UTILITIES'
  | 'INSURANCE'
  | 'SUBSCRIPTION'
  | 'TRANSPORTATION'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'OTHER';

export interface Loan {
  id: string;
  userId: string;
  description: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  monthlyPayment: number;
  startDate: Date;
  endDate: Date;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyBalance {
  id: string;
  userId: string;
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  totalLoans: number;
  netBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDashboard {
  user: User;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalLoans: number;
  accountCount: number;
  upcomingExpenses: FixedExpense[];
  recentTransactions: Transaction[];
  monthlyBalance: MonthlyBalance[];
}

/**
 * Transaction type for recent transactions (can be Income or FixedExpense)
 */
export type Transaction = (Income | FixedExpense) & {
  date: Date;
};

/**
 * API Response Wrapper for consistent error handling
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Pagination Support
 */
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  hasMore: boolean;
}
