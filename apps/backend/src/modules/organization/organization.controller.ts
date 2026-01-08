import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dtos';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller({ path: 'organizations', version: '1' })
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all organizations (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Organizations list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    const result = pagination.search
      ? await this.organizationService.searchOrganizations(pagination.search, pagination)
      : await this.organizationService.findAll(pagination);
    return new SuccessResponse('Organizations retrieved successfully', result);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current user organization' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  async getCurrentOrganization(@CurrentUser() user: CurrentUserType) {
    const organization = await this.organizationService.findOne(user.organizationId);
    return new SuccessResponse('Organization retrieved successfully', organization);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findBySlug(@Param('slug') slug: string) {
    const organization = await this.organizationService.findBySlug(slug);
    if (!organization) {
      return new SuccessResponse('Organization not found', null);
    }
    return new SuccessResponse('Organization retrieved successfully', organization);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get organization by ID (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findOne(@Param('id') id: string) {
    const organization = await this.organizationService.findOne(id);
    if (!organization) {
      return new SuccessResponse('Organization not found', null);
    }
    return new SuccessResponse('Organization retrieved successfully', organization);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new organization (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  async create(@Body() dto: CreateOrganizationDto) {
    const organization = await this.organizationService.create(dto);
    return new SuccessResponse('Organization created successfully', organization);
  }

  @Patch('current')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update current user organization (Admin only)' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  async updateCurrentOrganization(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdateOrganizationDto,
  ) {
    const organization = await this.organizationService.update(user.organizationId, dto);
    return new SuccessResponse('Organization updated successfully', organization);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update organization (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    const organization = await this.organizationService.update(id, dto);
    return new SuccessResponse('Organization updated successfully', organization);
  }
}
