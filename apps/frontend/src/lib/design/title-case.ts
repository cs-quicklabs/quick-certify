export function toTitleCase(value: string): string {
  return value
    .split(' ')
    .map((word) => {
      if (!word) return word;

      // If word is fully uppercase already, keep it
      if (word === word.toUpperCase()) return word;

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
