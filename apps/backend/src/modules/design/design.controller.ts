import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DesignService } from './design.services';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';
import { CreateDesignDto } from './dtos/create-design.dto';
import { UpdateDesignDto } from './dtos/update-design.dto';

@ApiTags('Designs')
@ApiBearerAuth()
@Controller({ path: 'designs', version: '1' })
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
    return new SuccessResponse('Designs retrieved successfully', result);
  }

  @Get(':uuid')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiResponse({ status: 200, description: 'Design found' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async findOne(@Param('uuid') uuid: string) {
    const design = await this.designService.findOne(uuid);
    if (!design) return new SuccessResponse('Design not found', null);
    return new SuccessResponse('Design retrieved successfully', design);
  }

  @Patch(':uuid')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiResponse({ status: 200, description: 'Design updated' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async update(@Param('uuid') uuid: string, dto: UpdateDesignDto) {
    const design = await this.designService.update(uuid, dto);
    return new SuccessResponse('Design updated successfully', design);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user/invitation (Admin/Super Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async create(@Body() dto: CreateDesignDto) {
    const newDesign = await this.designService.create(dto);
    return new SuccessResponse('Design created successfully', newDesign);
  }

  @Delete(':uuid')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete user (soft delete - archives user) (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('uuid') uuid: string) {
    const existingDesign = await this.designService.findOne(uuid);
    if (!existingDesign) {
      return new SuccessResponse('Design not found', null);
    }

    await this.designService.delete(uuid);
    return new SuccessResponse('Design deleted successfully', { deleted: true });
  }
}
