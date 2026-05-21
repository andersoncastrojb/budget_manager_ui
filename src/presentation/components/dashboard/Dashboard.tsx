'use client';

import React, { useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useAccounts,
  useFixedExpenses,
  useIncomes,
  useLoans,
  useUserDashboard,
  queryKeys,
} from '@/application/hooks/useUserData';
import { accountRepository } from '@/infrastructure/api/repositories/AccountRepository';
import { fixedExpenseRepository } from '@/infrastructure/api/repositories/FixedExpenseRepository';
import { incomeRepository } from '@/infrastructure/api/repositories/IncomeRepository';
import { loanRepository } from '@/infrastructure/api/repositories/LoanRepository';
import { Button, Card, ErrorAlert, Modal, SkeletonLoader } from '../common';
import { formatCurrency } from '@/shared/utils/formatters';
import { Account, FixedExpense, Income, Loan } from '@/domain/entities';

type EntityType = 'account' | 'income' | 'expense' | 'loan';

type EntityMode = 'create' | 'edit';

type EntityPayload = Record<string, unknown>;

interface ModalState {
  activeType: EntityType | null;
  selectedItem: Account | Income | FixedExpense | Loan | null;
  formValues: EntityPayload;
  mode: EntityMode;
}

const MetricCard: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  trend?: { percentage: number; direction: 'up' | 'down' };
}> = ({ icon, label, value, trend }) => {
  const trendColor = trend?.direction === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="flex items-start gap-4">
      <div className="text-4xl">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <p className={`text-sm ${trendColor} mt-2`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}% from last month
          </p>
        )}
      </div>
    </Card>
  );
};

const formatDateInput = (value?: Date | string): string => {
  if (!value) {
    return '';
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
};

const formatToISODateTime = (value?: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 19);
  }
  const trimmed = String(value).trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.includes('T')) {
    return trimmed;
  }
  return `${trimmed}T00:00:00`;
};

