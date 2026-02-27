import { Transaction } from 'sequelize';
import { PathwayEntity, PathwayParticipantEntity } from '@src/entities';
import { PaginatedResult, PaginationDto } from '@src/commons/base';

export interface CredentialProgressResult {
  event_id: number;
  status: 'earned' | 'not_earned';
  earned_date: string | null;
}

/**
 * Pathway Participant Service Interface
 * SRP: Single responsibility for pathway participant management
 */
export interface IPathwayParticipantService {
  /**
   * Add a participant to a pathway
   */
  addParticipant(
    pathway: PathwayEntity,
    dto: { name: string; email: string },
    organizationUuid: string,
    transaction?: Transaction,
  ): Promise<PathwayParticipantEntity>;

  /**
   * Get participants for a pathway with pagination
   */
  getParticipants(
    pathwayId: number,
    pagination?: PaginationDto,
  ): Promise<PaginatedResult<PathwayParticipantEntity>>;

  /**
   * Update participant status
   */
  updateStatus(
    pathwayId: number,
    recipientUuid: string,
    status: string,
    organizationUuid: string,
  ): Promise<PathwayParticipantEntity>;

  /**
   * Get a single participant's progress in a pathway (public, no auth)
   */
  getParticipantPublic(
    pathwayId: number,
    recipientUuid: string,
  ): Promise<PathwayParticipantEntity | null>;

  /**
   * Get paginated participants for a pathway (public, no auth)
   */
  getParticipantsPublic(
    pathwayId: number,
    pagination?: PaginationDto,
  ): Promise<PaginatedResult<PathwayParticipantEntity>>;

  /**
   * Get credential-level progress for a participant in a pathway
   */
  getCredentialProgress(
    pathwayId: number,
    recipientId: number,
  ): Promise<CredentialProgressResult[]>;
}
