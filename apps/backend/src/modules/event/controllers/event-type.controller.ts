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
import { EventTypeService } from '../services/event-type.service';
import { CreateEventTypeDto, UpdateEventTypeDto } from '../dtos';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';

@ApiTags('Event Types')
@ApiBearerAuth()
@Controller({ path: 'event-types', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.DESIGNER, Role.MANAGER)
export class EventTypeController {
  constructor(private readonly eventTypeService: EventTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event type (Admin/Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Event type created successfully' })
  @ApiResponse({ status: 409, description: 'Event type name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateEventTypeDto) {
    const eventType = await this.eventTypeService.create(user.organizationUuid, dto);
    return new SuccessResponse('Event type created successfully', eventType);
  }

  @Get()
  @ApiOperation({
    summary:
      'Get all event types for current organization (ordered by created_at ASC, only active)',
  })
  @ApiResponse({ status: 200, description: 'Event types list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@CurrentUser() user: CurrentUserType, @Query() pagination: PaginationDto) {
    const result = await this.eventTypeService.findAll(user.organizationUuid, pagination);
    return new SuccessResponse('Event types retrieved successfully', result);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get event type by UUID (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Event type found' })
  @ApiResponse({ status: 404, description: 'Event type not found' })
  async findOne(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const eventType = await this.eventTypeService.findByUuid(uuid, user.organizationUuid);
    if (!eventType) {
      return new SuccessResponse('Event type not found', null);
    }
    return new SuccessResponse('Event type retrieved successfully', eventType);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update event type (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Event type updated successfully' })
  @ApiResponse({ status: 404, description: 'Event type not found' })
  @ApiResponse({ status: 409, description: 'Event type name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateEventTypeDto,
  ) {
    const eventType = await this.eventTypeService.updateByUuid(uuid, user.organizationUuid, dto);
    return new SuccessResponse('Event type updated successfully', eventType);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Soft delete event type (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Event type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event type not found' })
  async remove(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    await this.eventTypeService.deleteByUuid(uuid, user.organizationUuid);
    return new SuccessResponse('Event type deleted successfully', { deleted: true });
  }
}
