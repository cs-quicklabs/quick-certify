import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators';
import { CurrentUser } from '../interfaces';
import { TokenService, SessionService } from '../services';
import { UserEntity, OrganizationEntity, RoleEntity } from '@src/entities';
import { UserService } from '../../user/user.service';
/**
 * JWT Auth Guard
 *
 * SRP: Responsible only for authentication flow control
 * DIP: Depends on TokenService, SessionService, and UserService abstractions
 *
 * Validates:
 * 1. Token presence and validity
 * 2. Session validity
 * 3. User existence and status
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    // Validate token
    const payload = this.tokenService.verifyToken(token);

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Validate session
    const session = await this.sessionService.validate(payload.sessionHash, payload.sub);
    if (!session) {
      throw new UnauthorizedException('Session not found or has been revoked');
    }

    // Validate user
    const user = await this.findValidUser(payload.sub);

    // Update session activity
    await this.sessionService.updateActivity(session);

    // Attach user to request
    this.attachUserToRequest(request, user, session.hash);

    return true;
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async findValidUser(userUuid: string): Promise<UserEntity> {
    const user = await this.userService.findByUuid(userUuid, {
      include: [
        { model: OrganizationEntity, as: 'organization' },
        { model: RoleEntity, as: 'role' },
      ],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account has been deactivated');
    }

    return user;
  }

  private attachUserToRequest(request: Request, user: UserEntity, sessionHash: string): void {
    // Load organization and role to get their UUIDs
    const organization = user.organization || null;
    const role = user.role || null;

    const currentUser: CurrentUser = {
      id: user.id, // Use UUID instead of ID
      uuid: user.uuid, // Use UUID instead of ID
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      organizationId: user.organization_id, // Keep ID for internal operations
      organizationUuid: organization?.uuid || '', // Add UUID for external operations
      roleId: user.role_id, // Keep ID for internal operations
      roleUuid: role?.uuid || '', // Add UUID for external operations
      role: role?.role || '',
      sessionHash,
    };

    (request as Request & { user: CurrentUser }).user = currentUser;
  }
}
