import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EventSkillEntity } from '@src/entities/event-skill.entity';
import { SkillEntity } from '@src/entities/skill.entity';
import { EventEntity } from '@src/entities/event.entity';
import { OrganizationService } from '@src/modules/organization/organization.service';

/**
 * Event Skill Service
 *
 * Handles skill associations for events.
 * Separates skill management from event CRUD operations.
 * 
 * Single Responsibility: Manage event-skill relationships only
 */
@Injectable()
export class EventSkillService {
  constructor(
    @InjectModel(EventSkillEntity)
    private readonly eventSkillModel: typeof EventSkillEntity,
    @InjectModel(SkillEntity)
    private readonly skillModel: typeof SkillEntity,
    private readonly organizationService: OrganizationService,
  ) {}

  /**
   * Get skills for an event
   */
  async getEventSkills(eventId: number): Promise<SkillEntity[]> {
    const eventSkills = await this.eventSkillModel.findAll({
      where: { event_id: eventId },
      include: [{
        model: SkillEntity,
        as: 'skill',
      }],
    });

    return eventSkills.map(es => (es as any).skill);
  }

  /**
   * Sync skills for an event (removes existing and adds new)
   */
  async syncSkills(
    event: EventEntity,
    skillUuids: string[],
    organizationUuid: string,
  ): Promise<void> {
    // Clear existing skills
    await this.clearSkills(event.id);

    // If empty array, we're done
    if (skillUuids.length === 0) {
      return;
    }

    // Add new skills
    await this.addSkills(event, skillUuids, organizationUuid);
  }

  /**
   * Add skills to an event
   */
  async addSkills(
    event: EventEntity,
    skillUuids: string[],
    organizationUuid: string,
  ): Promise<void> {
    if (!skillUuids || skillUuids.length === 0) return;

    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Validate skills exist and belong to organization
    const skills = await this.skillModel.findAll({
      where: {
        uuid: skillUuids,
        organization_id: organization.id,
      },
    });

    if (skills.length !== skillUuids.length) {
      const foundUuids = skills.map((s) => s.uuid);
      const missingUuids = skillUuids.filter((uuid) => !foundUuids.includes(uuid));
      throw new BadRequestException(
        `Skills not found or inactive: ${missingUuids.join(', ')}`,
      );
    }

    // Create associations
    const associations = skills.map((skill) => ({
      event_id: event.id,
      skill_id: skill.id,
    }));

    await this.eventSkillModel.bulkCreate(associations, {
      fields: ['event_id', 'skill_id'],
    });
  }

  /**
   * Clear all skills from an event
   */
  async clearSkills(eventId: number): Promise<void> {
    await this.eventSkillModel.destroy({
      where: { event_id: eventId },
    });
  }

  /**
   * Validate that skills exist for an organization
   */
  async validateSkills(
    skillUuids: string[],
    organizationUuid: string,
  ): Promise<SkillEntity[]> {
    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const skills = await this.skillModel.findAll({
      where: {
        uuid: skillUuids,
        organization_id: organization.id,
      },
    });

    if (skills.length !== skillUuids.length) {
      const foundUuids = skills.map((s) => s.uuid);
      const missingUuids = skillUuids.filter((uuid) => !foundUuids.includes(uuid));
      throw new BadRequestException(
        `Skills not found or inactive: ${missingUuids.join(', ')}`,
      );
    }

    return skills;
  }
}
