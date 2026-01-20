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
  organizationName?: string;
  signupMethod?: 'email' | 'google';
  emailNotifications?: boolean;
}

interface EmailPreferencesResponse {
  emailNotifications: boolean;
}

// API functions
async function fetchProfile(): Promise<ProfileSettingsData> {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/profile/me');
  const user = response.data.data;
  return {
    firstName: user.firstName || '',
    lastName: user.lastName ?? undefined,
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
    organizationName: user.organizationName ?? undefined,
    signupMethod: user.signupMethod,
  };
}

async function updateProfile(data: Partial<ProfileSettingsData & { avatarUrl?: string | null }>): Promise<ProfileSettingsData> {
  const payload: Record<string, string | null | undefined> = {
    firstName: data.firstName,
  };

  // Only include optional fields if they have values (not null, not undefined)
  if (data.lastName !== null && data.lastName !== undefined) {
    payload.lastName = data.lastName;
  }

  // Handle avatarUrl: explicitly check if it's null (for deletion) or has a value
  if ('avatarUrl' in data) {
    // If avatarUrl is explicitly null, send null to delete
    // If it's a string (even empty), send it (or convert empty to null)
    // If it's undefined, don't include in payload
    if (data.avatarUrl === null) {
      payload.avatarUrl = null;
    } else if (data.avatarUrl !== undefined) {
      payload.avatarUrl = data.avatarUrl && data.avatarUrl.trim() !== '' ? data.avatarUrl : null;
    }
  }

  const response = await apiClient.patch<ApiResponse<UserProfile>>('/profile/me', payload);
  const user = response.data.data;
  return {
    firstName: user.firstName || '',
    lastName: user.lastName ?? undefined,
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
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
  const response = await apiClient.get<ApiResponse<EmailPreferencesResponse>>('/profile/email-preferences');
  return {
    enableAllAlerts: response.data.data.emailNotifications,
  };
}

async function updateEmailPreferences(data: EmailPreferencesData): Promise<EmailPreferencesData> {
  const response = await apiClient.patch<ApiResponse<EmailPreferencesResponse>>('/profile/email-preferences', {
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
