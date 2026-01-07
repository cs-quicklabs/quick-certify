import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { CurrentUser } from '../interfaces';

/**
 * Guard to ensure users can only access resources within their organization (multi-tenant)
 * This guard checks if the organizationId in the request params/body matches the user's organizationId
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
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

    const orgIdNumber = parseInt(requestOrgId, 10);

    // Super admins can access any organization (you might want to customize this)
    if (user.userTypeCode === 'SUPER_ADMIN') {
      return true;
    }

    // Check if user belongs to the requested organization
    if (user.organizationId !== orgIdNumber) {
      throw new ForbiddenException("You do not have access to this organization's resources");
    }

    return true;
  }
}
