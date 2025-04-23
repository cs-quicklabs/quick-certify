export type AuthConfig = {
  saltOrRounds: number;
  accessTokenSecret: string;
  accessTokenExpires: string;
  refreshTokenSecret: string;
  refreshTokenExpires: string;
  refreshTokenRememberMeExpires: string;
};
