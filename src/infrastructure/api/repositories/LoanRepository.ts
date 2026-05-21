/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/infrastructure/api/apiClient';
import { ILoanRepository } from '@/domain/repositories';
import { Loan } from '@/domain/entities';
import { mapLoanDTOToLoan } from '@/infrastructure/mappers/entityMappers';

class LoanRepository implements ILoanRepository {
  async getLoans(filters?: { userId?: string }): Promise<Loan[]> {
    const res = await apiClient.get<any>('/loans', {
      params: filters,
    });
    const responseData = res.data?.data ?? res.data;
    const dtos = Array.isArray(responseData) ? responseData : [];
    return dtos.map(mapLoanDTOToLoan);
  }

  async getLoanById(id: string): Promise<Loan> {
    const res = await apiClient.get(`/loans/${id}`);
    return mapLoanDTOToLoan(res.data?.data ?? res.data);
  }

  async createLoan(payload: any): Promise<Loan> {
    const res = await apiClient.post('/loans', payload);
    return mapLoanDTOToLoan(res.data?.data ?? res.data);
  }

  async updateLoan(id: string, payload: any): Promise<Loan> {
    const res = await apiClient.put('/loans', { ...payload, id: Number(id) });
    return mapLoanDTOToLoan(res.data?.data ?? res.data);
  }

  async deleteLoan(id: string): Promise<void> {
    await apiClient.delete(`/loans/${id}`);
  }
}

export const loanRepository = new LoanRepository();
export default loanRepository;
