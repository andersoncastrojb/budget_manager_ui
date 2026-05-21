/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  User as DomainUser,
  Account as DomainAccount,
  Income as DomainIncome,
  FixedExpense as DomainFixedExpense,
  Loan as DomainLoan,
  MonthlyBalance as DomainMonthlyBalance,
  UserDashboard as DomainUserDashboard,
} from '@/domain/entities';

/*
 * Helper mappers to convert backend DTOs into domain entities.
 * These keep mapping logic in one place and make repository code concise.
 */

export const mapUserDTOToUser = (dto: any): DomainUser => {
  const name = dto.name || `${dto.firstName || ''} ${dto.lastName || ''}`.trim() || 'Usuario';

  return {
    id: String(dto.id),
    name: name,
    email: dto.email ?? '',
  };
};

export const mapAccountDTOToAccount = (dto: any): DomainAccount => {
  return {
    id: String(dto.id),
    userId: String(dto.idUser ?? dto.userId ?? ''),
    name: dto.name ?? dto.title ?? 'Account',
    type: (dto.type as DomainAccount['type']) ?? 'OTHER',
    balance: Number(dto.balance ?? dto.amount ?? 0),
    currency: dto.currency ?? 'USD',
    description: dto.description,
    isActive: dto.isActive ?? true,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
  };
};

export const mapIncomeDTOToIncome = (dto: any): DomainIncome => {
  return {
    id: String(dto.id),
    userId: String(dto.idUser ?? dto.userId ?? ''),
    accountId: String(dto.idAccount ?? dto.accountId ?? ''),
    description: dto.description ?? '',
    amount: Number(dto.value ?? dto.amount ?? 0),
    incomeType: (dto.type as DomainIncome['incomeType']) ?? 'OTHER',
    date: dto.date ? new Date(dto.date) : new Date(),
    isRecurring: Boolean(dto.isRecurring ?? false),
    recurrencePattern: dto.recurrencePattern,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
  };
};

export const mapFixedExpenseDTOToFixedExpense = (dto: any): DomainFixedExpense => {
  const dueDate = dto.dueDate
    ? Number(dto.dueDate)
    : dto.startDate
      ? new Date(dto.startDate).getDate()
      : 1;

  return {
    id: String(dto.id),
    userId: String(dto.idUser ?? dto.userId ?? ''),
    description: dto.description ?? '',
    amount: Number(dto.amount ?? 0),
    expenseType: (dto.frequency as DomainFixedExpense['expenseType']) ?? 'OTHER',
    dueDate,
    isActive: dto.isActive ?? true,
    accountId: String(dto.accountId ?? dto.idAccount ?? ''),
    startDate: dto.startDate ? new Date(dto.startDate) : undefined,
    endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : dto.startDate ? new Date(dto.startDate) : new Date(),
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
  };
};

export const mapLoanDTOToLoan = (dto: any): DomainLoan => {
  return {
    id: String(dto.id),
    userId: String(dto.idUser ?? dto.userId ?? ''),
    description: dto.lender ?? dto.description ?? '',
    totalAmount: Number(dto.amount ?? dto.totalAmount ?? 0),
    remainingAmount: Number(dto.remainingAmount ?? dto.amount ?? 0),
    interestRate: Number(dto.interestRate ?? dto.rate ?? 0),
    monthlyPayment: Number(dto.monthlyPayment ?? 0),
    startDate: dto.loanDate ? new Date(dto.loanDate) : new Date(),
    endDate: dto.limitToPayDate ? new Date(dto.limitToPayDate) : new Date(),
    accountId: String(dto.accountId ?? ''),
    createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
  };
};

export const mapMonthlyBalanceDTOToMonthlyBalance = (dto: any): DomainMonthlyBalance => {
  return {
    id: String(dto.id),
    userId: String(dto.idUser ?? dto.userId ?? ''),
    year: Number(dto.year ?? new Date().getFullYear()),
    month: Number(dto.month ?? new Date().getMonth() + 1),
    totalIncome: Number(dto.totalIncomes ?? dto.totalIncome ?? 0),
    totalExpenses: Number(dto.totalExpenses ?? 0),
    totalLoans: Number(dto.loans ?? 0),
    netBalance: Number(dto.finalBalance ?? 0),
    createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
  };
};

