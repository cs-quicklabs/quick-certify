import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '@/services/api/api-client';
import {
  ProfileSettingsData,
  ChangePasswordData,
  EmailPreferencesData,
} from '../schemas/settings.schema';
import { AuthProvider } from '@/types';

// API Types
interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  organizationName?: string;
  authProvider?: AuthProvider;
  emailNotifications?: boolean;
}

interface EmailPreferencesResponse {
  emailNotifications: boolean;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
  sessionsRevoked: boolean;
}

// API functions
async function fetchProfile(): Promise<ProfileSettingsData> {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/profile/me');
  const user = response.data.data;
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
    organizationName: user.organizationName ?? undefined,
    authProvider: user.authProvider,
  };
}

async function updateProfile(
  data: Partial<ProfileSettingsData & { avatarUrl?: string | null }>,
): Promise<ProfileSettingsData> {
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
    lastName: user.lastName || '',
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
    authProvider: user.authProvider,
  };
}

async function changePassword(data: ChangePasswordData): Promise<ChangePasswordResponse> {
  const response = await apiClient.post<ApiResponse<ChangePasswordResponse>>(
    '/auth/change-password',
    {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeAllSessions: data.revokeAllSessions ?? false,
    },
  );
  return response.data.data;
}

async function fetchEmailPreferences(): Promise<EmailPreferencesData> {
  const response = await apiClient.get<ApiResponse<EmailPreferencesResponse>>(
    '/profile/email-preferences',
  );
  return {
    enableAllAlerts: response.data.data.emailNotifications,
  };
}

async function updateEmailPreferences(data: EmailPreferencesData): Promise<EmailPreferencesData> {
  const response = await apiClient.patch<ApiResponse<EmailPreferencesResponse>>(
    '/profile/email-preferences',
    {
      emailNotifications: data.enableAllAlerts,
    },
  );
  return {
    enableAllAlerts: response.data.data.emailNotifications,
  };
}

async function disconnectGoogle(): Promise<ApiResponse<string | null>> {
  const response = await apiClient.post<ApiResponse<string | null>>('/auth/google/disconnect', {});
  return response.data;
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

export function useDisconnectGoogle() {
  return useMutation({
    mutationFn: disconnectGoogle,
  });
}
