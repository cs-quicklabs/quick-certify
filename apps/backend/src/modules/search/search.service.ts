import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Model, ModelStatic } from 'sequelize-typescript';
import { EventEntity, PathwayEntity, DesignEntity, UserEntity } from '@src/entities';
import { ISearchService, GlobalSearchResult, SearchResultItem, SearchCategory } from './interfaces';

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
      this.searchByName(this.eventModel, iLikeTerm, organizationId, limit, SearchCategory.EVENTS, {
        is_active: true,
      }),
      this.searchByName(
        this.pathwayModel,
        iLikeTerm,
        organizationId,
        limit,
        SearchCategory.PATHWAYS,
        { is_active: true },
      ),
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

  private async searchByName(
    model: ModelStatic<Model>,
    iLikeTerm: ILikeTerm,
    organizationId: number,
    limit: number,
    category: SearchCategory,
    extraWhere: WhereOptions = {},
  ): Promise<SearchResultItem[]> {
    const rows = await model.findAll({
      where: { organization_id: organizationId, name: iLikeTerm, ...extraWhere },
      attributes: ['uuid', 'name'],
      limit,
      order: [['created_at', 'DESC']],
    });

    return rows.map((row) => ({
      uuid: row.getDataValue('uuid'),
      name: row.getDataValue('name'),
      category,
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
