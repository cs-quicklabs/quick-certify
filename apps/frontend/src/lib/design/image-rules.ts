/**
 * Design Dimension Rules
 */
export const IMAGE_RULES = {
  certificate: {
    height: 800,
    width: 1108,
    label: 'Certificate (A4-like)',
  },
  badge: {
    height: 400,
    width: 440,
    label: 'Badge (Square)',
  },
} as const;

export const DIMENSION_TOLERANCE = {
  certificate: 5,
  badge: 2,
} as const;

export type DesignType = keyof typeof IMAGE_RULES;
