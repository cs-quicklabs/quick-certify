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
import { Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';

@ApiTags('Event Levels')
@ApiBearerAuth()
@Controller({ path: 'event-levels', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class EventLevelController {
  constructor(private readonly eventLevelService: EventLevelService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event level' })
  @ApiResponse({ status: 201, description: 'Event level created successfully' })
  @ApiResponse({ status: 409, description: 'Event level name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateEventLevelDto) {
    const eventLevel = await this.eventLevelService.create(dto);
    return new SuccessResponse('Event level created successfully', eventLevel);
  }

  @Get()
  @ApiOperation({ summary: 'Get all event levels (ordered by created_at ASC, only active)' })
  @ApiResponse({ status: 200, description: 'Event levels list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.eventLevelService.findAll(pagination);
    return new SuccessResponse('Event levels retrieved successfully', result);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get event level by UUID' })
  @ApiResponse({ status: 200, description: 'Event level found' })
  @ApiResponse({ status: 404, description: 'Event level not found' })
  async findOne(@Param('uuid') uuid: string) {
    const eventLevel = await this.eventLevelService.findByUuid(uuid);
    if (!eventLevel) {
      return new SuccessResponse('Event level not found', null);
    }
    return new SuccessResponse('Event level retrieved successfully', eventLevel);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update event level' })
  @ApiResponse({ status: 200, description: 'Event level updated successfully' })
  @ApiResponse({ status: 404, description: 'Event level not found' })
  @ApiResponse({ status: 409, description: 'Event level name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async update(@Param('uuid') uuid: string, @Body() dto: UpdateEventLevelDto) {
    const eventLevel = await this.eventLevelService.updateByUuid(uuid, dto);
    return new SuccessResponse('Event level updated successfully', eventLevel);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Soft delete event level (sets is_active to false)' })
  @ApiResponse({ status: 200, description: 'Event level deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event level not found' })
  async remove(@Param('uuid') uuid: string) {
    await this.eventLevelService.softDeleteByUuid(uuid);
    return new SuccessResponse('Event level deleted successfully', { deleted: true });
  }
}
