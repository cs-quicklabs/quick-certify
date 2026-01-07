export interface JwtPayload {
  sub: number; // user id
  uuid: string; // user uuid
  email: string;
  organizationId: number;
  userTypeCode: string;
  sessionHash: string; // session hash for validation
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export interface CurrentUser {
  id: number;
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: number;
  userTypeId: number;
  userTypeCode: string;
  sessionHash: string;
}
