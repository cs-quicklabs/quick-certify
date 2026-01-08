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
import { UserTypeEnum } from '@src/commons/enums';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.MANAGER)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@CurrentUser() user: CurrentUserType, @Query() pagination: PaginationDto) {
    const result = pagination.search
      ? await this.userService.searchUsers(user.organizationId, pagination.search, pagination)
      : await this.userService.findAllByOrganization(user.organizationId, pagination);
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
      user.organizationId,
    );
    if (!foundUser) {
      return new SuccessResponse('User not found', null);
    }
    return new SuccessResponse('User retrieved successfully', foundUser);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.MANAGER)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateUserDto) {
    // user creations are only allowed for managers and super admins
    dto.organizationId = user.organizationId;
    const newUser = await this.userService.create(dto, user);
    return new SuccessResponse('User created successfully', newUser);
  }

  @Patch(':uuid')
  @UseGuards(RolesGuard, OrganizationGuard)
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.MANAGER)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateUserDto,
  ) {
    const existingUser = await this.userService.findOneByUuidAndOrganization(
      uuid,
      user.organizationId,
    );
    if (!existingUser) {
      return new SuccessResponse('User not found', null);
    }

    const updatedUser = await this.userService.update(existingUser.id, dto);
    return new SuccessResponse('User updated successfully', updatedUser);
  }

  @Delete(':uuid')
  @UseGuards(RolesGuard, OrganizationGuard)
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.MANAGER)
  @ApiOperation({ summary: 'Delete user (soft delete) (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const existingUser = await this.userService.findOneByUuidAndOrganization(
      uuid,
      user.organizationId,
    );
    if (!existingUser) {
      return new SuccessResponse('User not found', null);
    }

    // Prevent deleting yourself
    if (user.id === existingUser.id) {
      return new SuccessResponse('Cannot delete your own account', null);
    }

    await this.userService.softDelete(existingUser.id);
    return new SuccessResponse('User deleted successfully', { deleted: true });
  }

  @Post(':uuid/restore')
  @UseGuards(RolesGuard)
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Restore deleted user (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async restore(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const existingUser = await this.userService.findOneByUuidAndOrganization(
      uuid,
      user.organizationId,
    );
    if (!existingUser) {
      return new SuccessResponse('User not found', null);
    }
    const restoredUser = await this.userService.restore(existingUser.id);
    return new SuccessResponse('User restored successfully', restoredUser);
  }
}
