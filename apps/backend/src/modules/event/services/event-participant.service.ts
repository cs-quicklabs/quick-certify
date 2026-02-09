import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EventParticipantEntity } from '@src/entities/event-participant.entity';
import { generateNanoid } from '@src/commons/utils/nanoid.util';
import { CreateEventParticipantDto, UpdateEventParticipantDto } from '../dtos/event-participant.dto';

/**
 * Event Participant Service
 *
 * Handles participant management for events.
 * Separates participant management from event CRUD operations.
 *
 * Single Responsibility: Manage event-participant relationships only
 */
@Injectable()
export class EventParticipantService {
  constructor(
    @InjectModel(EventParticipantEntity)
    private readonly participantModel: typeof EventParticipantEntity,
  ) {}

  /**
   * Get all participants for an event
   */
  async getEventParticipants(eventId: number): Promise<EventParticipantEntity[]> {
    return this.participantModel.findAll({
      where: { event_id: eventId },
      order: [['created_at', 'ASC']],
    });
  }

  /**
   * Get a single participant by UUID
   */
  async getParticipantByUuid(uuid: string, eventId: number): Promise<EventParticipantEntity | null> {
    return this.participantModel.findOne({
      where: { uuid, event_id: eventId },
    });
  }

  /**
   * Add a single participant to an event
   */
  async addParticipant(
    eventId: number,
    dto: CreateEventParticipantDto,
  ): Promise<EventParticipantEntity> {
    // Check for duplicate email within the same event
    const existingParticipant = await this.participantModel.findOne({
      where: {
        event_id: eventId,
        email: dto.email.toLowerCase(),
      },
    });

    if (existingParticipant) {
      throw new BadRequestException(
        `A participant with email "${dto.email}" already exists for this event`,
      );
    }

    const participant = await this.participantModel.create({
      uuid: generateNanoid(),
      event_id: eventId,
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
    });

    return participant;
  }

  /**
   * Bulk add participants to an event
   */
  async bulkAddParticipants(
    eventId: number,
    participants: CreateEventParticipantDto[],
  ): Promise<EventParticipantEntity[]> {
    if (!participants || participants.length === 0) {
      return [];
    }

    // Check for duplicates within the input
    const emails = participants.map((p) => p.email.toLowerCase().trim());
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      throw new BadRequestException('Duplicate emails found in participant list');
    }

    // Check for existing participants with same emails
    const existingParticipants = await this.participantModel.findAll({
      where: {
        event_id: eventId,
        email: emails,
      },
    });

    if (existingParticipants.length > 0) {
      const existingEmails = existingParticipants.map((p) => p.email);
      throw new BadRequestException(
        `Participants with these emails already exist: ${existingEmails.join(', ')}`,
      );
    }

    // Create all participants
    const createdParticipants = await Promise.all(
      participants.map((dto) =>
        this.participantModel.create({
          uuid: generateNanoid(),
          event_id: eventId,
          name: dto.name.trim(),
          email: dto.email.toLowerCase().trim(),
        }),
      ),
    );

    return createdParticipants;
  }

  /**
   * Update a participant
   */
  async updateParticipant(
    uuid: string,
    eventId: number,
    dto: UpdateEventParticipantDto,
  ): Promise<EventParticipantEntity> {
    const participant = await this.getParticipantByUuid(uuid, eventId);

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Check for email conflict if email is being updated
    if (dto.email && dto.email.toLowerCase().trim() !== participant.email) {
      const existingParticipant = await this.participantModel.findOne({
        where: {
          event_id: eventId,
          email: dto.email.toLowerCase().trim(),
        },
      });

      if (existingParticipant) {
        throw new BadRequestException(
          `A participant with email "${dto.email}" already exists for this event`,
        );
      }
    }

    await participant.update({
      name: dto.name?.trim() ?? participant.name,
      email: dto.email?.toLowerCase().trim() ?? participant.email,
    });

    return participant;
  }

  /**
   * Remove a participant from an event
   */
  async removeParticipant(uuid: string, eventId: number): Promise<void> {
    const participant = await this.getParticipantByUuid(uuid, eventId);

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    await participant.destroy();
  }

  /**
   * Remove all participants from an event
   */
  async clearParticipants(eventId: number): Promise<void> {
    await this.participantModel.destroy({
      where: { event_id: eventId },
    });
  }

  /**
   * Sync participants for an event (removes existing and adds new)
   */
  async syncParticipants(
    eventId: number,
    participants: CreateEventParticipantDto[],
  ): Promise<EventParticipantEntity[]> {
    // Clear existing participants
    await this.clearParticipants(eventId);

    // If empty array, we're done
    if (!participants || participants.length === 0) {
      return [];
    }

    // Add new participants
    return this.bulkAddParticipants(eventId, participants);
  }

  /**
   * Get participant count for an event
   */
  async getParticipantCount(eventId: number): Promise<number> {
    return this.participantModel.count({
      where: { event_id: eventId },
    });
  }
}
