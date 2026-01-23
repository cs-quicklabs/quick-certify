/**
 * API Error Utilities
 *
 * Centralized error handling for API responses
 */

import { AxiosError } from 'axios';
import { ApiError } from '@/services/api/api-client';

/**
 * Extract user-friendly error message from API error response
 *
 * @param error - The error caught from an API call
 * @param defaultMessage - Fallback message if no specific message is found
 * @returns User-friendly error message
 */
export function getApiErrorMessage(
  error: unknown,
  defaultMessage = 'An error occurred. Please try again.',
): string {
  // Handle AxiosError with API response
  if (isAxiosError(error)) {
    // Check for API error message in response data
    const apiMessage = error.response?.data?.message;
    if (apiMessage && typeof apiMessage === 'string') {
      return apiMessage;
    }

    // Check for validation errors
    const validationErrors = error.response?.data?.errors;
    if (validationErrors && typeof validationErrors === 'object') {
      const firstError = Object.values(validationErrors)[0];
      if (typeof firstError === 'string') {
        return firstError;
      }
    }

    // Network/CORS error
    if (!error.response) {
      return 'Unable to connect to the server. Please check your network connection.';
    }

    // Status-specific fallback messages
    const status = error.response?.status;
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The resource may already exist.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return defaultMessage;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Don't use generic Axios messages
    if (error.message.startsWith('Request failed with status code')) {
      return defaultMessage;
    }
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
}

/**
 * Type guard for AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError<ApiError> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Get field-specific errors from API response
 *
 * @param error - The error caught from an API call
 * @returns Record of field names to error messages, or null if no field errors
 */
export function getApiFieldErrors(error: unknown): Record<string, string> | null {
  if (isAxiosError(error)) {
    const errors = error.response?.data?.errors;
    if (errors && typeof errors === 'object') {
      return errors as Record<string, string>;
    }
  }
  return null;
}
