import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { CurrentUser } from '../interfaces';
import { Role } from '@src/modules/role/enums';
import { GuardHelper } from './guard-helpers';
import { Reflector } from '@nestjs/core';

/**
 * Guard to ensure users can only access resources within their organization (multi-tenant)
 * This guard checks if the organizationId in the request params/body matches the user's organizationId
 * System admins can access any organization's resources
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    if (GuardHelper.isPublicRoute(this.reflector, context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    // System admins can access any organization
    if (user.role === Role.SYSTEM_ADMIN) {
      return true;
    }

    // Get organizationId from params, query, or body
    const requestOrgId =
      request.params?.organizationId ||
      request.query?.organizationId ||
      request.body?.organizationId;

    // If no organizationId in request, allow (might be fetching own data)
    if (!requestOrgId) {
      return true;
    }

    // Check if user belongs to the requested organization
    if (user.organizationId !== requestOrgId) {
      throw new ForbiddenException("You do not have access to this organization's resources");
    }

    return true;
  }
}
