/**
 * Capitalize first letter of a string
 * @example capitalizeFirst('john') => 'John'
 * @example capitalizeFirst('SMITH') => 'Smith'
 */
export function capitalizeFirst(str: string | null | undefined): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word. If a word is fully uppercase, keep it.
 * @example toTitleCase('best content award') => 'Best Content Award'
 * @example toTitleCase('HTML') => 'HTML'
 */
export function toTitleCase(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .split(' ')
    .map((word) => {
      if (!word) return word;
      if (word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
