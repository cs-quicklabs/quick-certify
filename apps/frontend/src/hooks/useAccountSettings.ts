import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '@/services/api/api-client';

/**
 * Organization Settings Types
 */
export interface OrganizationSettings {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  support_email: string | null;
  slogan: string | null;
  linkedin_company_id: string | null;
  website: string;
  linkedin_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  banner_url: string | null;
  portal_enabled: boolean;
  is_active: boolean;
  issuer_verified: boolean;
}

export interface GeneralInfoData {
  name: string;
  description?: string;
  support_email?: string;
  slogan?: string;
  linkedin_company_id?: string;
}

export interface SocialLinksData {
  linkedin_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  website?: string;
}

export interface BrandingData {
  logo_url?: string;
  favicon_url?: string;
}

export interface PortalSettingsData {
  banner_url?: string;
  portal_enabled?: boolean;
}

/**
 * API Functions
 */
async function fetchOrganizationSettings(): Promise<OrganizationSettings> {
  const response =
    await apiClient.get<ApiResponse<OrganizationSettings>>('/organizations/settings');
  return response.data.data;
}

async function updateGeneralInfo(data: GeneralInfoData): Promise<OrganizationSettings> {
  const response = await apiClient.patch<ApiResponse<OrganizationSettings>>(
    '/organizations/settings/general',
    data,
  );
  return response.data.data;
}

async function updateSocialLinks(data: SocialLinksData): Promise<OrganizationSettings> {
  const response = await apiClient.patch<ApiResponse<OrganizationSettings>>(
    '/organizations/settings/social-links',
    data,
  );
  return response.data.data;
}

async function updateBranding(data: BrandingData): Promise<OrganizationSettings> {
  const response = await apiClient.patch<ApiResponse<OrganizationSettings>>(
    '/organizations/settings/branding',
    data,
  );
  return response.data.data;
}

async function updatePortalSettings(data: PortalSettingsData): Promise<OrganizationSettings> {
  const response = await apiClient.patch<ApiResponse<OrganizationSettings>>(
    '/organizations/settings/portal',
    data,
  );
  return response.data.data;
}

/**
 * Query Keys
 */
export const accountSettingsKeys = {
  all: ['accountSettings'] as const,
  settings: () => [...accountSettingsKeys.all, 'settings'] as const,
};

/**
 * Hooks
 */
export function useOrganizationSettings() {
  return useQuery({
    queryKey: accountSettingsKeys.settings(),
    queryFn: fetchOrganizationSettings,
  });
}

export function useUpdateGeneralInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGeneralInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountSettingsKeys.settings() });
    },
  });
}

export function useUpdateSocialLinks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSocialLinks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountSettingsKeys.settings() });
    },
  });
}

export function useUpdateBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBranding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountSettingsKeys.settings() });
    },
  });
}

export function useUpdatePortalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePortalSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountSettingsKeys.settings() });
    },
  });
}
