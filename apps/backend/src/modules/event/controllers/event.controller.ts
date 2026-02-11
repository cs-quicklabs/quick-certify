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
import { EventService } from '../services/event.service';
import { CreateEventDto, UpdateEventDto } from '../dtos';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';

@ApiTags('Events')
@ApiBearerAuth()
@Controller({ path: 'events', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event for current organization' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 409, description: 'Event name already exists in organization' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or referenced master record not found/inactive',
  })
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateEventDto) {
    const event = await this.eventService.create(user.organizationUuid, dto);
    return new SuccessResponse('Event created successfully', event);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events for current organization' })
  @ApiResponse({ status: 200, description: 'Events list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@CurrentUser() user: CurrentUserType, @Query() pagination: PaginationDto) {
    const result = await this.eventService.findAll(user.organizationUuid, pagination);
    return new SuccessResponse('Events retrieved successfully', result);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get event by UUID within current organization' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const event = await this.eventService.findByUuid(uuid, user.organizationUuid);
    if (!event) {
      return new SuccessResponse('Event not found', null);
    }
    return new SuccessResponse('Event retrieved successfully', event);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update event within current organization' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 409, description: 'Event name already exists in organization' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or referenced master record not found/inactive',
  })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateEventDto,
  ) {
    const event = await this.eventService.updateByUuid(uuid, user.organizationUuid, dto);
    return new SuccessResponse('Event updated successfully', event);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Soft delete event within current organization' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    await this.eventService.deleteByUuid(uuid, user.organizationUuid);
    return new SuccessResponse('Event deleted successfully', { deleted: true });
  }
}
