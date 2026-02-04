/**
 * Represents the layout configuration for a design template with text placeholders.
 *
 * @interface DesignLayout
 *
 * @property {Array<Object>} placeholders - Array of placeholder objects that define text elements in the design
 * @property {string} placeholders[].id - Unique identifier for the placeholder (e.g., "recipient_name", "recipient_email")
 * @property {'text'} placeholders[].type - The type of placeholder element
 * @property {'recipient.name' | 'recipient.email'} placeholders[].key - Semantic key that maps to data source fields
 * @property {string} placeholders[].text - Default or template text to display (e.g., "[recipient.name]")
 * @property {number} placeholders[].x - Horizontal position in pixels
 * @property {number} placeholders[].y - Vertical position in pixels
 * @property {number} placeholders[].fontSize - Font size in pixels
 * @property {string} placeholders[].fontFamily - Font family name (e.g., "Times New Roman")
 * @property {string} [placeholders[].fontWeight] - Optional font weight (e.g., "bold", "normal")
 * @property {string} placeholders[].color - Text color in hex format (e.g., "#000")
 * @property {'left' | 'center' | 'right'} [placeholders[].align] - Optional text alignment
 *
 * @example
 * const layout: DesignLayout = {
 *   placeholders: [
 *     {
 *       id: "recipient_name",
 *       type: "text",
 *       key: "recipient.name",
 *       text: "[recipient.name]",
 *       x: 550,
 *       y: 420,
 *       fontSize: 42,
 *       fontFamily: "Times New Roman",
 *       color: "#000",
 *       align: "center"
 *     }
 *   ]
 * };
 */

export interface DesignLayout {
  placeholders: Array<{
    id: string;
    type: 'text';
    key: 'recipient.name' | 'recipient.email';
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    fontWeight?: string;
    color: string;
    align?: 'left' | 'center' | 'right';
  }>;
}
