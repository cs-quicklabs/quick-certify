/**
 * Design Dimension Rules
 */
export const IMAGE_RULES = {
  certificate: {
    minHeight: 800,
    minWidth: 1100,
    label: 'Certificate (A4-like)',
  },
  badge: {
    minHeight: 400,
    minWidth: 440,
    label: 'Badge (Square)',
  },
} as const;

export type DesignType = keyof typeof IMAGE_RULES;
