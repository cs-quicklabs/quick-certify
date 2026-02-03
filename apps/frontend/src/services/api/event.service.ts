/**
 * Event Service - API client for event management
 *
 * Uses centralized query params utility for consistent URL building.
 */

import { PaginatedResponse } from '@/types';
import { apiClient, ApiResponse } from './api-client';
import { buildUrl } from '@/lib/query-params';

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

export interface Event extends IBaseEvent {
  event_type_id: string;
  event_level_id: string;
  event_format_id: string;
  event_type?: EventType;
  event_level?: EventLevel;
  event_format?: EventFormat;
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

export interface CreateEventRequest {
  name: string;
  eventTypeId: string;
  eventLevelId: string;
  eventFormatId: string;
}

export interface UpdateEventRequest {
  name?: string;
  eventTypeId?: string;
  eventLevelId?: string;
  eventFormatId?: string;
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
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const eventService = {
  // Event Types
  async getEventTypes(filters?: PaginationFilters): Promise<PaginatedResponse<EventType>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<EventType>>>(
      buildUrl('/event-types', filters),
    );
    return response.data.data;
  },

  async getEventType(id: string): Promise<EventType> {
    const response = await apiClient.get<ApiResponse<EventType>>(`/event-types/${id}`);
    return response.data.data;
  },

  async createEventType(data: CreateEventTypeRequest): Promise<ApiResponse<EventType>> {
    const response = await apiClient.post<ApiResponse<EventType>>('/event-types', data);
    return response.data;
  },

  async updateEventType(id: string, data: UpdateEventTypeRequest): Promise<ApiResponse<EventType>> {
    const response = await apiClient.patch<ApiResponse<EventType>>(`/event-types/${id}`, data);
    return response.data;
  },

  async deleteEventType(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      `/event-types/${id}`,
    );
    return response.data;
  },

  // Event Levels
  async getEventLevels(filters?: PaginationFilters): Promise<PaginatedResponse<EventLevel>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<EventLevel>>>(
      buildUrl('/event-levels', filters),
    );
    return response.data.data;
  },

  async getEventLevel(id: string): Promise<EventLevel> {
    const response = await apiClient.get<ApiResponse<EventLevel>>(`/event-levels/${id}`);
    return response.data.data;
  },

  async createEventLevel(data: CreateEventLevelRequest): Promise<ApiResponse<EventLevel>> {
    const response = await apiClient.post<ApiResponse<EventLevel>>('/event-levels', data);
    return response.data;
  },

  async updateEventLevel(
    id: string,
    data: UpdateEventLevelRequest,
  ): Promise<ApiResponse<EventLevel>> {
    const response = await apiClient.patch<ApiResponse<EventLevel>>(`/event-levels/${id}`, data);
    return response.data;
  },

  async deleteEventLevel(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      `/event-levels/${id}`,
    );
    return response.data;
  },

  // Event Formats
  async getEventFormats(filters?: PaginationFilters): Promise<PaginatedResponse<EventFormat>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<EventFormat>>>(
      buildUrl('/event-formats', filters),
    );
    return response.data.data;
  },

  async getEventFormat(id: string): Promise<EventFormat> {
    const response = await apiClient.get<ApiResponse<EventFormat>>(`/event-formats/${id}`);
    return response.data.data;
  },

  async createEventFormat(data: CreateEventFormatRequest): Promise<ApiResponse<EventFormat>> {
    const response = await apiClient.post<ApiResponse<EventFormat>>('/event-formats', data);
    return response.data;
  },

  async updateEventFormat(
    id: string,
    data: UpdateEventFormatRequest,
  ): Promise<ApiResponse<EventFormat>> {
    const response = await apiClient.patch<ApiResponse<EventFormat>>(`/event-formats/${id}`, data);
    return response.data;
  },

  async deleteEventFormat(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      `/event-formats/${id}`,
    );
    return response.data;
  },

  // Events
  async getEvents(filters?: EventFilters): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Event>>>(
      buildUrl('/events', filters),
    );
    return response.data.data;
  },

  async getEvent(id: string): Promise<Event> {
    const response = await apiClient.get<ApiResponse<Event>>(`/events/${id}`);
    return response.data.data;
  },

  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post<ApiResponse<Event>>('/events', data);
    return response.data.data;
  },

  async updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
    const response = await apiClient.patch<ApiResponse<Event>>(`/events/${id}`, data);
    return response.data.data;
  },

  async deleteEvent(id: string): Promise<{ deleted: boolean }> {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/events/${id}`);
    return response.data.data;
  },
};
