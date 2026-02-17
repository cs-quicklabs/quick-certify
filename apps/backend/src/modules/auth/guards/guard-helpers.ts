import { ExecutionContext } from '@nestjs/common';
import { IS_DISABLED_KEY, IS_PUBLIC_KEY } from '../decorators';
import { Reflector } from '@nestjs/core';

export class GuardHelper {
  static isPublicRoute(reflector: Reflector, context: ExecutionContext): boolean {
    return this.checkForRoute(reflector, context, IS_PUBLIC_KEY);
  }

  static isDisabledRoute(reflector: Reflector, context: ExecutionContext): boolean {
    return this.checkForRoute(reflector, context, IS_DISABLED_KEY);
  }

  static checkForRoute(reflector: Reflector, context: ExecutionContext, type: string) {
    return reflector.getAllAndOverride<boolean>(type, [context.getHandler(), context.getClass()]);
  }
}
