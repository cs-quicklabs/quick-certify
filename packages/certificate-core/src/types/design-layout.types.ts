/**
 * Placeholder key types that map to data source fields.
 * Used in design templates to define which dynamic value replaces the placeholder.
 */
export type PlaceholderKey =
  | 'recipient.name'
  | 'recipient.email'
  | 'credential.id'
  | 'credential.issue_date'
  | 'credential.expiration_date'
  | 'event.name';

/**
 * Represents a single text placeholder element in a design template.
 */
export interface DesignLayoutPlaceholder {
  /** Unique identifier for the placeholder (e.g., "ph_abc123") */
  id: string;
  /** The type of placeholder element */
  type: 'text';
  /** Semantic key that maps to a data source field */
  key: PlaceholderKey;
  /** Display/template text (e.g., "{{name}}") */
  text: string;
  /** Horizontal position in pixels */
  x: number;
  /** Vertical position in pixels */
  y: number;
  /** Font size in pixels */
  fontSize: number;
  /** Font family name (e.g., "Times New Roman") */
  fontFamily: string;
  /** Optional font weight (e.g., "bold", "normal") */
  fontWeight?: string;
  /** Optional font style (e.g., "italic", "normal") */
  fontStyle?: string;
  /** Text color in hex format (e.g., "#000") */
  color: string;
  /** Optional text alignment */
  align?: 'left' | 'center' | 'right';
  /** Optional maximum width for text wrapping/truncation */
  maxWidth?: number;
  /** Horizontal scale factor from Fabric.js */
  scaleX?: number;
  /** Vertical scale factor from Fabric.js */
  scaleY?: number;
}

/**
 * Represents the layout configuration for a design template with text placeholders.
 */
export interface DesignLayout {
  /** Schema version for backward compatibility */
  version: 2;
  /** Canvas width in pixels */
  canvasWidth: number;
  /** Canvas height in pixels */
  canvasHeight: number;
  /** Array of placeholder elements */
  placeholders: DesignLayoutPlaceholder[];
}
