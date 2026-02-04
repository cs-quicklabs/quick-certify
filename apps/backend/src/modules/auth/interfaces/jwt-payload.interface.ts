export interface JwtPayload {
  sub: string; // user uuid (nanoid)
  email: string;
  organizationId: number | null; // null for system_admin
  organizationUuid: string | null; // null for system_admin
  roleId: number;
  roleUuid: string; // role uuid (nanoid)
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
  id: number; // user id
  uuid: string; // user uuid
  email: string;
  firstName: string;
  lastName: string | null;
  organizationUuid: string | null; // null for system_admin
  organizationId: number | null; // null for system_admin
  roleUuid: string; // nanoid
  roleId: number;
  role: string; // role name
  sessionHash: string;
}
