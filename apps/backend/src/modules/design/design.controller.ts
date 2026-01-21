import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DesignService } from "./design.services";
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import type { CurrentUser as CurrentUserType } from '../auth/interfaces';

import { Role } from '@src/modules/role/enums';
import { CreateDesignDto } from './dtos/create-design.dto';

@ApiTags('Designs')
@ApiBearerAuth()
@Controller({ path: 'organizations', version: '1' })
export class DesignController {
  constructor(private readonly designService: DesignService) { }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all organizations (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Design list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    const result = pagination.search
      ? await this.designService.searchDesigns(pagination.search, pagination)
      : await this.designService.findAll(pagination);
    return new SuccessResponse('Designs retrieved successfully', result)
  }


  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user/invitation (Admin/Super Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateDesignDto) {
    const newDesign = await this.designService.create(dto);
    return new SuccessResponse('Design created successfully', newDesign)
  }


}
