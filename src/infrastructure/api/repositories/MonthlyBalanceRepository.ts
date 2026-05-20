/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { apiClient } from '@/infrastructure/api/apiClient';
import { IMonthlyBalanceRepository } from '@/domain/repositories';
import { MonthlyBalance } from '@/domain/entities';
import { mapMonthlyBalanceDTOToMonthlyBalance } from '@/infrastructure/mappers/entityMappers';

class MonthlyBalanceRepository implements IMonthlyBalanceRepository {
  async getMonthlyBalances(_year: number): Promise<MonthlyBalance[]> {
    // Return empty list as there is no backend GET endpoint for list of monthly balances
    return [];
  }

  async getMonthlyBalance(year: number, month: number): Promise<MonthlyBalance> {
    // Trigger process balance on backend to calculate it and return
    // Since the backend doesn't support session auth, we get the first user ID
    const usersRes = await apiClient.get<any[]>('/users');
    const users = usersRes.data.data as any[] | undefined;
    if (!users || users.length === 0) {
      throw new Error('No users available to process monthly balance');
    }
    const userId = users[0].id;
    const res = await apiClient.post<any>(
      `/monthly-balances/process?userId=${userId}&month=${month}&year=${year}`
    );
    return mapMonthlyBalanceDTOToMonthlyBalance(res.data.data);
  }
}

export const monthlyBalanceRepository = new MonthlyBalanceRepository();
export default monthlyBalanceRepository;
