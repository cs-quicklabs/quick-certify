import { apiClient, ApiResponse } from './api-client';

/**
 * File upload result from the server
 */
export interface FileUploadResult {
  url: string;
  key: string;
  bucket: string;
  contentType: string;
  size: number;
}

/**
 * File upload category types
 */
export type FileCategory = 'logo' | 'favicon' | 'banner' | 'avatar' | 'design';

/**
 * Upload a file to the server
 *
 * @param file - File to upload
 * @param category - Upload category (logo, favicon, banner, avatar)
 * @returns Upload result with URL
 */
export async function uploadFile(file: File, category: FileCategory): Promise<FileUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<FileUploadResult>>(
    `/files?category=${category}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data.data;
}

/**
 * Delete a file from storage by URL
 *
 * @param url - Full URL of the file to delete
 */
export async function deleteFile(url: string): Promise<void> {
  await apiClient.delete<ApiResponse<{ deleted: boolean }>>('/files', {
    data: { url },
  });
}

/**
 * Check if storage is configured on the server
 */
export async function checkStorageStatus(): Promise<{ configured: boolean }> {
  const response = await apiClient.post<ApiResponse<{ configured: boolean }>>(
    '/files/check-status',
  );
  return response.data.data;
}
