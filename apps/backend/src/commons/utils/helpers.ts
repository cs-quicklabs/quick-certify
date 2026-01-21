import * as crypto from 'crypto';

/**
 * Helper class for common functions
 */
export class Helpers {

  /**
   * Generate a random reset token
   * @returns A random reset token
   */
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
