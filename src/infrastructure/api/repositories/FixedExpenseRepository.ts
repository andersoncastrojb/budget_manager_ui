/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/infrastructure/api/apiClient';
import { IFixedExpenseRepository } from '@/domain/repositories';
import { FixedExpense } from '@/domain/entities';
import { mapFixedExpenseDTOToFixedExpense } from '@/infrastructure/mappers/entityMappers';

class FixedExpenseRepository implements IFixedExpenseRepository {
  async getFixedExpenses(): Promise<FixedExpense[]> {
    const res = await apiClient.get('/fixed-expenses');
    const dtos = res.data.data as any[] | undefined;
    return (dtos ?? []).map(mapFixedExpenseDTOToFixedExpense);
  }

  async getFixedExpenseById(id: string): Promise<FixedExpense> {
    const res = await apiClient.get(`/fixed-expenses/${id}`);
    return mapFixedExpenseDTOToFixedExpense(res.data.data);
  }

  async createFixedExpense(payload: any): Promise<FixedExpense> {
    const res = await apiClient.post('/fixed-expenses', payload);
    return mapFixedExpenseDTOToFixedExpense(res.data.data);
  }

  async updateFixedExpense(id: string, payload: any): Promise<FixedExpense> {
    const res = await apiClient.put(`/fixed-expenses/${id}`, payload);
    return mapFixedExpenseDTOToFixedExpense(res.data.data);
  }

  async deleteFixedExpense(id: string): Promise<void> {
    await apiClient.delete(`/fixed-expenses/${id}`);
  }
}

export const fixedExpenseRepository = new FixedExpenseRepository();
export default fixedExpenseRepository;
