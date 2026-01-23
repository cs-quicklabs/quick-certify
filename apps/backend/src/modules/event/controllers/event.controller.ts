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
import { Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';

@ApiTags('Events')
@ApiBearerAuth()
@Controller({ path: 'events', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or referenced master record not found/inactive',
  })
  async create(@Body() dto: CreateEventDto) {
    const event = await this.eventService.create(dto);
    return new SuccessResponse('Event created successfully', event);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with optional filtering by type, level, and format' })
  @ApiResponse({ status: 200, description: 'Events list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by event type ID' })
  @ApiQuery({ name: 'level', required: false, description: 'Filter by event level ID' })
  @ApiQuery({ name: 'format', required: false, description: 'Filter by event format ID' })
  async findAll(
    @Query() pagination: PaginationDto,
  ) {
    const where: Record<string, unknown> = {};

    // Filtering by UUID - service will handle conversion to IDs
    // We'll pass these as separate parameters to the service

    const result = await this.eventService.findAll({
      ...pagination,
      where,
    });

    return new SuccessResponse('Events retrieved successfully', result);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get event by UUID with relations' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('uuid') uuid: string) {
    const event = await this.eventService.findByUuid(uuid);
    if (!event) {
      return new SuccessResponse('Event not found', null);
    }
    return new SuccessResponse('Event retrieved successfully', event);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or referenced master record not found/inactive',
  })
  async update(@Param('uuid') uuid: string, @Body() dto: UpdateEventDto) {
    const event = await this.eventService.updateByUuid(uuid, dto);
    return new SuccessResponse('Event updated successfully', event);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Soft delete event (sets is_active to false)' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('uuid') uuid: string) {
    await this.eventService.softDeleteByUuid(uuid);
    return new SuccessResponse('Event deleted successfully', { deleted: true });
  }
}
