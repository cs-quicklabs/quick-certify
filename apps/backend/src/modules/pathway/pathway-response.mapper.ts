import { Injectable } from '@nestjs/common';
import { PathwayEntity, EventEntity } from '@src/entities';

export interface CredentialProgressPayload {
  uuid: string;
  name: string;
  summary: string;
  duration: string;
  image_url: string;
  status: 'earned' | 'not_earned';
  earned_date: string | null;
}

export interface ParticipantProgressPayload {
  uuid: string | undefined;
  name: string | undefined;
  email: string | undefined;
  status: string;
  joined_date: Date;
  pathway_name: string;
  credentials: CredentialProgressPayload[];
}

export interface PublicPathwayDetailPayload {
  uuid: string;
  name: string;
  description: string | null;
  banner_url: string | null;
  status: string;
  duration: string | null;
  is_active: boolean;
  participant_count: number;
  credential_count: number;
  events: unknown[];
  participants: unknown[];
}

/**
 * Pathway Response Mapper
 * SRP: Single responsibility for formatting pathway API responses
 */
@Injectable()
export class PathwayResponseMapper {
  /**
   * Build the public detail response for a single pathway.
   * Computes participant_count and credential_count (non-final events).
   */
  buildPublicDetail(pathway: PathwayEntity): PublicPathwayDetailPayload {
    const events = pathway.events ?? [];
    const nonFinalCount = events.filter(
      (e: EventEntity & { pathway_event?: { is_final: boolean } }) => !e.pathway_event?.is_final,
    ).length;

    return {
      ...pathway.toJSON(),
      participant_count: pathway.participants?.length ?? 0,
      credential_count: nonFinalCount,
    } as PublicPathwayDetailPayload;
  }

  /**
   * Build the public participant progress response.
   * Maps pathway events with credential progress into the frontend shape.
   */
  buildParticipantProgressResponse(
    pathway: PathwayEntity,
    participant: {
      recipient?: { uuid: string; name: string; email: string };
      status: string;
      recipient_id: number;
      createdAt: Date;
    },
    credentialProgress: Array<{
      event_id: number;
      status: 'earned' | 'not_earned';
      earned_date: string | null;
    }>,
  ): ParticipantProgressPayload {
    const events = pathway.events ?? [];
    const progressMap = new Map(credentialProgress.map((cp) => [cp.event_id, cp]));

    const credentials = events
      .filter(
        (e: EventEntity & { pathway_event?: { is_final: boolean; order: number } }) =>
          !e.pathway_event?.is_final,
      )
      .sort(
        (
          a: EventEntity & { pathway_event?: { order: number } },
          b: EventEntity & { pathway_event?: { order: number } },
        ) => (a.pathway_event?.order ?? 0) - (b.pathway_event?.order ?? 0),
      )
      .map((event) => {
        const progress = progressMap.get(event.id);
        return {
          uuid: event.uuid,
          name: event.name,
          summary: event.description ?? '',
          duration:
            event.duration_value && event.duration_type
              ? `${event.duration_value} ${event.duration_type}${event.duration_value > 1 ? 's' : ''}`
              : '',
          image_url: event.design?.url ?? '',
          status: progress?.status ?? 'not_earned',
          earned_date: progress?.earned_date ?? null,
        };
      });

    return {
      uuid: participant.recipient?.uuid,
      name: participant.recipient?.name,
      email: participant.recipient?.email,
      status: participant.status,
      joined_date: participant.createdAt,
      pathway_name: pathway.name,
      credentials,
    };
  }
}
