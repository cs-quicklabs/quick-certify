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
import { EventLevelService } from '../services/event-level.service';
import { CreateEventLevelDto, UpdateEventLevelDto } from '../dtos';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';

@ApiTags('Event Levels')
@ApiBearerAuth()
@Controller({ path: 'event-levels', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.DESIGNER, Role.MANAGER)
export class EventLevelController {
  constructor(private readonly eventLevelService: EventLevelService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event level (Admin/Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Event level created successfully' })
  @ApiResponse({ status: 409, description: 'Event level name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateEventLevelDto) {
    const eventLevel = await this.eventLevelService.create(user.organizationUuid, dto);
    return new SuccessResponse('Event level created successfully', eventLevel);
  }

  @Get()
  @ApiOperation({
    summary:
      'Get all event levels for current organization (ordered by created_at ASC, only active)',
  })
  @ApiResponse({ status: 200, description: 'Event levels list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@CurrentUser() user: CurrentUserType, @Query() pagination: PaginationDto) {
    const result = await this.eventLevelService.findAll(user.organizationUuid, pagination);
    return new SuccessResponse('Event levels retrieved successfully', result);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get event level by UUID (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Event level found' })
  @ApiResponse({ status: 404, description: 'Event level not found' })
  async findOne(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const eventLevel = await this.eventLevelService.findByUuid(uuid, user.organizationUuid);
    if (!eventLevel) {
      return new SuccessResponse('Event level not found', null);
    }
    return new SuccessResponse('Event level retrieved successfully', eventLevel);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update event level (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Event level updated successfully' })
  @ApiResponse({ status: 404, description: 'Event level not found' })
  @ApiResponse({ status: 409, description: 'Event level name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateEventLevelDto,
  ) {
    const eventLevel = await this.eventLevelService.updateByUuid(uuid, user.organizationUuid, dto);
    return new SuccessResponse('Event level updated successfully', eventLevel);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Soft delete event level (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Event level deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event level not found' })
  async remove(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    await this.eventLevelService.deleteByUuid(uuid, user.organizationUuid);
    return new SuccessResponse('Event level deleted successfully', { deleted: true });
  }
}
