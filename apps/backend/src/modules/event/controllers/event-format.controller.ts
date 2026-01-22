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
import { EventFormatService } from '../services/event-format.service';
import { CreateEventFormatDto, UpdateEventFormatDto } from '../dtos';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';

@ApiTags('Event Formats')
@ApiBearerAuth()
@Controller({ path: 'event-formats', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class EventFormatController {
  constructor(private readonly eventFormatService: EventFormatService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event format' })
  @ApiResponse({ status: 201, description: 'Event format created successfully' })
  @ApiResponse({ status: 409, description: 'Event format name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateEventFormatDto) {
    const eventFormat = await this.eventFormatService.create(dto);
    return new SuccessResponse('Event format created successfully', eventFormat);
  }

  @Get()
  @ApiOperation({ summary: 'Get all event formats (ordered by created_at ASC, only active)' })
  @ApiResponse({ status: 200, description: 'Event formats list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.eventFormatService.findAll(pagination);
    return new SuccessResponse('Event formats retrieved successfully', result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event format by ID' })
  @ApiResponse({ status: 200, description: 'Event format found' })
  @ApiResponse({ status: 404, description: 'Event format not found' })
  async findOne(@Param('id') id: string) {
    const eventFormat = await this.eventFormatService.findOne(id);
    if (!eventFormat) {
      return new SuccessResponse('Event format not found', null);
    }
    return new SuccessResponse('Event format retrieved successfully', eventFormat);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event format' })
  @ApiResponse({ status: 200, description: 'Event format updated successfully' })
  @ApiResponse({ status: 404, description: 'Event format not found' })
  @ApiResponse({ status: 409, description: 'Event format name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async update(@Param('id') id: string, @Body() dto: UpdateEventFormatDto) {
    const eventFormat = await this.eventFormatService.update(id, dto);
    return new SuccessResponse('Event format updated successfully', eventFormat);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete event format (sets is_active to false)' })
  @ApiResponse({ status: 200, description: 'Event format deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event format not found' })
  async remove(@Param('id') id: string) {
    await this.eventFormatService.softDelete(id);
    return new SuccessResponse('Event format deleted successfully', { deleted: true });
  }
}
