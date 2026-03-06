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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  UpdateGeneralInfoDto,
  UpdateSocialLinksDto,
  UpdateBrandingDto,
  UpdatePortalSettingsDto,
} from './dtos';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Disabled, Public, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';
import { Role } from '../role/enums';
import { EmailService } from '@src/commons/services';
import { ContactOrganizationDto } from './dtos/contact-organization.dto';
import { PublicPortalGuard } from './guards/public-portal.guard';
import type { PublicRequest } from '../../commons/interfaces/public-request.interface';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller({ path: 'organizations', version: '1' })
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all organizations (System Admin / Super Admin)' })
  @ApiResponse({ status: 200, description: 'Organizations list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@Query() pagination: PaginationDto) {
    const result = pagination.search
      ? await this.organizationService.searchOrganizations(pagination.search, pagination)
      : await this.organizationService.findAll(pagination);
    return new SuccessResponse('Organizations retrieved successfully', result);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current user organization' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  async getCurrentOrganization(@CurrentUser() user: CurrentUserType) {
    const organization = await this.organizationService.findByUuid(user.organizationUuid);
    return new SuccessResponse('Organization retrieved successfully', organization);
  }

  @Get('settings')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Get all organization settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Organization settings retrieved' })
  async getSettings(@CurrentUser() user: CurrentUserType) {
    const organization = await this.organizationService.findByUuid(user.organizationUuid);
    return new SuccessResponse('Organization settings retrieved successfully', organization);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findBySlug(@Param('slug') slug: string) {
    const organization = await this.organizationService.findBySlug(slug);
    if (!organization) {
      return new SuccessResponse('Organization not found', null);
    }
    return new SuccessResponse('Organization retrieved successfully', organization);
  }

  @Get(':uuid')
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get organization by UUID (System Admin / Super Admin)' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findOne(@Param('uuid') uuid: string) {
    const organization = await this.organizationService.findByUuid(uuid);
    if (!organization) {
      return new SuccessResponse('Organization not found', null);
    }
    return new SuccessResponse('Organization retrieved successfully', organization);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Disabled()
  @ApiOperation({ summary: 'Create a new organization (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  async create(@Body() dto: CreateOrganizationDto) {
    const organization = await this.organizationService.create(dto);
    return new SuccessResponse('Organization created successfully', organization);
  }

  @Delete(':uuid')
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Permanently delete organization (System Admin only)' })
  @ApiResponse({ status: 200, description: 'Organization deleted successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async permanentlyDelete(
    @Param('uuid') uuid: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    await this.organizationService.permanentlyDelete(uuid, currentUser);
    return new SuccessResponse('Organization permanently deleted', { deleted: true });
  }

  @Patch('current')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update current user organization (Admin only)' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  async updateCurrentOrganization(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdateOrganizationDto,
  ) {
    const organization = await this.organizationService.updateByUuid(user.organizationUuid, dto);
    return new SuccessResponse('Organization updated successfully', organization);
  }

  @Patch(':uuid')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update organization (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async update(@Param('uuid') uuid: string, @Body() dto: UpdateOrganizationDto) {
    const organization = await this.organizationService.updateByUuid(uuid, dto);
    return new SuccessResponse('Organization updated successfully', organization);
  }

  // ============================================
  // Account Settings Endpoints
  // ============================================

  @Patch('settings/general')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Update organization general information (Admin only)' })
  @ApiResponse({ status: 200, description: 'General information updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 409, description: 'Organization name already exists' })
  async updateGeneralInfo(@CurrentUser() user: CurrentUserType, @Body() dto: UpdateGeneralInfoDto) {
    const organization = await this.organizationService.updateGeneralInfo(
      user.organizationUuid,
      dto,
    );
    return new SuccessResponse('General information updated successfully', organization);
  }

  @Patch('settings/social-links')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update organization social links (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Social links updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async updateSocialLinks(@CurrentUser() user: CurrentUserType, @Body() dto: UpdateSocialLinksDto) {
    const organization = await this.organizationService.updateSocialLinks(
      user.organizationUuid,
      dto,
    );
    return new SuccessResponse('Social links updated successfully', organization);
  }

  @Patch('settings/branding')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update organization branding (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Branding updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async updateBranding(@CurrentUser() user: CurrentUserType, @Body() dto: UpdateBrandingDto) {
    const organization = await this.organizationService.updateBranding(user.organizationUuid, dto);
    return new SuccessResponse('Branding updated successfully', organization);
  }

  @Patch('settings/portal')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update issuer portal settings (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Portal settings updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async updatePortalSettings(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdatePortalSettingsDto,
  ) {
    const organization = await this.organizationService.updatePortalSettings(
      user.organizationUuid,
      dto,
    );
    return new SuccessResponse('Portal settings updated successfully', organization);
  }

  // --------------- PUBLIC ROUTES -----------------------------------------------

  /**
   *
   * @param slug -> organization slug
   * @returns
   */
  @Get('public/:slug')
  @Public()
  @UseGuards(PublicPortalGuard)
  @ApiOperation({ summary: 'Get public organization data by UUID' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findOnePublic(@Param('slug') slug: string, @Req() req: PublicRequest) {
    const organization = req.organization;
    return new SuccessResponse('Organization retrieved successfully', organization);
  }

  @Post('public/:slug/contact')
  @Public()
  @UseGuards(PublicPortalGuard)
  @ApiOperation({ summary: 'Email Organization - Contact Us' })
  @ApiResponse({ status: 200, description: 'Email Sent to the issuer' })
  @ApiResponse({ status: 500, description: 'Email could not be sent' })
  async sendEmail(
    @Param('slug') slug: string,
    @Body() dto: ContactOrganizationDto,
    @Req() req: PublicRequest,
  ) {
    const organization = req.organization ?? (await this.organizationService.findBySlug(slug));
    if (!organization?.support_email) throw new NotFoundException('Contact not found');
    const emailSubject = `New Contact Form Submission - ${dto.name} ${dto.email}`;
    const mailOptions = {
      text: dto.message,
    };
    const email = await this.emailService.sendEmail(
      organization?.support_email,
      emailSubject,
      mailOptions,
    );
    return new SuccessResponse('Email sent successfully', email);
  }
}
