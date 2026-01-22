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
import { SkillService } from './skill.service';
import { CreateSkillDto, UpdateSkillDto } from './dtos';
import { Role } from '../role/enums';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';

@ApiTags('Skills')
@ApiBearerAuth()
@Controller({ path: 'skills', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Get()
  @ApiOperation({ summary: 'Get all skills for current organization (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Skills list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@CurrentUser() user: CurrentUserType, @Query() pagination: PaginationDto) {
    const result = pagination.search
      ? await this.skillService.searchSkills(user.organizationId, pagination.search, pagination)
      : await this.skillService.findAll(user.organizationId, pagination);
    return new SuccessResponse('Skills retrieved successfully', result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get skill by ID (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Skill found' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async findOne(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    const skill = await this.skillService.findOne(id, user.organizationId);
    if (!skill) {
      return new SuccessResponse('Skill not found', null);
    }
    return new SuccessResponse('Skill retrieved successfully', skill);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new skill (Admin/Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Skill created successfully' })
  @ApiResponse({ status: 409, description: 'Skill name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateSkillDto) {
    const skill = await this.skillService.create(user.organizationId, dto);
    return new SuccessResponse('Skill created successfully', skill);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update skill (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Skill updated successfully' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  @ApiResponse({ status: 409, description: 'Skill name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: UpdateSkillDto,
  ) {
    const skill = await this.skillService.update(id, user.organizationId, dto);
    return new SuccessResponse('Skill updated successfully', skill);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete skill (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Skill deleted successfully' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async remove(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    await this.skillService.delete(id, user.organizationId);
    return new SuccessResponse('Skill deleted successfully', { deleted: true });
  }
}
