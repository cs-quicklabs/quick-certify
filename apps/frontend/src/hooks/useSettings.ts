import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '@/services/api/api-client';
import {
  ProfileSettingsData,
  ChangePasswordData,
} from '../schemas/settings.schema';

// API Types
interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  signupMethod?: 'email' | 'google';
}

// API functions
async function fetchProfile(): Promise<ProfileSettingsData> {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/auth/me');
  const user = response.data.data;
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    avatarUrl: user.avatarUrl,
    signupMethod: user.signupMethod,
  };
}

async function changePassword(data: ChangePasswordData): Promise<void> {
  await apiClient.post<ApiResponse<void>>('/auth/change-password', {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  });
}

// Query Keys
export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
};

// Hooks
export function useProfile() {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: fetchProfile,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}
