export type AuthConfig = {
  saltOrRounds: string | number;
  accessTokenSecret: string;
  accessTokenExpires: string;
  refreshTokenSecret: string;
  refreshTokenExpires: string;
  refreshTokenRememberMeExpires: string;
};
