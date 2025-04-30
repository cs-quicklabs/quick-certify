import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_REFRESH_TOKEN_STRATEGY_NAME } from '../strategies';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard(
  JWT_REFRESH_TOKEN_STRATEGY_NAME
) {}
