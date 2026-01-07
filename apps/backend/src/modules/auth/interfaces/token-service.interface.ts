import { JwtPayload, JwtTokens } from './jwt-payload.interface';

/**
 * Token Service Interface
 * SRP: Single responsibility for JWT token operations
 */
export interface ITokenService {
  /**
   * Generate access and refresh tokens for a user session
   */
  generateTokens(payload: TokenPayloadInput): JwtTokens;

  /**
   * Verify and decode a JWT token
   * @throws UnauthorizedException if token is invalid or expired
   */
  verifyToken(token: string): JwtPayload;

  /**
   * Decode a token without verification (for debugging)
   */
  decodeToken(token: string): JwtPayload | null;
}

export interface TokenPayloadInput {
  userId: number;
  userUuid: string;
  email: string;
  organizationId: number;
  userTypeCode: string;
  sessionHash: string;
}

export const TOKEN_SERVICE = Symbol('ITokenService');
