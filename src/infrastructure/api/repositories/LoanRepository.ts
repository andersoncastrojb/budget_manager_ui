/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/infrastructure/api/apiClient';
import { ILoanRepository } from '@/domain/repositories';
import { Loan } from '@/domain/entities';
import { mapLoanDTOToLoan } from '@/infrastructure/mappers/entityMappers';

class LoanRepository implements ILoanRepository {
  async getLoans(): Promise<Loan[]> {
    const res = await apiClient.get('/loans');
    const dtos = res.data.data as any[] | undefined;
    return (dtos ?? []).map(mapLoanDTOToLoan);
  }

  async getLoanById(id: string): Promise<Loan> {
    const res = await apiClient.get(`/loans/${id}`);
    return mapLoanDTOToLoan(res.data.data);
  }

  async createLoan(payload: any): Promise<Loan> {
    const res = await apiClient.post('/loans', payload);
    return mapLoanDTOToLoan(res.data.data);
  }

  async updateLoan(id: string, payload: any): Promise<Loan> {
    const res = await apiClient.put(`/loans/${id}`, payload);
    return mapLoanDTOToLoan(res.data.data);
  }

  async deleteLoan(id: string): Promise<void> {
    await apiClient.delete(`/loans/${id}`);
  }
}

export const loanRepository = new LoanRepository();
export default loanRepository;
