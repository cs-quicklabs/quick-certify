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
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';
import { CreateDesignDto } from './dtos/create-design.dto';
import { UpdateDesignDto } from './dtos/update-design.dto';
import type { CurrentUser as CurrentUserType } from '../auth/interfaces';
import { FindAllOptions } from '@src/commons/base';
import { GetDesignDto } from './dtos/get-design.dto';

@ApiTags('Designs')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.DESIGNER, Role.MANAGER)
@Controller({ path: 'designs', version: '1' })
export class DesignController {
  constructor(private readonly designService: DesignService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Designs (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Design list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(@CurrentUser() currentUser: CurrentUserType, @Query() pagination: GetDesignDto) {
    const { search, type, ...rest } = pagination;

    const options: FindAllOptions = {
      ...rest,
      where: {
        ...(type ? { type } : {}),
        organization_id: currentUser.organizationId,
      },
    };

    const result = search
      ? await this.designService.searchDesigns(search, options)
      : await this.designService.findAll(options);

    return new SuccessResponse('Designs retrieved successfully', result);
  }

  @Get(':uuid')
  @ApiResponse({ status: 200, description: 'Design found' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async findOne(@Param('uuid') uuid: string) {
    const design = await this.designService.findOneByUuid(uuid);
    return new SuccessResponse('Design retrieved successfully', design);
  }

  @Patch(':uuid')
  @ApiResponse({ status: 200, description: 'Design updated' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async update(@Param('uuid') uuid: string, @Body() dto: UpdateDesignDto) {
    const design = await this.designService.updateByUuid(uuid, dto);
    return new SuccessResponse('Design updated successfully', design);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new design (Admin/Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Design created successfully' })
  async create(@CurrentUser() currentUser: CurrentUserType, @Body() dto: CreateDesignDto) {
    const newDesign = await this.designService.createWithUser(currentUser, dto);
    return new SuccessResponse('Design created successfully', newDesign);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete Design (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Design deleted successfully' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async delete(@Param('uuid') uuid: string) {
    await this.designService.deleteByUuid(uuid);
    return new SuccessResponse('Design deleted successfully', { deleted: true });
  }
}
