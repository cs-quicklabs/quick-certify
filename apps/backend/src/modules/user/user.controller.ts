import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Roles } from '@src/modules/auth/decorators';
import { RolesGuard, OrganizationGuard } from '@src/modules/auth/guards';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';
import { Role } from '@src/modules/role/enums';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@CurrentUser() user: CurrentUserType, @Query() pagination: PaginationDto) {
    // Super admin can see all users, admin can see only their organization
    if (user.role === 'super_admin') {
      const result = pagination.search
        ? await this.userService.searchUsers(user.organizationId, pagination.search, pagination)
        : await this.userService.findAll(pagination);
      return new SuccessResponse('Users retrieved successfully', result);
    }

    const result = pagination.search
      ? await this.userService.searchUsers(user.organizationId, pagination.search, pagination)
      : await this.userService.findAllByOrganization(user.organizationId, pagination);
    return new SuccessResponse('Users retrieved successfully', result);
  }

  @Get(':id')
  @UseGuards(OrganizationGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    // Admin can access their own org users, super admin can access all
    const foundUser =
      user.role === 'super_admin'
        ? await this.userService.findOne(id)
        : await this.userService.findOneByOrganization(id, user.organizationId);

    if (!foundUser) {
      return new SuccessResponse('User not found', null);
    }

    return new SuccessResponse('User retrieved successfully', foundUser);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateUserDto) {
    // Admin can only create users in their organization
    if (user.role !== 'super_admin') {
      dto.organizationId = user.organizationId;
    }

    const newUser = await this.userService.create(dto);
    return new SuccessResponse('User created successfully', newUser);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, OrganizationGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    // Verify user belongs to organization (for non-super admin)
    if (user.role !== 'super_admin') {
      const existingUser = await this.userService.findOneByOrganization(id, user.organizationId);
      if (!existingUser) {
        return new SuccessResponse('User not found', null);
      }
    }

    const updatedUser = await this.userService.update(id, dto);
    return new SuccessResponse('User updated successfully', updatedUser);
  }

  @Delete(':id')
  @UseGuards(RolesGuard, OrganizationGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete user (soft delete) (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    // Verify user belongs to organization (for non-super admin)
    if (user.role !== 'super_admin') {
      const existingUser = await this.userService.findOneByOrganization(id, user.organizationId);
      if (!existingUser) {
        return new SuccessResponse('User not found', null);
      }
    }

    // Prevent deleting yourself
    if (user.id === id) {
      return new SuccessResponse('Cannot delete your own account', null);
    }

    await this.userService.softDelete(id);
    return new SuccessResponse('User deleted successfully', { deleted: true });
  }

  @Post(':id/restore')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Restore deleted user (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async restore(@Param('id') id: string) {
    const restoredUser = await this.userService.restore(id);
    return new SuccessResponse('User restored successfully', restoredUser);
  }
}
