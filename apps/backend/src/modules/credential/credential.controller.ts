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
import { CredentialService } from './credential.service';
import {
  CreateCredentialDto,
  UpdateCredentialDto,
  CredentialFilterDto,
  BatchCreateCredentialDto,
  PreviewCredentialDto,
} from './dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Public, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';
import { SlugOnlyPipe } from '@src/commons/pipes/slug-only.pipe';

@ApiTags('Credentials')
@ApiBearerAuth()
@Controller({ path: 'credentials', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post()
  @ApiOperation({ summary: 'Issue a new credential' })
  @ApiResponse({ status: 201, description: 'Credential created successfully' })
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateCredentialDto) {
    const credential = await this.credentialService.create(user.organizationUuid, dto);
    return new SuccessResponse('Credential created successfully', credential);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Queue credentials for batch issuance' })
  @ApiResponse({ status: 201, description: 'Batch queued successfully' })
  async createBatch(@CurrentUser() user: CurrentUserType, @Body() dto: BatchCreateCredentialDto) {
    const result = await this.credentialService.createBatch(user.organizationUuid, user.id, dto);
    return new SuccessResponse('Batch queued for processing', result);
  }

  @Get('batch/:uuid/status')
  @ApiOperation({ summary: 'Get batch processing status' })
  @ApiResponse({ status: 200, description: 'Batch status retrieved' })
  async getBatchStatus(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const status = await this.credentialService.getBatchStatus(uuid, user.organizationUuid);
    return new SuccessResponse('Batch status retrieved', status);
  }

  @Post('preview')
  @ApiOperation({ summary: 'Generate a certificate preview' })
  @ApiResponse({ status: 201, description: 'Preview generated' })
  async preview(@CurrentUser() user: CurrentUserType, @Body() dto: PreviewCredentialDto) {
    const result = await this.credentialService.generatePreview(user.organizationUuid, dto);
    return new SuccessResponse('Preview generated', result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all credentials for current organization' })
  @ApiResponse({ status: 200, description: 'Credentials list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'eventId', required: false })
  async findAll(@CurrentUser() user: CurrentUserType, @Query() filters: CredentialFilterDto) {
    const result = await this.credentialService.findAll(user.organizationUuid, filters);
    return new SuccessResponse('Credentials retrieved successfully', result);
  }

  @Public()
  @Get('public/:uuid')
  @ApiOperation({ summary: 'Get public credential by UUID (no auth required)' })
  @ApiResponse({ status: 200, description: 'Public credential found' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  async findPublic(@Param('uuid') uuid: string) {
    const credential = await this.credentialService.findPublicByUuid(uuid);
    return new SuccessResponse('Credential retrieved successfully', credential);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get credential by UUID' })
  @ApiResponse({ status: 200, description: 'Credential found' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  async findOne(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const credential = await this.credentialService.findByUuidOrFail(uuid, user.organizationUuid);
    return new SuccessResponse('Credential retrieved successfully', credential);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update credential' })
  @ApiResponse({ status: 200, description: 'Credential updated successfully' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateCredentialDto,
  ) {
    const credential = await this.credentialService.updateByUuid(uuid, user.organizationUuid, dto);
    return new SuccessResponse('Credential updated successfully', credential);
  }

  @Post(':uuid/resend')
  @ApiOperation({ summary: 'Resend credential email to recipient' })
  @ApiResponse({ status: 200, description: 'Credential email resent' })
  @ApiResponse({ status: 400, description: 'Credential not eligible for resend' })
  async resend(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const result = await this.credentialService.resend(uuid, user.organizationUuid);
    return new SuccessResponse('Credential email resent successfully', result);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Soft delete credential' })
  @ApiResponse({ status: 200, description: 'Credential deleted successfully' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  async remove(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    await this.credentialService.deleteByUuid(uuid, user.organizationUuid);
    return new SuccessResponse('Credential deleted successfully', { deleted: true });
  }

  /**
   *  Fetches all credentials issued by an issuer based on its slug.
   * @param slug - organization slug
   * @param filters
   * @returns
   */
  @Public()
  @Get('public/org/:slug')
  @ApiOperation({ summary: 'Get all credentials for current organization' })
  @ApiResponse({ status: 200, description: 'Credentials list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'eventId', required: false })
  async findAllPublic(
    @Param('slug', SlugOnlyPipe) slug: string,
    @Query() filters: CredentialFilterDto,
  ) {
    const result = await this.credentialService.findAll(slug, filters);
    return new SuccessResponse('Credentials retrieved successfully', result);
  }
}
