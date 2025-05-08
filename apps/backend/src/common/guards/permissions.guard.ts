import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationUserService } from '@/modules/organization/organization-user.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private organizationUserService: OrganizationUserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    // Make sure user is authenticated
    if (!user) {
      throw new UnauthorizedException('User is not authenticated');
    }

    // Get organization ID from request params
    const organizationId = parseInt(params.id, 10);
    if (isNaN(organizationId)) {
      throw new UnauthorizedException('Invalid organization ID');
    }

    // Get the organization-user record
    const orgUser = await this.organizationUserService.getOne({
      where: { userId: user.id, organizationId },
      include: ['role'],
    });

    if (!orgUser) {
      throw new ForbiddenException(
        `You don't have access to this organization`
      );
    }

    // Check if the user has any of the required permissions
    for (const permission of requiredPermissions) {
      const hasPermission = await orgUser.hasPermission(permission);
      if (hasPermission) {
        return true;
      }
    }

    // Format the required permissions for the error message
    throw new ForbiddenException(
      `You don't have the required permissions  for this operation`
    );
  }
}
