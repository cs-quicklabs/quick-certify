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

/**
 * Extract and normalize domain from a URL
 * Removes protocol, www prefix, paths, and query strings
 * @param url - Full URL string
 * @returns Normalized domain (lowercase, without www)
 * @example extractDomain('https://www.Example.com/page') => 'example.com'
 * @example extractDomain('http://sub.example.com?query=1') => 'sub.example.com'
 * @example extractDomain('https://EXAMPLE.COM/') => 'example.com'
 */
export function extractDomain(url: string | null | undefined): string {
  if (!url) return '';

  try {
    // Handle URLs without protocol
    let normalizedUrl = url.trim().toLowerCase();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const urlObj = new URL(normalizedUrl);
    let hostname = urlObj.hostname;

    // Remove 'www.' prefix if present
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }

    return hostname;
  } catch {
    // If URL parsing fails, try basic extraction
    let domain = url.trim().toLowerCase();

    // Remove protocol
    domain = domain.replace(/^https?:\/\//, '');

    // Remove www.
    domain = domain.replace(/^www\./, '');

    // Remove path, query string, and fragment
    domain = domain.split('/')[0].split('?')[0].split('#')[0];

    return domain;
  }
}
