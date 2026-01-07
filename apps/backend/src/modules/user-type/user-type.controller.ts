import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserTypeService } from './user-type.service';
import { CreateUserTypeDto, UpdateUserTypeDto } from './dtos';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';

@ApiTags('User Types')
@ApiBearerAuth()
@Controller({ path: 'user-types', version: '1' })
export class UserTypeController {
  constructor(private readonly userTypeService: UserTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user types' })
  @ApiResponse({ status: 200, description: 'User types list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    const result = pagination.search
      ? await this.userTypeService.searchUserTypes(pagination.search, pagination)
      : await this.userTypeService.findAll(pagination);
    return new SuccessResponse('User types retrieved successfully', result);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active user types' })
  @ApiResponse({ status: 200, description: 'Active user types list' })
  async findAllActive() {
    const userTypes = await this.userTypeService.findAllActive();
    return new SuccessResponse('Active user types retrieved successfully', userTypes);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user type by ID' })
  @ApiResponse({ status: 200, description: 'User type found' })
  @ApiResponse({ status: 404, description: 'User type not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const userType = await this.userTypeService.findOne(id);
    if (!userType) {
      return new SuccessResponse('User type not found', null);
    }
    return new SuccessResponse('User type retrieved successfully', userType);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get user type by code' })
  @ApiResponse({ status: 200, description: 'User type found' })
  @ApiResponse({ status: 404, description: 'User type not found' })
  async findByCode(@Param('code') code: string) {
    const userType = await this.userTypeService.findByCode(code);
    if (!userType) {
      return new SuccessResponse('User type not found', null);
    }
    return new SuccessResponse('User type retrieved successfully', userType);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new user type (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'User type created successfully' })
  @ApiResponse({ status: 409, description: 'User type code already exists' })
  async create(@Body() dto: CreateUserTypeDto) {
    const userType = await this.userTypeService.create(dto);
    return new SuccessResponse('User type created successfully', userType);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update user type (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User type updated successfully' })
  @ApiResponse({ status: 404, description: 'User type not found' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserTypeDto) {
    const userType = await this.userTypeService.update(id, dto);
    return new SuccessResponse('User type updated successfully', userType);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete user type (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User type deleted successfully' })
  @ApiResponse({ status: 404, description: 'User type not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete system user types' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userTypeService.delete(id);
    return new SuccessResponse('User type deleted successfully', { deleted: true });
  }

  @Patch(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Toggle user type active status (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User type status toggled' })
  @ApiResponse({ status: 404, description: 'User type not found' })
  async toggleActive(@Param('id', ParseIntPipe) id: number) {
    const userType = await this.userTypeService.toggleActive(id);
    return new SuccessResponse(
      `User type ${userType.is_active ? 'activated' : 'deactivated'} successfully`,
      userType,
    );
  }
}
