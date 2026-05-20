/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/infrastructure/api/apiClient';
import { IAccountRepository } from '@/domain/repositories';
import { Account } from '@/domain/entities';
import { mapAccountDTOToAccount } from '@/infrastructure/mappers/entityMappers';

class AccountRepository implements IAccountRepository {
  async getAccounts(): Promise<Account[]> {
    const res = await apiClient.get<Account[]>('/accounts');
    const dtos = res.data.data as any[] | undefined;
    return (dtos ?? []).map(mapAccountDTOToAccount);
  }

  async getAccountById(id: string): Promise<Account> {
    const res = await apiClient.get(`/accounts/${id}`);
    return mapAccountDTOToAccount(res.data.data);
  }

  async createAccount(data: any): Promise<Account> {
    const res = await apiClient.post('/accounts', data);
    return mapAccountDTOToAccount(res.data.data);
  }

  async updateAccount(id: string, data: any): Promise<Account> {
    const res = await apiClient.put(`/accounts/${id}`, data);
    return mapAccountDTOToAccount(res.data.data);
  }

  async deleteAccount(id: string): Promise<void> {
    await apiClient.delete(`/accounts/${id}`);
  }
}

export const accountRepository = new AccountRepository();
export default accountRepository;
