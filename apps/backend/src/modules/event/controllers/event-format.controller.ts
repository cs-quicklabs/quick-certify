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
import { CurrentUser, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';

@ApiTags('Event Formats')
@ApiBearerAuth()
@Controller({ path: 'event-formats', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class EventFormatController {
  constructor(private readonly eventFormatService: EventFormatService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event format (Admin/Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Event format created successfully' })
  @ApiResponse({ status: 409, description: 'Event format name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateEventFormatDto) {
    const eventFormat = await this.eventFormatService.create(user.organizationUuid, dto);
    return new SuccessResponse('Event format created successfully', eventFormat);
  }

  @Get()
  @ApiOperation({
    summary:
      'Get all event formats for current organization (ordered by created_at ASC, only active)',
  })
  @ApiResponse({ status: 200, description: 'Event formats list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@CurrentUser() user: CurrentUserType, @Query() pagination: PaginationDto) {
    const result = await this.eventFormatService.findAll(user.organizationUuid, pagination);
    return new SuccessResponse('Event formats retrieved successfully', result);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get event format by UUID (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Event format found' })
  @ApiResponse({ status: 404, description: 'Event format not found' })
  async findOne(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const eventFormat = await this.eventFormatService.findByUuid(uuid, user.organizationUuid);
    if (!eventFormat) {
      return new SuccessResponse('Event format not found', null);
    }
    return new SuccessResponse('Event format retrieved successfully', eventFormat);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update event format (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Event format updated successfully' })
  @ApiResponse({ status: 404, description: 'Event format not found' })
  @ApiResponse({ status: 409, description: 'Event format name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateEventFormatDto,
  ) {
    const eventFormat = await this.eventFormatService.updateByUuid(
      uuid,
      user.organizationUuid,
      dto,
    );
    return new SuccessResponse('Event format updated successfully', eventFormat);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Soft delete event format (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Event format deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event format not found' })
  async remove(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    await this.eventFormatService.deleteByUuid(uuid, user.organizationUuid);
    return new SuccessResponse('Event format deleted successfully', { deleted: true });
  }
}
