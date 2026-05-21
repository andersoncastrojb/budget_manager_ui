/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/infrastructure/api/apiClient';
import { IIncomeRepository } from '@/domain/repositories';
import { Income } from '@/domain/entities';
import { mapIncomeDTOToIncome } from '@/infrastructure/mappers/entityMappers';

class IncomeRepository implements IIncomeRepository {
  async getIncomes(filters?: { userId?: string }): Promise<Income[]> {
    const res = await apiClient.get<any>('/incomes', {
      params: filters,
    });
    const responseData = res.data?.data ?? res.data;
    const dtos = Array.isArray(responseData) ? responseData : [];
    return dtos.map(mapIncomeDTOToIncome);
  }

  async getIncomeById(id: string): Promise<Income> {
    const res = await apiClient.get(`/incomes/${id}`);
    return mapIncomeDTOToIncome(res.data?.data ?? res.data);
  }

  async createIncome(payload: any): Promise<Income> {
    const res = await apiClient.post('/incomes', payload);
    return mapIncomeDTOToIncome(res.data?.data ?? res.data);
  }

  async updateIncome(id: string, payload: any): Promise<Income> {
    const res = await apiClient.put('/incomes', { ...payload, id: Number(id) });
    return mapIncomeDTOToIncome(res.data?.data ?? res.data);
  }

  async deleteIncome(id: string): Promise<void> {
    await apiClient.delete(`/incomes/${id}`);
  }
}

export const incomeRepository = new IncomeRepository();
export default incomeRepository;
