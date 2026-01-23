import { SetMetadata } from '@nestjs/common';

export const IS_DISABLED_KEY = 'isDisabled';

/**
 * Decorator to mark a route as disabled (no authentication required)
 */
export const Disabled = () => SetMetadata(IS_DISABLED_KEY, true);
