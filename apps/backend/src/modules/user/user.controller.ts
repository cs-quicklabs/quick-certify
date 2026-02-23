import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Roles } from '@src/modules/auth/decorators';
import { buildAuditContext } from '../audit/audit.context.builder';
import { RolesGuard, OrganizationGuard } from '@src/modules/auth/guards';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';
import { Role } from '@src/modules/role/enums';
import { EmailService } from '@src/commons/services';
import { UserPaginationRequestOptions } from './dtos/interface';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Users list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by role (admin, manager, designer)',
  })
  async findAll(@CurrentUser() user: CurrentUserType, @Query() pagination: PaginationDto) {
    // Only Admin and Super Admin can access team listing
    // Exclude the current logged-in user from the listing
    // Apply role-based visibility: Admin cannot see Super Admin, lower users cannot see Admin/Super Admin
    const options: UserPaginationRequestOptions = {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: pagination.sortBy || 'last_login_at',
      sortOrder: pagination.sortOrder || 'DESC',
      role: pagination.role,
      status: pagination.status,
      excludeUserUuid: user.uuid, // Exclude current user from results (user.id is UUID)
      currentUserRole: user.role, // Pass current user's role for role-based filtering
    };
    const result = pagination.search
      ? await this.userService.searchUsers(user.organizationId, pagination.search, options)
      : await this.userService.findAllByOrganization(user.organizationId, options);
    return new SuccessResponse('Users retrieved successfully', result);
  }

  @Get(':uuid')
  @UseGuards(OrganizationGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    // Admin can access their own org users, super admin can access all
    const foundUser = await this.userService.findOneByUuidAndOrganization(
      uuid,
      user.organizationUuid,
    );
    if (!foundUser) {
      return new SuccessResponse('User not found', null);
    }
    return new SuccessResponse('User retrieved successfully', foundUser);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user/invitation (Admin/Super Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async create(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateUserDto,
    @Req() req: Request,
  ) {
    // Only Admin and Super Admin can create users/invitations
    dto.organizationId = user.organizationId;
    const auditContext = buildAuditContext(req);
    const newUser = await this.userService.create(dto, user, { auditContext });

    // Send welcome email if user was created with password (not invitation)
    // Note: Invitation emails are sent by userService.create()
    if (dto.password && newUser.status === 'active') {
      this.emailService
        .sendWelcomeEmail(newUser.email, { name: newUser.first_name })
        .catch(console.error);
    }

    return new SuccessResponse('User created successfully', newUser);
  }

  @Patch(':uuid')
  @UseGuards(RolesGuard, OrganizationGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const existingUser = await this.userService.findOneByUuidAndOrganization(
      uuid,
      user.organizationUuid,
    );
    if (!existingUser) {
      return new SuccessResponse('User not found', null);
    }
    const auditContext = buildAuditContext(req);
    const updatedUser = await this.userService.update(existingUser.id, dto, user, { auditContext });
    return new SuccessResponse('User updated successfully', updatedUser);
  }

  @Delete(':uuid')
  @UseGuards(RolesGuard, OrganizationGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete user (soft delete - archives user) (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Req() req: Request,
  ) {
    const existingUser = await this.userService.findOneByUuidAndOrganization(
      uuid,
      user.organizationUuid,
    );

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting yourself (compare UUIDs)
    if (user.uuid === existingUser.uuid) {
      throw new UnauthorizedException('Cannot delete your own account');
    }

    const auditContext = buildAuditContext(req);
    await this.userService.softDelete(existingUser.id, auditContext);
    return new SuccessResponse('User deleted successfully', { deleted: true });
  }

  @Delete(':uuid/permanent')
  @UseGuards(RolesGuard, OrganizationGuard)
  @Roles(Role.SUPER_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Permanently delete archived user (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User permanently deleted' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found or not archived' })
  async permanentlyDelete(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const existingUser = await this.userService.findOneByUuidAndOrganization(
      uuid,
      user.organizationUuid,
    );

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // TODO: use soft delete status to determine if user can be permanently deleted instead of checking for archived role
    // Only allow permanent deletion of archived users
    if (existingUser.status !== 'archived') {
      throw new UnauthorizedException('Only archived users can be permanently deleted');
    }

    // Prevent deleting yourself
    if (user.uuid === existingUser.uuid) {
      throw new UnauthorizedException('Cannot delete your own account');
    }

    await this.userService.hardDelete(existingUser.id);
    return new SuccessResponse('User permanently deleted', { deleted: true });
  }

  @Post(':uuid/cancel-invitation')
  @UseGuards(RolesGuard, OrganizationGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Cancel invitation (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Invitation cancelled successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async cancelInvitation(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const existingUser = await this.userService.findOneByUuidAndOrganization(
      uuid,
      user.organizationUuid,
    );
    if (!existingUser) {
      return new SuccessResponse('User not found', null);
    }

    const updatedUser = await this.userService.cancelInvitation(existingUser.id);
    return new SuccessResponse('Invitation cancelled successfully', updatedUser);
  }

  @Post(':uuid/resend-invitation')
  @UseGuards(RolesGuard, OrganizationGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Resend invitation to inactive user (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Invitation sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resendInvitation(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const existingUser = await this.userService.findOneByUuidAndOrganization(
      uuid,
      user.organizationUuid,
    );
    if (!existingUser) {
      return new SuccessResponse('User not found', null);
    }

    const updatedUser = await this.userService.resendInvitation(existingUser.id, user);
    return new SuccessResponse('Invitation sent successfully', updatedUser);
  }

  @Post(':uuid/restore')
  @UseGuards(RolesGuard, OrganizationGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Restore deleted user (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async restore(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const existingUser = await this.userService.findOneByUuidAndOrganization(
      uuid,
      user.organizationUuid,
    );
    if (!existingUser) {
      return new SuccessResponse('User not found', null);
    }
    const restoredUser = await this.userService.restore(existingUser.id);
    return new SuccessResponse('User restored successfully', restoredUser);
  }
}
