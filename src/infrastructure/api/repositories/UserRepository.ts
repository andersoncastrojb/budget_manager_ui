/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/infrastructure/api/apiClient';
import { IUserRepository } from '@/domain/repositories';
import { User, UserDashboard } from '@/domain/entities';
import {
  mapUserDTOToUser,
  mapUserDashboardDTOToUserDashboard,
} from '@/infrastructure/mappers/entityMappers';

class UserRepository implements IUserRepository {
  async getUsers(): Promise<User[]> {
    const res = await apiClient.get<any>('/users');
    let data = res.data as any;

    if (data?.data && Array.isArray(data.data)) {
      data = data.data;
    }

    if (!Array.isArray(data)) {
      data = Array.isArray(res.data) ? res.data : [data];
    }

    return (data as any[]).map(mapUserDTOToUser);
  }

  async getCurrentUser(): Promise<User> {
    const users = await this.getUsers();
    if (users.length === 0) {
      throw new Error('No users found');
    }
    return users[0];
  }

  async getUserById(id: string): Promise<User> {
    try {
      const res = await apiClient.get<any>(`/users/${id}`);
      const data = res.data?.data ?? res.data;
      return mapUserDTOToUser(data);
    } catch {
      const users = await this.getUsers();
      const selectedUser = users.find((user) => user.id === id);
      if (!selectedUser) {
        throw new Error(`User with id ${id} was not found`);
      }
      return selectedUser;
    }
  }

  async getUserDashboard(userId?: string): Promise<UserDashboard> {
    const selectedUser = userId ? await this.getUserById(userId) : await this.getCurrentUser();
    const id = selectedUser.id;
    const res = await apiClient.get<any>(`/users/dashboard/${id}`);
    const responseData = res.data as any;
    const dto = responseData.data || responseData;

    if (!dto.user) {
      dto.user = selectedUser;
    }

    return mapUserDashboardDTOToUserDashboard(dto);
  }

  async updateUser(user: Partial<User>): Promise<User> {
    const payload: any = {
      id: user.id,
      name: `${user.name ?? ''}`.trim(),
      email: user.email,
    };

    const res = await apiClient.put<any>(`/users`, payload);
    const updatedData = res.data as any;
    return mapUserDTOToUser(updatedData.data || updatedData);
  }
}

export const userRepository = new UserRepository();
export default userRepository;
