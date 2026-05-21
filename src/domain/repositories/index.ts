/**
 * Domain Layer: Repository Interfaces
 * Define contracts for data access without implementation details.
 * Implementations will be in the infrastructure layer.
 */

import {
  User,
  Account,
  Income,
  FixedExpense,
  Loan,
  MonthlyBalance,
  UserDashboard,
} from '../entities';

export interface IUserRepository {
  getUsers(): Promise<User[]>;
  getCurrentUser(): Promise<User>;
  getUserById(id: string): Promise<User>;
  getUserDashboard(userId?: string): Promise<UserDashboard>;
  updateUser(user: Partial<User>): Promise<User>;
}

export interface IAccountRepository {
  getAccounts(filters?: { userId?: string }): Promise<Account[]>;
  getAccountById(id: string): Promise<Account>;
  createAccount(data: CreateAccountInput): Promise<Account>;
  updateAccount(id: string, data: UpdateAccountInput): Promise<Account>;
  deleteAccount(id: string): Promise<void>;
}

export interface IIncomeRepository {
  getIncomes(
    filters?: IncomeFilters
  ): Promise<Income[]>;
  getIncomeById(id: string): Promise<Income>;
  createIncome(data: CreateIncomeInput): Promise<Income>;
  updateIncome(id: string, data: UpdateIncomeInput): Promise<Income>;
  deleteIncome(id: string): Promise<void>;
}

export interface IFixedExpenseRepository {
  getFixedExpenses(filters?: ExpenseFilters): Promise<FixedExpense[]>;
  getFixedExpenseById(id: string): Promise<FixedExpense>;
  createFixedExpense(data: CreateFixedExpenseInput): Promise<FixedExpense>;
  updateFixedExpense(
    id: string,
    data: UpdateFixedExpenseInput
  ): Promise<FixedExpense>;
  deleteFixedExpense(id: string): Promise<void>;
}

export interface ILoanRepository {
  getLoans(filters?: LoanFilters): Promise<Loan[]>;
  getLoanById(id: string): Promise<Loan>;
  createLoan(data: CreateLoanInput): Promise<Loan>;
  updateLoan(id: string, data: UpdateLoanInput): Promise<Loan>;
  deleteLoan(id: string): Promise<void>;
}

export interface IMonthlyBalanceRepository {
  getMonthlyBalances(
    year: number
  ): Promise<MonthlyBalance[]>;
  getMonthlyBalance(year: number, month: number): Promise<MonthlyBalance>;
}

/**
 * Input/Update DTOs
 */

export interface CreateAccountInput {
  name: string;
  type: string;
  balance: number;
  currency: string;
  description?: string;
}

export interface UpdateAccountInput {
  name?: string;
  balance?: number;
  currency?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateIncomeInput {
  description: string;
  amount: number;
  incomeType: string;
  date: Date;
  accountId: string;
  isRecurring: boolean;
  recurrencePattern?: string;
}

export interface UpdateIncomeInput {
  description?: string;
  amount?: number;
  incomeType?: string;
  date?: Date;
  accountId?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

export interface CreateFixedExpenseInput {
  description: string;
  amount: number;
  expenseType: string;
  dueDate: number;
  accountId: string;
}

export interface UpdateFixedExpenseInput {
  description?: string;
  amount?: number;
  expenseType?: string;
  dueDate?: number;
  accountId?: string;
  isActive?: boolean;
}

export interface CreateLoanInput {
  description: string;
  totalAmount: number;
  interestRate: number;
  monthlyPayment: number;
  startDate: Date;
  endDate: Date;
  accountId: string;
}

export interface UpdateLoanInput {
  description?: string;
  totalAmount?: number;
  remainingAmount?: number;
  interestRate?: number;
  monthlyPayment?: number;
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
}

/**
 * Filter types for queries
 */

export interface IncomeFilters {
  userId?: string;
  accountId?: string;
  startDate?: Date;
  endDate?: Date;
  incomeType?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ExpenseFilters {
  userId?: string;
  accountId?: string;
  expenseType?: string;
  isActive?: boolean;
}

export interface LoanFilters {
  userId?: string;
  accountId?: string;
  isActive?: boolean;
}