export const mapUserDashboardDTOToUserDashboard = (dto: any): DomainUserDashboard => {
  const mappedUser = mapUserDTOToUser(dto.user);

  const accounts = Array.isArray(dto.accounts)
    ? dto.accounts.map(mapAccountDTOToAccount)
    : [];
  const incomes = Array.isArray(dto.incomes)
    ? dto.incomes.map(mapIncomeDTOToIncome)
    : [];
  const fixedExpenses = Array.isArray(dto.fixedExpenses)
    ? dto.fixedExpenses.map(mapFixedExpenseDTOToFixedExpense)
    : [];
  const loans = Array.isArray(dto.loans)
    ? dto.loans.map(mapLoanDTOToLoan)
    : [];

  const totalIncome = incomes.reduce((sum: number, inc: DomainIncome) => sum + inc.amount, 0);
  const totalExpenses = fixedExpenses.reduce((sum: number, exp: DomainFixedExpense) => sum + exp.amount, 0);
  const totalLoans = loans.reduce((sum: number, loan: DomainLoan) => sum + loan.remainingAmount, 0);

  const totalBalance = totalIncome - (totalExpenses + totalLoans);

  // Combine incomes and fixed expenses into recent transactions
  const transactions: any[] = [];
  incomes.forEach((inc: DomainIncome) => {
    transactions.push({
      ...inc,
      date: inc.date,
    });
  });
  fixedExpenses.forEach((exp: DomainFixedExpense) => {
    // Generate a date for this month based on the due date
    const expDate = new Date();
    expDate.setDate(Math.min(exp.dueDate, 28)); // avoid month overflow issues
    transactions.push({
      ...exp,
      date: expDate,
    });
  });

  // Sort transactions by date descending
  const recentTransactions = transactions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  // Generate 6 months of historical monthly balance data
  const monthlyBalanceList: DomainMonthlyBalance[] = [];
  const currentDate = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-indexed

    // Incomes in this specific month
    const monthIncomes = incomes.filter(
      (inc: DomainIncome) => inc.date.getFullYear() === year && inc.date.getMonth() + 1 === month
    );
    const monthIncomeSum = monthIncomes.reduce((sum: number, inc: DomainIncome) => sum + inc.amount, 0);

    // Fixed expenses are recurring, so they count every month if they were created before/during this month
    const monthExpenses = fixedExpenses.filter((exp: DomainFixedExpense) => {
      const expCreated = exp.createdAt || new Date();
      return expCreated.getFullYear() < year || (expCreated.getFullYear() === year && expCreated.getMonth() + 1 <= month);
    });
    const monthExpenseSum = monthExpenses.reduce((sum: number, exp: DomainFixedExpense) => sum + exp.amount, 0);

    // Loan monthly payments due every month
    const monthLoans = loans.filter((loan: DomainLoan) => {
      const sDate = loan.startDate || new Date();
      const eDate = loan.endDate || new Date();
      const currentMonthDate = new Date(year, month - 1, 1);
      return currentMonthDate >= new Date(sDate.getFullYear(), sDate.getMonth(), 1) &&
        currentMonthDate <= new Date(eDate.getFullYear(), eDate.getMonth(), 1);
    });
    const monthLoanSum = monthLoans.reduce((sum: number, loan: DomainLoan) => sum + loan.monthlyPayment, 0);

    // Calculate final net balance
    const netBalance = monthIncomeSum - monthExpenseSum - monthLoanSum;

    monthlyBalanceList.push({
      id: `${year}-${month}`,
      userId: mappedUser.id,
      year,
      month,
      totalIncome: monthIncomeSum,
      totalExpenses: monthExpenseSum,
      totalLoans: monthLoanSum,
      netBalance,
      createdAt: d,
      updatedAt: d,
    });
  }

  return {
    user: mappedUser,
    totalBalance,
    totalIncome,
    totalExpenses,
    totalLoans,
    accountCount: accounts.length,
    upcomingExpenses: fixedExpenses,
    recentTransactions,
    monthlyBalance: monthlyBalanceList,
  } as DomainUserDashboard;
};
