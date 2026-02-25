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
import { RecipientService } from './recipient.service';
import { CreateRecipientDto, UpdateRecipientDto } from './dtos';
import { PaginationDto } from '@src/commons/base/dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Public, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';
import { SlugOnlyPipe } from '@src/commons/pipes/slug-only.pipe';

@ApiTags('Recipients')
@ApiBearerAuth()
@Controller({ path: 'recipients', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class RecipientController {
  constructor(private readonly recipientService: RecipientService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recipient' })
  @ApiResponse({ status: 201, description: 'Recipient created successfully' })
  @ApiResponse({ status: 409, description: 'Recipient email already exists' })
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateRecipientDto) {
    const recipient = await this.recipientService.create(user.organizationUuid, dto);
    return new SuccessResponse('Recipient created successfully', recipient);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recipients for current organization' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@CurrentUser() user: CurrentUserType, @Query() pagination: PaginationDto) {
    const options = pagination.search
      ? {
          ...pagination,
          where: {
            [Symbol.for('sequelize.or') as unknown as string]: [
              {
                name: {
                  [Symbol.for('sequelize.iLike') as unknown as string]: `%${pagination.search}%`,
                },
              },
              {
                email: {
                  [Symbol.for('sequelize.iLike') as unknown as string]: `%${pagination.search}%`,
                },
              },
            ],
          },
        }
      : pagination;
    const result = await this.recipientService.findAll(user.organizationUuid, options);
    return new SuccessResponse('Recipients retrieved successfully', result);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get recipient by UUID' })
  @ApiResponse({ status: 200, description: 'Recipient found' })
  @ApiResponse({ status: 404, description: 'Recipient not found' })
  async findOne(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const recipient = await this.recipientService.findByUuid(uuid, user.organizationUuid);
    if (!recipient) {
      return new SuccessResponse('Recipient not found', null);
    }
    return new SuccessResponse('Recipient retrieved successfully', recipient);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update recipient' })
  @ApiResponse({ status: 200, description: 'Recipient updated successfully' })
  @ApiResponse({ status: 404, description: 'Recipient not found' })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateRecipientDto,
  ) {
    const recipient = await this.recipientService.updateByUuid(uuid, user.organizationUuid, dto);
    return new SuccessResponse('Recipient updated successfully', recipient);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Soft delete recipient' })
  @ApiResponse({ status: 200, description: 'Recipient deleted successfully' })
  async remove(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    await this.recipientService.deleteByUuid(uuid, user.organizationUuid);
    return new SuccessResponse('Recipient deleted successfully', { deleted: true });
  }

  /**
   *
   * @param slug - organization slug
   * @param pagination
   * @returns
   */
  @Public()
  @Get('/public/org/:slug')
  @ApiOperation({ summary: 'Get all recipients for current organization' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAllRecipientPublic(
    @Param('slug', SlugOnlyPipe)
    slug: string,
    @Query()
    pagination: PaginationDto,
  ) {
    const options = pagination.search
      ? {
          ...pagination,
          where: {
            [Symbol.for('sequelize.or') as unknown as string]: [
              {
                name: {
                  [Symbol.for('sequelize.iLike') as unknown as string]: `%${pagination.search}%`,
                },
              },
              {
                email: {
                  [Symbol.for('sequelize.iLike') as unknown as string]: `%${pagination.search}%`,
                },
              },
            ],
          },
        }
      : pagination;
    const result = await this.recipientService.findAll(slug, options);
    return new SuccessResponse('Recipients retrieved successfully', result);
  }
}