export const Dashboard: React.FC = () => {
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get('userId') ?? undefined;
  const {
    data: dashboard,
    isLoading,
    error,
    refetch,
  } = useUserDashboard(selectedUserId);
  const accounts = useAccounts(selectedUserId);
  const incomes = useIncomes(selectedUserId);
  const fixedExpenses = useFixedExpenses(selectedUserId);
  const loans = useLoans(selectedUserId);
  const queryClient = useQueryClient();

  // Process month state and selector
  const [processMonth, setProcessMonth] = useState<number>(() => new Date().getMonth());
  const [processYear, setProcessYear] = useState<number>(() => new Date().getFullYear());

  const monthsList = useMemo(() => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ], []);

  // Filter Incomes by selected process month and year
  const filteredIncomes = useMemo(() => {
    if (!incomes.data) return [];
    return incomes.data.filter((income) => {
      if (!income.date) return false;
      const d = new Date(income.date);
      return d.getMonth() === processMonth && d.getFullYear() === processYear;
    });
  }, [incomes.data, processMonth, processYear]);

  // Filter Fixed Expenses active in this month
  const filteredExpenses = useMemo(() => {
    if (!fixedExpenses.data) return [];
    return fixedExpenses.data.filter((expense) => {
      const expenseStart = expense.startDate ? new Date(expense.startDate) : (expense.createdAt ? new Date(expense.createdAt) : null);
      const expenseEnd = expense.endDate ? new Date(expense.endDate) : null;
      
      const targetDateStart = new Date(processYear, processMonth, 1);

      if (expenseStart) {
        const startCompare = new Date(expenseStart.getFullYear(), expenseStart.getMonth(), 1);
        if (startCompare > targetDateStart) return false;
      }
      
      if (expenseEnd) {
        const endCompare = new Date(expenseEnd.getFullYear(), expenseEnd.getMonth(), 1);
        if (endCompare < targetDateStart) return false;
      }

      return true;
    });
  }, [fixedExpenses.data, processMonth, processYear]);

  // Filter Loans active in this month
  const filteredLoans = useMemo(() => {
    if (!loans.data) return [];
    return loans.data.filter((loan) => {
      const loanStart = loan.startDate ? new Date(loan.startDate) : (loan.createdAt ? new Date(loan.createdAt) : null);
      const loanEnd = loan.endDate ? new Date(loan.endDate) : null;
      
      const targetDateStart = new Date(processYear, processMonth, 1);

      if (loanStart) {
        const startCompare = new Date(loanStart.getFullYear(), loanStart.getMonth(), 1);
        if (startCompare > targetDateStart) return false;
      }
      
      if (loanEnd) {
        const endCompare = new Date(loanEnd.getFullYear(), loanEnd.getMonth(), 1);
        if (endCompare < targetDateStart) return false;
      }

      return true;
    });
  }, [loans.data, processMonth, processYear]);

  // Calculated totals for metrics (keeps the dashboard dynamic!)
  const totalIncomeFiltered = useMemo(() => {
    return filteredIncomes.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredIncomes]);

  const totalExpensesFiltered = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  const totalLoansFiltered = useMemo(() => {
    return filteredLoans.reduce((sum, item) => sum + item.remainingAmount, 0);
  }, [filteredLoans]);

  const totalBalanceFiltered = totalIncomeFiltered - totalExpensesFiltered - totalLoansFiltered;

  const [modalState, setModalState] = useState<ModalState>({
    activeType: null,
    selectedItem: null,
    formValues: {},
    mode: 'create',
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const submitLockRef = useRef(false);

  const openModal = (
    type: EntityType,
    item?: Account | Income | FixedExpense | Loan
  ) => {
    setAlert(null);
    let initialValues: EntityPayload = {};

    if (item) {
      initialValues = {
        ...item,
        date: formatDateInput((item as Income).date),
        startDate: formatDateInput((item as Loan | FixedExpense).startDate),
        endDate: formatDateInput((item as Loan | FixedExpense).endDate),
      };
      if (type === 'expense') {
        initialValues.frequency = (item as FixedExpense).expenseType ?? 'MONTHLY';
      }
    } else {
      initialValues = {
        date: '',
        startDate: '',
        endDate: '',
        isActive: true,
        isRecurring: false,
        frequency: 'MONTHLY',
      };
    }

    setModalState({
      activeType: type,
      selectedItem: item ?? null,
      formValues: initialValues,
      mode: item ? 'edit' : 'create',
    });
  };

  const closeModal = () => {
    setModalState({ activeType: null, selectedItem: null, formValues: {}, mode: 'create' });
  };

  const invalidateQueries = (type: EntityType) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.dashboard(selectedUserId) });
    refetch();
    if (type === 'account') {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.list(selectedUserId) });
      accounts.refetch();
    }
    if (type === 'income') {
      queryClient.invalidateQueries({ queryKey: queryKeys.income.list(selectedUserId) });
      incomes.refetch();
    }
    if (type === 'expense') {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list(selectedUserId) });
      fixedExpenses.refetch();
    }
    if (type === 'loan') {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.list(selectedUserId) });
      loans.refetch();
    }
  };

  const updateMutation = useMutation({
    mutationFn: async ({
      type,
      id,
      payload,
    }: {
      type: EntityType;
      id: string;
      payload: EntityPayload;
    }) => {
      switch (type) {
        case 'account':
          return accountRepository.updateAccount(id, payload);
        case 'income':
          return incomeRepository.updateIncome(id, payload);
        case 'expense':
          return fixedExpenseRepository.updateFixedExpense(id, payload);
        case 'loan':
          return loanRepository.updateLoan(id, payload);
        default:
          throw new Error('Unsupported entity type');
      }
    },
    onSuccess: (_, variables) => {
      invalidateQueries(variables.type);
      setAlert({ type: 'success', message: 'Item updated successfully.' });
      closeModal();
    },
    onError: () => {
      setAlert({ type: 'error', message: 'Unable to update the item. Please try again.' });
    },
    onSettled: () => {
      submitLockRef.current = false;
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({
      type,
      payload,
    }: {
      type: EntityType;
      payload: EntityPayload;
    }) => {
      switch (type) {
        case 'account':
          return accountRepository.createAccount(payload);
        case 'income':
          return incomeRepository.createIncome(payload);
        case 'expense':
          return fixedExpenseRepository.createFixedExpense(payload);
        case 'loan':
          return loanRepository.createLoan(payload);
        default:
          throw new Error('Unsupported entity type');
      }
    },
    onSuccess: (_, variables) => {
      invalidateQueries(variables.type);
      setAlert({ type: 'success', message: 'Item created successfully.' });
      closeModal();
    },
    onError: () => {
      setAlert({ type: 'error', message: 'Unable to create the item. Please try again.' });
    },
    onSettled: () => {
      submitLockRef.current = false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: EntityType; id: string }) => {
      switch (type) {
        case 'account':
          return accountRepository.deleteAccount(id);
        case 'income':
          return incomeRepository.deleteIncome(id);
        case 'expense':
          return fixedExpenseRepository.deleteFixedExpense(id);
        case 'loan':
          return loanRepository.deleteLoan(id);
        default:
          throw new Error('Unsupported entity type');
      }
    },
    onSuccess: (_, variables) => {
      invalidateQueries(variables.type);
      setAlert({ type: 'success', message: 'Item deleted successfully.' });
    },
    onError: () => {
      setAlert({ type: 'error', message: 'Unable to delete the item. Please try again.' });
    },
  });

  const handleFieldChange = (field: string, value: string | boolean | number) => {
    setModalState((current) => ({
      ...current,
      formValues: {
        ...current.formValues,
        [field]: value,
      },
    }));
  };

  const buildPayload = (): EntityPayload => {
    const values = modalState.formValues;
    if (!modalState.activeType) {
      return {};
    }

    const basePayload: EntityPayload = {
      ...values,
    };

    if (modalState.activeType === 'account') {
      return {
        idUser: selectedUserId ? Number(selectedUserId) : undefined,
        name: String(basePayload.name ?? ''),
        type: String(basePayload.type ?? 'SAVINGS'),
        balance: Number(basePayload.balance ?? 0),
      };
    }

    if (modalState.activeType === 'income') {
      const typeMap: Record<string, string> = {
        SALARY: 'SALARY',
        BONUS: 'BONUS',
        FREELANCE: 'OTHER',
        INVESTMENT: 'OTHER',
        OTHER: 'OTHER',
      };
      const typeVal = typeMap[String(basePayload.incomeType ?? 'OTHER')] ?? 'OTHER';

      return {
        idAccount: basePayload.idAccount ? Number(basePayload.idAccount) : undefined,
        type: typeVal,
        value: Number(basePayload.amount ?? 0),
        description: String(basePayload.description ?? ''),
        date: formatToISODateTime(basePayload.date),
      };
    }

    if (modalState.activeType === 'expense') {
      return {
        idUser: selectedUserId ? Number(selectedUserId) : undefined,
        amount: Number(basePayload.amount ?? 0),
        description: String(basePayload.description ?? ''),
        frequency: String(basePayload.frequency ?? 'MONTHLY'),
        startDate: formatToISODateTime(basePayload.startDate),
        endDate: formatToISODateTime(basePayload.endDate),
      };
    }

    if (modalState.activeType === 'loan') {
      return {
        idUser: selectedUserId ? Number(selectedUserId) : undefined,
        lender: String(basePayload.description ?? basePayload.lender ?? ''),
        amount: Number(basePayload.totalAmount ?? basePayload.amount ?? 0),
        loanDate: formatToISODateTime(basePayload.startDate ?? basePayload.loanDate),
        limitToPayDate: formatToISODateTime(basePayload.endDate ?? basePayload.limitToPayDate),
        status: String(basePayload.status ?? 'PENDING'),
      };
    }

    return {};
  };

  const handleSubmit = () => {
    if (!modalState.activeType) {
      return;
    }
    // prevent duplicate submissions
    if (submitLockRef.current) return;
    submitLockRef.current = true;

    const payload = buildPayload();

    if (modalState.mode === 'create') {
      if (!createMutation.isPending) {
        createMutation.mutate({ type: modalState.activeType, payload });
      } else {
        submitLockRef.current = false;
      }
      return;
    }

    if (!modalState.selectedItem?.id) {
      submitLockRef.current = false;
      return;
    }

    if (!updateMutation.isPending) {
      updateMutation.mutate({ type: modalState.activeType, id: modalState.selectedItem.id, payload });
    } else {
      submitLockRef.current = false;
    }
  };

  const handleDelete = (type: EntityType, id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    deleteMutation.mutate({ type, id });
  };

  const selectedUserName = dashboard?.user?.name ?? 'User';

  const counts = useMemo(
    () => ({
      accounts: accounts.data?.length ?? 0,
      incomes: filteredIncomes.length,
      expenses: filteredExpenses.length,
      loans: filteredLoans.length,
    }),
    [accounts.data, filteredIncomes, filteredExpenses, filteredLoans]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <SkeletonLoader count={3} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorAlert
          message="Failed to load dashboard data"
          details="Unable to fetch your financial summary. Please try again."
        />
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {selectedUserName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage the selected user&apos;s financial details and update items directly from the dashboard.
          </p>
        </div>
      </div>

      {/* Sleek Period Selector Dashboard Control Panel */}
      <div className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            <span>📅</span> Period Control
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-2">
            Current Month Process: <span className="text-blue-600 font-extrabold">{monthsList[processMonth]} {processYear}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Metrics and list elements below are dynamically filtered to show records active in the chosen month.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Month</span>
            <select
              value={processMonth}
              onChange={(e) => setProcessMonth(Number(e.target.value))}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {monthsList.map((monthName, idx) => (
                <option key={idx} value={idx}>
                  {monthName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Year</span>
            <select
              value={processYear}
              onChange={(e) => setProcessYear(Number(e.target.value))}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {alert && (
        <ErrorAlert
          message={alert.message}
          onDismiss={() => setAlert(null)}
          className={alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-900' : ''}
        />
      )}

      {/* Dynamic metric counters reflecting the selected process period */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon="💰" label="Total Balance" value={formatCurrency(totalBalanceFiltered)} />
        <MetricCard icon="📈" label={`Income (${monthsList[processMonth]})`} value={formatCurrency(totalIncomeFiltered)} />
        <MetricCard icon="💳" label={`Expenses (${monthsList[processMonth]})`} value={formatCurrency(totalExpensesFiltered)} />
        <MetricCard icon="📋" label={`Loans (${monthsList[processMonth]})`} value={formatCurrency(totalLoansFiltered)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Accounts" subtitle={`Manage ${counts.accounts} account(s)`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500">Create, edit, or remove accounts for the selected user.</p>
            <Button variant="secondary" size="sm" onClick={() => openModal('account')}>
              Add account
            </Button>
          </div>
          {accounts.isLoading ? (
            <SkeletonLoader count={4} />
          ) : accounts.error ? (
            <ErrorAlert message="Unable to load accounts" />
          ) : accounts.data?.length ? (
            <div className="space-y-4">
              {accounts.data.map((account) => (
                <div
                  key={account.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-colors"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-600">{account.type} · {account.currency}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openModal('account', account)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete('account', account.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No accounts available for this user.</p>
          )}
        </Card>

        <Card title="Incomes" subtitle={`Manage ${counts.incomes} income record(s) for ${monthsList[processMonth]}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500">Add or update income records for the selected user.</p>
            <Button variant="secondary" size="sm" onClick={() => openModal('income')}>
              Add income
            </Button>
          </div>
          {incomes.isLoading ? (
            <SkeletonLoader count={4} />
          ) : incomes.error ? (
            <ErrorAlert message="Unable to load incomes" />
          ) : filteredIncomes.length ? (
            <div className="space-y-4">
              {filteredIncomes.map((income) => (
                <div
                  key={income.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-colors"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{income.description}</p>
                      <p className="text-sm text-gray-600">{income.incomeType} · {new Date(income.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(income.amount)}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openModal('income', income)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete('income', income.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No income records found for this user in {monthsList[processMonth]} {processYear}.</p>
          )}
        </Card>

        <Card title="Expenses" subtitle={`Manage ${counts.expenses} expense item(s) for ${monthsList[processMonth]}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500">Add or modify fixed expenses for the selected user.</p>
            <Button variant="secondary" size="sm" onClick={() => openModal('expense')}>
              Add expense
            </Button>
          </div>
          {fixedExpenses.isLoading ? (
            <SkeletonLoader count={4} />
          ) : fixedExpenses.error ? (
            <ErrorAlert message="Unable to load expenses" />
          ) : filteredExpenses.length ? (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-colors"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-600">{expense.expenseType} · Due day {expense.dueDate}</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openModal('expense', expense)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete('expense', expense.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No expenses available for this user in {monthsList[processMonth]} {processYear}.</p>
          )}
        </Card>

        <Card title="Loans" subtitle={`Manage ${counts.loans} loan(s) active in ${monthsList[processMonth]}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500">Track loans and update loan details for the selected user.</p>
            <Button variant="secondary" size="sm" onClick={() => openModal('loan')}>
              Add loan
            </Button>
          </div>
          {loans.isLoading ? (
            <SkeletonLoader count={4} />
          ) : loans.error ? (
            <ErrorAlert message="Unable to load loans" />
          ) : filteredLoans.length ? (
            <div className="space-y-4">
              {filteredLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-colors"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{loan.description}</p>
                      <p className="text-sm text-gray-600">Interest {loan.interestRate}% · {formatDateInput(loan.startDate)} to {formatDateInput(loan.endDate)}</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(loan.remainingAmount)}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openModal('loan', loan)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete('loan', loan.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No active loans found in {monthsList[processMonth]} {processYear}.</p>
          )}
        </Card>
      </div>

      <Modal
        title={
          modalState.activeType
            ? `${modalState.mode === 'create' ? 'Add' : 'Edit'} ${modalState.activeType}`
            : 'Manage item'
        }
        isOpen={Boolean(modalState.activeType)}
        onClose={closeModal}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={
                modalState.mode === 'create'
                  ? createMutation.isPending
                  : updateMutation.isPending
              }
            >
              {modalState.mode === 'create' ? 'Create item' : 'Save changes'}
            </Button>
          </div>
        }
      >
        {alert && (
          <div className="mb-4">
            <ErrorAlert message={alert.message} onDismiss={() => setAlert(null)} className={alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-900' : ''} />
          </div>
        )}
        {modalState.activeType && (
          <div className="space-y-4">
            {(modalState.activeType === 'account' || modalState.activeType === 'income' || modalState.activeType === 'expense' || modalState.activeType === 'loan') && (
              <>
                {modalState.activeType === 'account' && (
                  <>
                    <label className="block text-sm font-medium text-gray-700">
                      Account name
                      <input
                        type="text"
                        value={String(modalState.formValues.name ?? '')}
                        onChange={(event) => handleFieldChange('name', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Balance
                      <input
                        type="number"
                        value={String(modalState.formValues.balance ?? 0)}
                        onChange={(event) => handleFieldChange('balance', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Type
                      <select
                        value={String(modalState.formValues.type ?? 'SAVINGS')}
                        onChange={(e) => handleFieldChange('type', e.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3 bg-white"
                      >
                        <option value="SAVINGS">SAVINGS</option>
                        <option value="CHECKING">CHECKING</option>
                        <option value="WALLET">WALLET</option>
                        <option value="CASH">CASH</option>
                        <option value="INVESTMENT">INVESTMENT</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                      <textarea
                        value={String(modalState.formValues.description ?? '')}
                        onChange={(event) => handleFieldChange('description', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={Boolean(modalState.formValues.isActive)}
                        onChange={(event) => handleFieldChange('isActive', event.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600"
                      />
                      Active account
                    </label>
                  </>
                )}

                {modalState.activeType === 'income' && (
                  <>
                    <label className="block text-sm font-medium text-gray-700">
                      Account
                      <select
                        value={String(modalState.formValues.idAccount ?? '')}
                        onChange={(e) => handleFieldChange('idAccount', e.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3 bg-white"
                      >
                        <option value="">Select account</option>
                        {accounts.data?.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} · {a.type}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                      <input
                        type="text"
                        value={String(modalState.formValues.description ?? '')}
                        onChange={(event) => handleFieldChange('description', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                      <input
                        type="number"
                        value={String(modalState.formValues.amount ?? 0)}
                        onChange={(event) => handleFieldChange('amount', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Type
                      <select
                        value={String(modalState.formValues.incomeType ?? 'OTHER')}
                        onChange={(e) => handleFieldChange('incomeType', e.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3 bg-white"
                      >
                        <option value="SALARY">SALARY</option>
                        <option value="BONUS">BONUS</option>
                        <option value="FREELANCE">FREELANCE</option>
                        <option value="INVESTMENT">INVESTMENT</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                      <input
                        type="date"
                        value={String(modalState.formValues.date ?? '')}
                        onChange={(event) => handleFieldChange('date', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={Boolean(modalState.formValues.isRecurring)}
                        onChange={(event) => handleFieldChange('isRecurring', event.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600"
                      />
                      Recurring income
                    </label>
                  </>
                )}

                {modalState.activeType === 'expense' && (
                  <>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                      <input
                        type="text"
                        value={String(modalState.formValues.description ?? '')}
                        onChange={(event) => handleFieldChange('description', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                      <input
                        type="number"
                        value={String(modalState.formValues.amount ?? 0)}
                        onChange={(event) => handleFieldChange('amount', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Frequency
                      <select
                        value={String(modalState.formValues.frequency ?? 'MONTHLY')}
                        onChange={(e) => handleFieldChange('frequency', e.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3 bg-white"
                      >
                        <option value="DAILY">DAILY</option>
                        <option value="WEEKLY">WEEKLY</option>
                        <option value="MONTHLY">MONTHLY</option>
                        <option value="YEARLY">YEARLY</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Start date
                      <input
                        type="date"
                        value={String(modalState.formValues.startDate ?? '')}
                        onChange={(event) => handleFieldChange('startDate', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      End date
                      <input
                        type="date"
                        value={String(modalState.formValues.endDate ?? '')}
                        onChange={(event) => handleFieldChange('endDate', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                  </>
                )}

                {modalState.activeType === 'loan' && (
                  <>
                    <label className="block text-sm font-medium text-gray-700">
                      Lender / Description
                      <input
                        type="text"
                        value={String(modalState.formValues.description ?? '')}
                        onChange={(event) => handleFieldChange('description', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                      <input
                        type="number"
                        value={String(modalState.formValues.totalAmount ?? 0)}
                        onChange={(event) => handleFieldChange('totalAmount', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Loan date
                      <input
                        type="date"
                        value={String(modalState.formValues.startDate ?? '')}
                        onChange={(event) => handleFieldChange('startDate', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Limit to pay date
                      <input
                        type="date"
                        value={String(modalState.formValues.endDate ?? '')}
                        onChange={(event) => handleFieldChange('endDate', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                      <select
                        value={String(modalState.formValues.status ?? 'PENDING')}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3 bg-white"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </label>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
