/**
 * String utility functions
 */

/**
 * Capitalize first letter of a string
 * @param str - Input string
 * @returns String with first letter capitalized, rest lowercase
 * @example capitalizeFirst('john') => 'John'
 * @example capitalizeFirst('SMITH') => 'Smith'
 */
export function capitalizeFirst(str: string | null | undefined): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

