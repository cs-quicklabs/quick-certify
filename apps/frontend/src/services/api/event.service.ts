/**
 * Event Service - API client for event management
 *
 * Uses centralized query params utility for consistent URL building.
 * Includes comprehensive error handling with standardized error formatting.
 */

import { PaginatedResponse } from '@/types';
import { apiClient, ApiResponse, ApiError } from './api-client';
import { buildUrl } from '@/lib/query-params';
import { AxiosError } from 'axios';

/**
 * Standardized service error with field-level validation support
 */
export class EventServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly fieldErrors?: Record<string, string>,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'EventServiceError';
  }
}

/**
 * Type guard to check if error is an AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError<ApiError> {
  return (error as AxiosError).isAxiosError === true;
}

/**
 * Extract and format error from Axios error response
 */
function formatApiError(error: unknown): string {
  // Handle Axios errors with API response
  if (isAxiosError(error) && error.response) {
    const response = error.response;
    const data = response.data;
    const status = response.status ?? 500;
    const message = (data?.message as string) || `Request failed with status ${status}`;
    return message;
  }

  // Handle Axios errors without response (network errors)
  if (isAxiosError(error)) {
    const message = error.message || 'Network error occurred';
    return message;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error?.message || 'Network error occurred';
  }

  // Fallback for unknown error types
  return 'Something went wrong';
}

/**
 * Wrapper for API calls with consistent error handling
 */
async function apiCall<T>(operation: () => Promise<T>, context: string): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const formattedError = formatApiError(error);
    throw formattedError;
  }
}

export interface IBaseEvent {
  id: string;
  uuid: string;
  name: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EventType = IBaseEvent;
export type EventLevel = IBaseEvent;
export type EventFormat = IBaseEvent;

/**
 * Event interface representing a complete event entity
 *
 * Note: Reference fields (event_type_id, event_level_id, event_format_id, design_id)
 * and their related objects are optional to support progressive creation where
 * an event can be created with minimal data and updated later.
 */
export interface Event extends IBaseEvent {
  description?: string | null;
  learningLink?: string | null;
  event_type_id?: string | null;
  event_level_id?: string | null;
  event_format_id?: string | null;
  design_id?: string | null;
  duration_type?: string | null;
  duration_value?: number | null;
  event_type?: EventType | null;
  event_level?: EventLevel | null;
  event_format?: EventFormat | null;
  design?: {
    id: string;
    uuid: string;
    name: string;
    url: string;
    type: string;
  } | null;
  /** Associated skills */
  skills?: {
    id: string;
    uuid: string;
    name: string;
  }[];
}

export interface CreateEventTypeRequest {
  name: string;
}

export interface UpdateEventTypeRequest {
  name?: string;
}

export interface CreateEventLevelRequest {
  name: string;
}

export interface UpdateEventLevelRequest {
  name?: string;
}

export interface CreateEventFormatRequest {
  name: string;
}

export interface UpdateEventFormatRequest {
  name?: string;
}

/**
 * Request body for creating a new event
 *
 * Required fields: name, designId, eventTypeId, eventLevelId, eventFormatId
 * Optional fields: description, learningLink, skillIds
 */
export interface CreateEventRequest {
  /** Event name (required) */
  name: string;
  /** Design UUID (required) */
  designId: string;
  /** Event type UUID (required) */
  eventTypeId: string;
  /** Event level UUID (required) */
  eventLevelId: string;
  /** Event format UUID (required) */
  eventFormatId: string;
  /** Event description (optional) */
  description?: string;
  /** External learning resources link (optional) */
  learningLink?: string;
  /** Duration type - day, week, month (optional) */
  durationType?: string;
  /** Duration value (optional) */
  durationValue?: number;
  /** Skill UUIDs to associate with the event (optional) */
  skillIds?: string[];
}

/**
 * Request body for updating an existing event
 *
 * All fields are optional to support partial updates.
 * Set a field to null or empty string to clear it.
 */
export interface UpdateEventRequest {
  name?: string;
  designId?: string | null;
  eventTypeId?: string | null;
  eventLevelId?: string | null;
  eventFormatId?: string | null;
  description?: string | null;
  learningLink?: string | null;
  /** Duration type - day, week, month (optional, null clears it) */
  durationType?: string | null;
  /** Duration value (optional, null clears it) */
  durationValue?: number | null;
  /** Skill UUIDs to associate with the event (optional, empty array clears all skills) */
  skillIds?: string[];
}

export interface PaginationFilters {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface EventFilters extends PaginationFilters {
  type?: string;
  level?: string;
  format?: string;
  typeIds?: string;
  levelIds?: string;
  formatIds?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

/**
 * Maximum number of items to fetch for dropdown lists
 */
const DROPDOWN_LIST_LIMIT = 100;

export const eventService = {
  // Event Types
  async getEventTypes(filters?: PaginationFilters): Promise<PaginatedResponse<EventType>> {
    return apiCall(async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<EventType>>>(
        buildUrl('/event-types', filters),
      );
      return response.data.data;
    }, 'getEventTypes');
  },

  async getEventType(id: string): Promise<EventType> {
    return apiCall(async () => {
      const response = await apiClient.get<ApiResponse<EventType>>(`/event-types/${id}`);
      return response.data.data;
    }, `getEventType(${id})`);
  },

