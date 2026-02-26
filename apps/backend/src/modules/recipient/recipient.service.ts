import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { RecipientEntity } from '@src/entities/recipient.entity';
import { OrganizationService } from '@src/modules/organization/organization.service';
import { CreateRecipientDto, UpdateRecipientDto } from './dtos';

@Injectable()
export class RecipientService {
  constructor(
    @InjectModel(RecipientEntity)
    private readonly recipientModel: typeof RecipientEntity,
    private readonly organizationService: OrganizationService,
  ) {}

  async findAll(
    organizationIdentifier: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<RecipientEntity>> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC', where = {} } = options;

    const organization = await this.organizationService.resolveOrganization(organizationIdentifier);
    if (!organization) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      };
    }

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await this.recipientModel.findAndCountAll({
      where: {
        organization_id: organization.id,
        ...where,
      },
      order: [[sortBy, sortOrder]],
      limit: safeLimit,
      offset,
    });

    const totalPages = Math.ceil(count / safeLimit);

    return {
      data: rows,
      meta: {
        total: count,
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }

  async findByUuid(uuid: string, organizationUuid: string): Promise<RecipientEntity | null> {
    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) return null;

    return this.recipientModel.findOne({
      where: {
        uuid,
        organization_id: organization.id,
      },
    });
  }

  /**
   * Find or create a recipient by email within an organization.
   * If exists, update name if different. Returns the recipient.
   */
  async findOrCreate(
    organizationUuid: string,
    dto: CreateRecipientDto,
    options?: { transaction?: Transaction },
  ): Promise<RecipientEntity> {
    const organization = await this.requireOrganization(organizationUuid);
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedName = dto.name.trim();

    const existing = await this.recipientModel.findOne({
      where: {
        organization_id: organization.id,
        email: { [Op.iLike]: normalizedEmail },
      },
      transaction: options?.transaction,
    });

    if (existing) {
      // Update name if it changed
      if (existing.name !== normalizedName) {
        await existing.update({ name: normalizedName }, { transaction: options?.transaction });
      }
      return existing;
    }

    return this.recipientModel.create(
      {
        organization_id: organization.id,
        name: normalizedName,
        email: normalizedEmail,
      },
      { transaction: options?.transaction },
    );
  }

  async create(organizationUuid: string, dto: CreateRecipientDto): Promise<RecipientEntity> {
    const organization = await this.requireOrganization(organizationUuid);
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existing = await this.recipientModel.findOne({
      where: {
        organization_id: organization.id,
        email: { [Op.iLike]: normalizedEmail },
      },
    });

    if (existing) {
      return existing;
    }

    return this.recipientModel.create({
      organization_id: organization.id,
      name: dto.name.trim(),
      email: normalizedEmail,
    });
  }

  async updateByUuid(
    uuid: string,
    organizationUuid: string,
    dto: UpdateRecipientDto,
  ): Promise<RecipientEntity> {
    const recipient = await this.findByUuidOrFail(uuid, organizationUuid);
    const organization = await this.requireOrganization(organizationUuid);

    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }

    if (dto.email !== undefined) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      const existing = await this.recipientModel.findOne({
        where: {
          organization_id: organization.id,
          email: { [Op.iLike]: normalizedEmail },
          id: { [Op.ne]: recipient.id },
        },
      });
      if (existing) {
        throw new ConflictException(`Recipient with email "${normalizedEmail}" already exists`);
      }
      updateData.email = normalizedEmail;
    }

    await recipient.update(updateData);
    return recipient;
  }

  async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const recipient = await this.findByUuidOrFail(uuid, organizationUuid);
    await recipient.destroy();
    return true;
  }

  private async findByUuidOrFail(uuid: string, organizationUuid: string): Promise<RecipientEntity> {
    const recipient = await this.findByUuid(uuid, organizationUuid);
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }
    return recipient;
  }

  private async requireOrganization(uuid: string) {
    const organization = await this.organizationService.findByUuid(uuid);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }
}
