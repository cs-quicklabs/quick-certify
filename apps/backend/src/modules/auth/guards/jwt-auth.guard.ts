import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { JWT_ACCESS_TOKEN_STRATEGY_NAME } from '../strategies';

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_ACCESS_TOKEN_STRATEGY_NAME) {}
