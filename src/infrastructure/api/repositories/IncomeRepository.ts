/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/infrastructure/api/apiClient';
import { IIncomeRepository } from '@/domain/repositories';
import { Income } from '@/domain/entities';
import { mapIncomeDTOToIncome } from '@/infrastructure/mappers/entityMappers';

class IncomeRepository implements IIncomeRepository {
  async getIncomes(): Promise<Income[]> {
    const res = await apiClient.get('/incomes');
    const dtos = res.data.data as any[] | undefined;
    return (dtos ?? []).map(mapIncomeDTOToIncome);
  }

  async getIncomeById(id: string): Promise<Income> {
    const res = await apiClient.get(`/incomes/${id}`);
    return mapIncomeDTOToIncome(res.data.data);
  }

  async createIncome(payload: any): Promise<Income> {
    const res = await apiClient.post('/incomes', payload);
    return mapIncomeDTOToIncome(res.data.data);
  }

  async updateIncome(id: string, payload: any): Promise<Income> {
    const res = await apiClient.put(`/incomes/${id}`, payload);
    return mapIncomeDTOToIncome(res.data.data);
  }

  async deleteIncome(id: string): Promise<void> {
    await apiClient.delete(`/incomes/${id}`);
  }
}

export const incomeRepository = new IncomeRepository();
export default incomeRepository;