  async createEventType(data: CreateEventTypeRequest): Promise<ApiResponse<EventType>> {
    return apiCall(async () => {
      const response = await apiClient.post<ApiResponse<EventType>>('/event-types', data);
      return response.data;
    }, 'createEventType');
  },

  async updateEventType(id: string, data: UpdateEventTypeRequest): Promise<ApiResponse<EventType>> {
    return apiCall(async () => {
      const response = await apiClient.patch<ApiResponse<EventType>>(`/event-types/${id}`, data);
      return response.data;
    }, `updateEventType(${id})`);
  },

  async deleteEventType(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiCall(async () => {
      const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
        `/event-types/${id}`,
      );
      return response.data;
    }, `deleteEventType(${id})`);
  },

  // Event Levels
  async getEventLevels(filters?: PaginationFilters): Promise<PaginatedResponse<EventLevel>> {
    return apiCall(async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<EventLevel>>>(
        buildUrl('/event-levels', filters),
      );
      return response.data.data;
    }, 'getEventLevels');
  },

  async getEventLevel(id: string): Promise<EventLevel> {
    return apiCall(async () => {
      const response = await apiClient.get<ApiResponse<EventLevel>>(`/event-levels/${id}`);
      return response.data.data;
    }, `getEventLevel(${id})`);
  },

  async createEventLevel(data: CreateEventLevelRequest): Promise<ApiResponse<EventLevel>> {
    return apiCall(async () => {
      const response = await apiClient.post<ApiResponse<EventLevel>>('/event-levels', data);
      return response.data;
    }, 'createEventLevel');
  },

  async updateEventLevel(
    id: string,
    data: UpdateEventLevelRequest,
  ): Promise<ApiResponse<EventLevel>> {
    return apiCall(async () => {
      const response = await apiClient.patch<ApiResponse<EventLevel>>(`/event-levels/${id}`, data);
      return response.data;
    }, `updateEventLevel(${id})`);
  },

  async deleteEventLevel(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiCall(async () => {
      const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
        `/event-levels/${id}`,
      );
      return response.data;
    }, `deleteEventLevel(${id})`);
  },

  // Event Formats
  async getEventFormats(filters?: PaginationFilters): Promise<PaginatedResponse<EventFormat>> {
    return apiCall(async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<EventFormat>>>(
        buildUrl('/event-formats', filters),
      );
      return response.data.data;
    }, 'getEventFormats');
  },

  async getEventFormat(id: string): Promise<EventFormat> {
    return apiCall(async () => {
      const response = await apiClient.get<ApiResponse<EventFormat>>(`/event-formats/${id}`);
      return response.data.data;
    }, `getEventFormat(${id})`);
  },

  async createEventFormat(data: CreateEventFormatRequest): Promise<ApiResponse<EventFormat>> {
    return apiCall(async () => {
      const response = await apiClient.post<ApiResponse<EventFormat>>('/event-formats', data);
      return response.data;
    }, 'createEventFormat');
  },

  async updateEventFormat(
    id: string,
    data: UpdateEventFormatRequest,
  ): Promise<ApiResponse<EventFormat>> {
    return apiCall(async () => {
      const response = await apiClient.patch<ApiResponse<EventFormat>>(
        `/event-formats/${id}`,
        data,
      );
      return response.data;
    }, `updateEventFormat(${id})`);
  },

  async deleteEventFormat(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiCall(async () => {
      const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
        `/event-formats/${id}`,
      );
      return response.data;
    }, `deleteEventFormat(${id})`);
  },

  // Events
  async getEvents(filters?: EventFilters): Promise<PaginatedResponse<Event>> {
    return apiCall(async () => {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Event>>>(
        buildUrl('/events', filters),
      );
      return response.data.data;
    }, 'getEvents');
  },

  async getEvent(id: string): Promise<Event> {
    return apiCall(async () => {
      const response = await apiClient.get<ApiResponse<Event>>(`/events/${id}`);
      return response.data.data;
    }, `getEvent(${id})`);
  },

  /**
   * Create a new event
   *
   * Supports progressive creation - only name is required.
   * Other fields can be provided in subsequent update calls.
   *
   * @throws {EventServiceError} When validation fails or server error occurs
   */
  async createEvent(data: CreateEventRequest): Promise<Event> {
    return apiCall(async () => {
      const response = await apiClient.post<ApiResponse<Event>>('/events', data);
      return response.data.data;
    }, 'createEvent');
  },

  /**
   * Update an existing event
   *
   * Supports partial updates. Set fields to null to clear them.
   *
   * @throws {EventServiceError} When event not found, validation fails, or server error occurs
   */
  async updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
    return apiCall(async () => {
      const response = await apiClient.patch<ApiResponse<Event>>(`/events/${id}`, data);
      return response.data.data;
    }, `updateEvent(${id})`);
  },

  /**
   * Delete an event by ID
   *
   * @throws {EventServiceError} When event not found or server error occurs
   */
  async deleteEvent(id: string): Promise<{ deleted: boolean }> {
    return apiCall(async () => {
      const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/events/${id}`);
      return response.data.data;
    }, `deleteEvent(${id})`);
  },

  // Constants for UI consumption
  DROPDOWN_LIST_LIMIT,
};
