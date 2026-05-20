/**
 * Application Layer: Validation Schemas
 * Zod schemas for strict client-side validation.
 * Prevents injection attacks and ensures data integrity before API calls.
 */

import { z } from 'zod';

/**
 * Account Schemas
 */
export const AccountTypeSchema = z.enum([
  'CHECKING',
  'SAVINGS',
  'INVESTMENT',
  'OTHER',
]);

export const CreateAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be less than 100 characters'),
  type: AccountTypeSchema,
  balance: z
    .number()
    .nonnegative('Balance cannot be negative'),
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .toUpperCase(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;

export const UpdateAccountSchema = CreateAccountSchema.partial();
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;

/**
 * Income Schemas
 */
export const IncomeTypeSchema = z.enum([
  'SALARY',
  'BONUS',
  'FREELANCE',
  'INVESTMENT',
  'OTHER',
]);

export const CreateIncomeSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters'),
  amount: z
    .number()
    .positive('Amount must be greater than 0'),
  incomeType: IncomeTypeSchema,
  date: z.coerce.date(),
  accountId: z.string().uuid('Invalid account ID'),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z
    .string()
    .optional(),
});

export type CreateIncomeInput = z.infer<typeof CreateIncomeSchema>;

export const UpdateIncomeSchema = CreateIncomeSchema.partial();
export type UpdateIncomeInput = z.infer<typeof UpdateIncomeSchema>;

/**
 * Fixed Expense Schemas
 */
export const ExpenseTypeSchema = z.enum([
  'RENT',
  'UTILITIES',
  'INSURANCE',
  'SUBSCRIPTION',
  'TRANSPORTATION',
  'HEALTHCARE',
  'EDUCATION',
  'OTHER',
]);

export const CreateFixedExpenseSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters'),
  amount: z
    .number()
    .positive('Amount must be greater than 0'),
  expenseType: ExpenseTypeSchema,
  dueDate: z
    .number()
    .int('Due date must be an integer')
    .min(1, 'Day must be between 1 and 31')
    .max(31, 'Day must be between 1 and 31'),
  accountId: z.string().uuid('Invalid account ID'),
});

export type CreateFixedExpenseInput = z.infer<typeof CreateFixedExpenseSchema>;

export const UpdateFixedExpenseSchema = CreateFixedExpenseSchema.partial();
export type UpdateFixedExpenseInput = z.infer<typeof UpdateFixedExpenseSchema>;

/**
 * Loan Schemas
 */
export const CreateLoanSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters'),
  totalAmount: z
    .number()
    .positive('Total amount must be greater than 0'),
  interestRate: z
    .number()
    .nonnegative('Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%'),
  monthlyPayment: z
    .number()
    .positive('Monthly payment must be greater than 0'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  accountId: z.string().uuid('Invalid account ID'),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type CreateLoanInput = z.infer<typeof CreateLoanSchema>;

export const UpdateLoanSchema = CreateLoanSchema.partial();
export type UpdateLoanInput = z.infer<typeof UpdateLoanSchema>;

/**
 * Authentication Schemas
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
