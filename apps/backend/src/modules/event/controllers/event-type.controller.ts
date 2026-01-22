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
import { Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';

@ApiTags('Event Types')
@ApiBearerAuth()
@Controller({ path: 'event-types', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class EventTypeController {
  constructor(private readonly eventTypeService: EventTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event type' })
  @ApiResponse({ status: 201, description: 'Event type created successfully' })
  @ApiResponse({ status: 409, description: 'Event type name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateEventTypeDto) {
    const eventType = await this.eventTypeService.create(dto);
    return new SuccessResponse('Event type created successfully', eventType);
  }

  @Get()
  @ApiOperation({ summary: 'Get all event types (ordered by created_at ASC, only active)' })
  @ApiResponse({ status: 200, description: 'Event types list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.eventTypeService.findAll(pagination);
    return new SuccessResponse('Event types retrieved successfully', result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event type by ID' })
  @ApiResponse({ status: 200, description: 'Event type found' })
  @ApiResponse({ status: 404, description: 'Event type not found' })
  async findOne(@Param('id') id: string) {
    const eventType = await this.eventTypeService.findOne(id);
    if (!eventType) {
      return new SuccessResponse('Event type not found', null);
    }
    return new SuccessResponse('Event type retrieved successfully', eventType);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event type' })
  @ApiResponse({ status: 200, description: 'Event type updated successfully' })
  @ApiResponse({ status: 404, description: 'Event type not found' })
  @ApiResponse({ status: 409, description: 'Event type name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async update(@Param('id') id: string, @Body() dto: UpdateEventTypeDto) {
    const eventType = await this.eventTypeService.update(id, dto);
    return new SuccessResponse('Event type updated successfully', eventType);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete event type (sets is_active to false)' })
  @ApiResponse({ status: 200, description: 'Event type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event type not found' })
  async remove(@Param('id') id: string) {
    await this.eventTypeService.softDelete(id);
    return new SuccessResponse('Event type deleted successfully', { deleted: true });
  }
}
