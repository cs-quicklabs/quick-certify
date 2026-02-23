import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PathwayService } from '../services/pathway.service';
import { PathwayParticipantService } from '../services/pathway-participant.service';
import {
  CreatePathwayDto,
  UpdatePathwayDto,
  AddParticipantDto,
  UpdateParticipantStatusDto,
} from '../dtos';
import { Role } from '../../role/enums';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';

@ApiTags('Pathways')
@ApiBearerAuth()
@Controller({ path: 'pathways', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class PathwayController {
  constructor(
    private readonly pathwayService: PathwayService,
    private readonly pathwayParticipantService: PathwayParticipantService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all pathways for current organization' })
  @ApiResponse({ status: 200, description: 'Pathways list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'draft', 'archived'] })
  async findAll(
    @CurrentUser() user: CurrentUserType,
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
  ) {
    const result = await this.pathwayService.findAll(user.organizationUuid, {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      search: pagination.search,
      status,
    });
    return new SuccessResponse('Pathways retrieved successfully', result);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get pathway by UUID' })
  @ApiResponse({ status: 200, description: 'Pathway found' })
  @ApiResponse({ status: 404, description: 'Pathway not found' })
  async findOne(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const pathway = await this.pathwayService.findByUuid(uuid, user.organizationUuid);
    if (!pathway) {
      throw new NotFoundException('Pathway not found');
    }
    return new SuccessResponse('Pathway retrieved successfully', pathway);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new pathway' })
  @ApiResponse({ status: 201, description: 'Pathway created successfully' })
  @ApiResponse({ status: 409, description: 'Pathway name already exists' })
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreatePathwayDto) {
    const pathway = await this.pathwayService.create(user.organizationUuid, dto);
    return new SuccessResponse('Pathway created successfully', pathway);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update a pathway' })
  @ApiResponse({ status: 200, description: 'Pathway updated successfully' })
  @ApiResponse({ status: 404, description: 'Pathway not found' })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Body() dto: UpdatePathwayDto,
  ) {
    const pathway = await this.pathwayService.updateByUuid(uuid, user.organizationUuid, dto);
    return new SuccessResponse('Pathway updated successfully', pathway);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete a pathway (soft delete)' })
  @ApiResponse({ status: 200, description: 'Pathway deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pathway not found' })
  async remove(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    await this.pathwayService.deleteByUuid(uuid, user.organizationUuid);
    return new SuccessResponse('Pathway deleted successfully', { deleted: true });
  }

  // Participant endpoints

  @Get(':uuid/participants')
  @ApiOperation({ summary: 'Get participants for a pathway' })
  @ApiResponse({ status: 200, description: 'Participants list' })
  @ApiResponse({ status: 404, description: 'Pathway not found' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async getParticipants(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Query() pagination: PaginationDto,
  ) {
    const pathway = await this.pathwayService.findByUuid(uuid, user.organizationUuid);
    if (!pathway) {
      throw new NotFoundException('Pathway not found');
    }

    const result = await this.pathwayParticipantService.getParticipants(pathway.id, {
      page: pagination.page,
      limit: pagination.limit,
      search: pagination.search,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
    });
    return new SuccessResponse('Participants retrieved successfully', result);
  }

  @Post(':uuid/participants')
  @ApiOperation({ summary: 'Add a participant to a pathway' })
  @ApiResponse({ status: 201, description: 'Participant added successfully' })
  @ApiResponse({ status: 404, description: 'Pathway not found' })
  @ApiResponse({ status: 409, description: 'Participant already added' })
  async addParticipant(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Body() dto: AddParticipantDto,
  ) {
    const pathway = await this.pathwayService.findByUuid(uuid, user.organizationUuid);
    if (!pathway) {
      throw new NotFoundException('Pathway not found');
    }

    const participant = await this.pathwayParticipantService.addParticipant(
      pathway,
      dto.name,
      dto.email,
      user.organizationUuid,
    );
    return new SuccessResponse('Participant added successfully', participant);
  }

  @Patch(':uuid/participants/:recipientUuid')
  @ApiOperation({ summary: 'Update participant status' })
  @ApiResponse({ status: 200, description: 'Participant status updated' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  async updateParticipantStatus(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Param('recipientUuid') recipientUuid: string,
    @Body() dto: UpdateParticipantStatusDto,
  ) {
    const pathway = await this.pathwayService.findByUuid(uuid, user.organizationUuid);
    if (!pathway) {
      throw new NotFoundException('Pathway not found');
    }

    const participant = await this.pathwayParticipantService.updateStatus(
      pathway.id,
      recipientUuid,
      dto.status,
      user.organizationUuid,
    );
    return new SuccessResponse('Participant status updated successfully', participant);
  }
}
