import { IsOptional, IsString } from 'class-validator';

export class AuthVariablesValidator {
  @IsOptional()
  SALT_OR_ROUNDS: string | number;

  @IsOptional()
  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsOptional()
  @IsString()
  ACCESS_TOKEN_EXPIRY: string;

  @IsOptional()
  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsOptional()
  @IsString()
  REFRESH_TOKEN_EXPIRY: string;

  @IsOptional()
  @IsString()
  REFRESH_REMEMBER_ME_EXPIRY: string;
}
