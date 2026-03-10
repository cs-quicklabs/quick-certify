import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { EventEntity, PathwayEntity, DesignEntity, UserEntity, RoleEntity } from '@src/entities';
import { ISearchService, GlobalSearchResult, SearchResultItem, SearchCategory } from './interfaces';
import { Role } from '@src/modules/role/enums';

type ILikeTerm = { [Op.iLike]: string };

@Injectable()
export class SearchService implements ISearchService {
  constructor(
    @InjectModel(EventEntity)
    private readonly eventModel: typeof EventEntity,
    @InjectModel(PathwayEntity)
    private readonly pathwayModel: typeof PathwayEntity,
    @InjectModel(DesignEntity)
    private readonly designModel: typeof DesignEntity,
    @InjectModel(UserEntity)
    private readonly userModel: typeof UserEntity,
  ) {}

  async search(query: string, organizationId: number, limit = 5): Promise<GlobalSearchResult> {
    const term = query.trim();
    const iLikeTerm: ILikeTerm = { [Op.iLike]: `%${term}%` };

    const [events, pathways, designs, teamMembers] = await Promise.all([
      this.searchEvents(iLikeTerm, organizationId, limit),
      this.searchPathways(iLikeTerm, organizationId, limit),
      this.searchDesigns(iLikeTerm, organizationId, limit),
      this.searchTeamMembers(iLikeTerm, organizationId, limit),
    ]);

    return {
      events,
      pathways,
      designs,
      team_members: teamMembers,
      total: events.length + pathways.length + designs.length + teamMembers.length,
    };
  }

  private async searchEvents(
    iLikeTerm: ILikeTerm,
    organizationId: number,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const rows = await this.eventModel.findAll({
      where: { organization_id: organizationId, name: iLikeTerm, is_active: true },
      attributes: ['uuid', 'name'],
      limit,
      order: [['created_at', 'DESC']],
    });

    return rows.map((row) => ({
      uuid: row.uuid,
      name: row.name,
      category: SearchCategory.EVENTS,
    }));
  }

  private async searchPathways(
    iLikeTerm: ILikeTerm,
    organizationId: number,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const rows = await this.pathwayModel.findAll({
      where: { organization_id: organizationId, name: iLikeTerm, is_active: true },
      attributes: ['uuid', 'name'],
      limit,
      order: [['created_at', 'DESC']],
    });

    return rows.map((row) => ({
      uuid: row.uuid,
      name: row.name,
      category: SearchCategory.PATHWAYS,
    }));
  }

  private async searchDesigns(
    iLikeTerm: ILikeTerm,
    organizationId: number,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const rows = await this.designModel.findAll({
      where: { organization_id: organizationId, name: iLikeTerm },
      attributes: ['uuid', 'name', 'type'],
      limit,
      order: [['created_at', 'DESC']],
    });

    return rows.map((row) => ({
      uuid: row.uuid,
      name: row.name,
      category: SearchCategory.DESIGNS,
      subtitle: row.type,
    }));
  }

  private async searchTeamMembers(
    iLikeTerm: ILikeTerm,
    organizationId: number,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const rows = await this.userModel.findAll({
      where: {
        organization_id: organizationId,
        status: 'active',
        deleted_at: null,
        [Op.or]: [{ first_name: iLikeTerm }, { last_name: iLikeTerm }, { email: iLikeTerm }],
      },
      include: [
        {
          model: RoleEntity,
          attributes: ['role'],
          where: { role: { [Op.ne]: Role.SYSTEM_ADMIN } },
        },
      ],
      attributes: ['uuid', 'first_name', 'last_name', 'email'],
      limit,
      order: [['first_name', 'ASC']],
    });

    return rows.map((row) => ({
      uuid: row.uuid,
      name: `${row.first_name} ${row.last_name || ''}`.trim(),
      category: SearchCategory.TEAM_MEMBERS,
      subtitle: row.email,
    }));
  }
}
