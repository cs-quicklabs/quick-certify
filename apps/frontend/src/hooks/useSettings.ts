import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ProfileSettingsData,
  ChangePasswordData,
  EmailPreferencesData,
} from '../schemas/settings.schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// API functions
async function fetchProfile(): Promise<ProfileSettingsData> {
  const response = await fetch(`${API_BASE_URL}/settings/profile`);
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
}

async function updateProfile(data: ProfileSettingsData): Promise<ProfileSettingsData> {
  const response = await fetch(`${API_BASE_URL}/settings/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
}

async function changePassword(data: ChangePasswordData): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/settings/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to change password');
  }
}

async function fetchEmailPreferences(): Promise<EmailPreferencesData> {
  const response = await fetch(`${API_BASE_URL}/settings/email-preferences`);
  if (!response.ok) throw new Error('Failed to fetch email preferences');
  return response.json();
}

async function updateEmailPreferences(data: EmailPreferencesData): Promise<EmailPreferencesData> {
  const response = await fetch(`${API_BASE_URL}/settings/email-preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update email preferences');
  return response.json();
}

// Query Keys
export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  emailPreferences: () => [...settingsKeys.all, 'email-preferences'] as const,
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
