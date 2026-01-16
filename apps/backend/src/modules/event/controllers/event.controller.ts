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
  @ApiResponse({ status: 400, description: 'Validation error or referenced master record not found/inactive' })
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
    @Query('type') type?: string,
    @Query('level') level?: string,
    @Query('format') format?: string,
  ) {
    const where: Record<string, unknown> = {};

    if (type) {
      where.event_type_id = type;
    }

    if (level) {
      where.event_level_id = level;
    }

    if (format) {
      where.event_format_id = format;
    }

    const result = await this.eventService.findAll({
      ...pagination,
      where,
    });

    return new SuccessResponse('Events retrieved successfully', result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID with relations' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id') id: string) {
    const event = await this.eventService.findOne(id);
    if (!event) {
      return new SuccessResponse('Event not found', null);
    }
    return new SuccessResponse('Event retrieved successfully', event);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Validation error or referenced master record not found/inactive' })
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    const event = await this.eventService.update(id, dto);
    return new SuccessResponse('Event updated successfully', event);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete event (sets is_active to false)' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id') id: string) {
    await this.eventService.softDelete(id);
    return new SuccessResponse('Event deleted successfully', { deleted: true });
  }
}

