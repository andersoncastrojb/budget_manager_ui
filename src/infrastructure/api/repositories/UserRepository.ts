/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/infrastructure/api/apiClient';
import { IUserRepository } from '@/domain/repositories';
import { User, UserDashboard } from '@/domain/entities';
import { mapUserDTOToUser, mapUserDashboardDTOToUserDashboard } from '@/infrastructure/mappers/entityMappers';

class UserRepository implements IUserRepository {
  async getCurrentUser(): Promise<User> {
    // Backend OpenAPI doesn't expose /users/me in the provided spec,
    // so fetch /users and take the first user as the current user.
    const res = await apiClient.get<User[]>('/users');
    const users = res.data.data as any[] | undefined;
    if (!users || users.length === 0) {
      throw new Error('No users found');
    }
    return mapUserDTOToUser(users[0]);
  }

  async getUserDashboard(): Promise<UserDashboard> {
    // Attempt to determine current user ID by listing users
    const usersRes = await apiClient.get<any[]>('/users');
    const users = usersRes.data.data as any[] | undefined;
    if (!users || users.length === 0) {
      throw new Error('No users available to build dashboard');
    }
    const id = users[0].id;
    const res = await apiClient.get(`/users/dashboard/${id}`);
    const dto = res.data.data;
    return mapUserDashboardDTOToUserDashboard(dto);
  }

  async updateUser(user: Partial<User>): Promise<User> {
    // Map domain user to backend shape minimally
    const payload: any = {
      id: user.id,
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      email: user.email,
    };

    const res = await apiClient.put<User>(`/users`, payload);
    return mapUserDTOToUser(res.data.data);
  }
}

export const userRepository = new UserRepository();
export default userRepository;
