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
  learning_link?: string | null;
  event_type_id?: string | null;
  event_level_id?: string | null;
  event_format_id?: string | null;
  design_id?: string | null;
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
