import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '@/services/api/api-client';
import {
  ProfileSettingsData,
  ChangePasswordData,
  EmailPreferencesData,
} from '../schemas/settings.schema';

// API Types
interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  signupMethod?: 'email' | 'google';
  emailNotifications?: boolean;
}

interface EmailPreferencesResponse {
  emailNotifications: boolean;
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

async function updateProfile(data: Partial<ProfileSettingsData>): Promise<ProfileSettingsData> {
  const response = await apiClient.patch<ApiResponse<UserProfile>>('/auth/me', {
    firstName: data.firstName,
    lastName: data.lastName,
    avatarUrl: data.avatarUrl,
  });
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

async function fetchEmailPreferences(): Promise<EmailPreferencesData> {
  const response = await apiClient.get<ApiResponse<EmailPreferencesResponse>>('/auth/me/email-preferences');
  return {
    enableAllAlerts: response.data.data.emailNotifications,
  };
}

async function updateEmailPreferences(data: EmailPreferencesData): Promise<EmailPreferencesData> {
  const response = await apiClient.patch<ApiResponse<EmailPreferencesResponse>>('/auth/me/email-preferences', {
    emailNotifications: data.enableAllAlerts,
  });
  return {
    enableAllAlerts: response.data.data.emailNotifications,
  };
}

// Query Keys
export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  emailPreferences: () => [...settingsKeys.all, 'emailPreferences'] as const,
};

// Hooks
export function useProfile() {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: fetchProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useEmailPreferences() {
  return useQuery({
    queryKey: settingsKeys.emailPreferences(),
    queryFn: fetchEmailPreferences,
  });
}

export function useUpdateEmailPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmailPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.emailPreferences() });
    },
  });
}
