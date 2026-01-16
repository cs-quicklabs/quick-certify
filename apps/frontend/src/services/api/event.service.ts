/**
 * Event Service - API client for event management
 */

import { apiClient, ApiResponse } from './api-client';

export interface EventType {
    id: string;
    name: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface EventLevel {
    id: string;
    name: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface EventFormat {
    id: string;
    name: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Event {
    id: string;
    name: string;
    event_type_id: string;
    event_level_id: string;
    event_format_id: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
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

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface EventFilters {
    page?: number;
    limit?: number;
    type?: string;
    level?: string;
    format?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export const eventService = {
    // Event Types
    async getEventTypes(filters?: { page?: number; limit?: number }): Promise<PaginatedResponse<EventType>> {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        const response = await apiClient.get<ApiResponse<PaginatedResponse<EventType>>>(`/event-types?${params.toString()}`);
        return response.data.data;
    },

    async getEventType(id: string): Promise<EventType> {
        const response = await apiClient.get<ApiResponse<EventType>>(`/event-types/${id}`);
        return response.data.data;
    },

    async createEventType(data: CreateEventTypeRequest): Promise<EventType> {
        const response = await apiClient.post<ApiResponse<EventType>>('/event-types', data);
        return response.data.data;
    },

    async updateEventType(id: string, data: UpdateEventTypeRequest): Promise<EventType> {
        const response = await apiClient.patch<ApiResponse<EventType>>(`/event-types/${id}`, data);
        return response.data.data;
    },

    async deleteEventType(id: string): Promise<{ deleted: boolean }> {
        const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/event-types/${id}`);
        return response.data.data;
    },

    // Event Levels
    async getEventLevels(filters?: { page?: number; limit?: number }): Promise<PaginatedResponse<EventLevel>> {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        const response = await apiClient.get<ApiResponse<PaginatedResponse<EventLevel>>>(`/event-levels?${params.toString()}`);
        return response.data.data;
    },

    async getEventLevel(id: string): Promise<EventLevel> {
        const response = await apiClient.get<ApiResponse<EventLevel>>(`/event-levels/${id}`);
        return response.data.data;
    },

    async createEventLevel(data: CreateEventLevelRequest): Promise<EventLevel> {
        const response = await apiClient.post<ApiResponse<EventLevel>>('/event-levels', data);
        return response.data.data;
    },

    async updateEventLevel(id: string, data: UpdateEventLevelRequest): Promise<EventLevel> {
        const response = await apiClient.patch<ApiResponse<EventLevel>>(`/event-levels/${id}`, data);
        return response.data.data;
    },

    async deleteEventLevel(id: string): Promise<{ deleted: boolean }> {
        const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/event-levels/${id}`);
        return response.data.data;
    },

    // Event Formats
    async getEventFormats(filters?: { page?: number; limit?: number }): Promise<PaginatedResponse<EventFormat>> {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        const response = await apiClient.get<ApiResponse<PaginatedResponse<EventFormat>>>(`/event-formats?${params.toString()}`);
        return response.data.data;
    },

    async getEventFormat(id: string): Promise<EventFormat> {
        const response = await apiClient.get<ApiResponse<EventFormat>>(`/event-formats/${id}`);
        return response.data.data;
    },

    async createEventFormat(data: CreateEventFormatRequest): Promise<EventFormat> {
        const response = await apiClient.post<ApiResponse<EventFormat>>('/event-formats', data);
        return response.data.data;
    },

    async updateEventFormat(id: string, data: UpdateEventFormatRequest): Promise<EventFormat> {
        const response = await apiClient.patch<ApiResponse<EventFormat>>(`/event-formats/${id}`, data);
        return response.data.data;
    },

    async deleteEventFormat(id: string): Promise<{ deleted: boolean }> {
        const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/event-formats/${id}`);
        return response.data.data;
    },

    // Events
    async getEvents(filters?: EventFilters): Promise<PaginatedResponse<Event>> {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.type) params.append('type', filters.type);
        if (filters?.level) params.append('level', filters.level);
        if (filters?.format) params.append('format', filters.format);
        if (filters?.sortBy) params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Event>>>(`/events?${params.toString()}`);
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

