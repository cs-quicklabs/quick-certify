import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { PaginatedResult } from '@src/commons/base';
import { CredentialEntity } from '@src/entities/credential.entity';
import { RecipientEntity } from '@src/entities/recipient.entity';
import { EventEntity } from '@src/entities/event.entity';
import { OrganizationService } from '@src/modules/organization/organization.service';
import { EventService } from '@src/modules/event/services/event.service';
import { RecipientService } from '@src/modules/recipient/recipient.service';
import {
  CreateCredentialDto,
  UpdateCredentialDto,
  CredentialFilterDto,
  BatchCreateCredentialDto,
} from './dtos';

@Injectable()
export class CredentialService {
  constructor(
    @InjectModel(CredentialEntity)
    private readonly credentialModel: typeof CredentialEntity,
    private readonly organizationService: OrganizationService,
    private readonly eventService: EventService,
    private readonly recipientService: RecipientService,
  ) {}

  async findAll(
    organizationIdentifier: string, // Can be either UUID or slug
    filters: CredentialFilterDto,
  ): Promise<PaginatedResult<CredentialEntity>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      search,
      eventId,
    } = filters;
    //  find organization by UUID or slug
    const organization = await this.organizationService.findByUuidOrSlug(organizationIdentifier);

    if (!organization) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      };
    }

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const whereClause: Record<string, unknown> = {
      organization_id: organization.id,
    };

    // Filter by event
    if (eventId) {
      const event = await this.eventService.findByUuid(eventId, organization.uuid);
      if (event) {
        whereClause.event_id = event.id;
      }
    }

    // Search by recipient name or email via join
    const recipientWhere: Record<string, unknown> | undefined = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : undefined;

    const { count, rows } = await this.credentialModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: RecipientEntity,
          as: 'recipient',
          attributes: ['uuid', 'name', 'email'],
          where: recipientWhere,
        },
        {
          model: EventEntity,
          as: 'event',
          attributes: ['uuid', 'name'],
        },
      ],
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

  async findByUuid(uuid: string, organizationUuid: string): Promise<CredentialEntity | null> {
    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) return null;

    return this.credentialModel.findOne({
      where: {
        uuid,
        organization_id: organization.id,
      },
      include: [
        {
          model: RecipientEntity,
          as: 'recipient',
          attributes: ['uuid', 'name', 'email'],
        },
        {
          model: EventEntity,
          as: 'event',
          attributes: ['uuid', 'name'],
        },
      ],
    });
  }

  async create(organizationUuid: string, dto: CreateCredentialDto): Promise<CredentialEntity> {
    const organization = await this.requireOrganization(organizationUuid);

    // Find or create recipient (avoids duplicate recipient rows)
    const recipient = await this.recipientService.findOrCreate(organizationUuid, {
      name: dto.recipientName,
      email: dto.recipientEmail,
    });

    const event = await this.eventService.findByUuid(dto.eventId, organizationUuid);
    if (!event) {
      throw new BadRequestException(`Event with UUID ${dto.eventId} not found or inactive`);
    }

    const credential = await this.credentialModel.create({
      organization_id: organization.id,
      recipient_id: recipient.id,
      event_id: event.id,
      issued_date: dto.issuedDate || null,
      expiration_date: dto.expirationDate || null,
      certificate_url: dto.certificateUrl || null,
      status: dto.status || 'draft',
    });

    return credential.reload({
      include: [
        { model: RecipientEntity, as: 'recipient', attributes: ['uuid', 'name', 'email'] },
        { model: EventEntity, as: 'event', attributes: ['uuid', 'name'] },
      ],
    });
  }

  async updateByUuid(
    uuid: string,
    organizationUuid: string,
    dto: UpdateCredentialDto,
  ): Promise<CredentialEntity> {
    const credential = await this.findByUuidOrFail(uuid, organizationUuid);

    const updateData: Record<string, unknown> = {};

    // If name or email changed, find-or-create the recipient
    if (dto.recipientName !== undefined || dto.recipientEmail !== undefined) {
      const currentRecipient = credential.recipient;
      const recipient = await this.recipientService.findOrCreate(organizationUuid, {
        name: dto.recipientName ?? currentRecipient.name,
        email: dto.recipientEmail ?? currentRecipient.email,
      });
      updateData.recipient_id = recipient.id;
    }

    if (dto.eventId !== undefined) {
      const event = await this.eventService.findByUuid(dto.eventId, organizationUuid);
      if (!event) {
        throw new BadRequestException(`Event with UUID ${dto.eventId} not found or inactive`);
      }
      updateData.event_id = event.id;
    }

    if (dto.issuedDate !== undefined) updateData.issued_date = dto.issuedDate;
    if (dto.expirationDate !== undefined) updateData.expiration_date = dto.expirationDate;
    if (dto.certificateUrl !== undefined) updateData.certificate_url = dto.certificateUrl;
    if (dto.status !== undefined) updateData.status = dto.status;

    await credential.update(updateData);

    return credential.reload({
      include: [
        { model: RecipientEntity, as: 'recipient', attributes: ['uuid', 'name', 'email'] },
        { model: EventEntity, as: 'event', attributes: ['uuid', 'name'] },
      ],
    });
  }

  async createBatch(
    organizationUuid: string,
    dto: BatchCreateCredentialDto,
  ): Promise<CredentialEntity[]> {
    const organization = await this.requireOrganization(organizationUuid);

    const event = await this.eventService.findByUuid(dto.eventId, organizationUuid);
    if (!event) {
      throw new BadRequestException(`Event with UUID ${dto.eventId} not found or inactive`);
    }

    const credentials: CredentialEntity[] = [];

    for (const recipient of dto.recipients) {
      const recipientEntity = await this.recipientService.findOrCreate(organizationUuid, {
        name: recipient.name,
        email: recipient.email,
      });

      const credential = await this.credentialModel.create({
        organization_id: organization.id,
        recipient_id: recipientEntity.id,
        event_id: event.id,
        issued_date: dto.issuedDate || new Date().toISOString().split('T')[0],
        expiration_date: dto.expirationDate || null,
        status: dto.status || 'issued',
      });

      const loaded = await credential.reload({
        include: [
          { model: RecipientEntity, as: 'recipient', attributes: ['uuid', 'name', 'email'] },
          { model: EventEntity, as: 'event', attributes: ['uuid', 'name'] },
        ],
      });

      credentials.push(loaded);
    }

    return credentials;
  }

  async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const credential = await this.findByUuidOrFail(uuid, organizationUuid);
    await credential.destroy();
    return true;
  }

  private async findByUuidOrFail(
    uuid: string,
    organizationUuid: string,
  ): Promise<CredentialEntity> {
    const credential = await this.findByUuid(uuid, organizationUuid);
    if (!credential) {
      throw new NotFoundException('Credential not found');
    }
    return credential;
  }

  private async requireOrganization(uuid: string) {
    const organization = await this.organizationService.findByUuid(uuid);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }
}
