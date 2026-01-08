export interface JwtPayload {
  sub: string; // user id (nanoid)
  email: string;
  organizationId: string; // nanoid
  roleId: string; // nanoid
  role: string; // role name
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
  id: string; // nanoid
  email: string;
  firstName: string;
  lastName: string | null;
  organizationId: string; // nanoid
  roleId: string; // nanoid
  role: string; // role name
  sessionHash: string;
}
