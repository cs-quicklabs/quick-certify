import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/sequelize';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators';
import { CurrentUser } from '../interfaces';
import { TokenService, SessionService } from '../services';
import { UserEntity, UserTypeEntity } from '@src/entities';

/**
 * JWT Auth Guard
 *
 * SRP: Responsible only for authentication flow control
 * DIP: Depends on TokenService and SessionService abstractions
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
    @InjectModel(UserEntity)
    private readonly userModel: typeof UserEntity,
  ) {}

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

  private async findValidUser(userId: number): Promise<UserEntity> {
    const user = await this.userModel.findOne({
      where: { id: userId },
      include: [{ model: UserTypeEntity }],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.deleted_at) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    return user;
  }

  private attachUserToRequest(request: Request, user: UserEntity, sessionHash: string): void {
    const currentUser: CurrentUser = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      organizationId: user.organization_id,
      userTypeId: user.user_type_id,
      userTypeCode: user.user_type?.code || '',
      sessionHash,
    };

    (request as Request & { user: CurrentUser }).user = currentUser;
  }
}
