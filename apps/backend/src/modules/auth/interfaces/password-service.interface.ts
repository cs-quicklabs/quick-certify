/**
 * Password Service Interface
 * SRP: Single responsibility for password operations
 */
export interface IPasswordService {
  /**
   * Hash a plain text password
   */
  hash(password: string): Promise<string>;

  /**
   * Compare plain text password with hashed password
   */
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;

  /**
   * Generate a random reset token
   */
  generateResetToken(): string;
}

export const PASSWORD_SERVICE = Symbol('IPasswordService');
