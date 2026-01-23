import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from 'sequelize'
import { DesignEntity } from "@src/entities";
import { FindAllOptions, PaginatedResult } from "@src/commons/base";
import { UpdateDesignDto } from "./dtos/update-design.dto";
import { CreateDesignDto } from "./dtos/create-design.dto";
import { capitalizeFirst } from "@src/commons/utils";
@Injectable()
export class DesignService {

  constructor(
    @InjectModel(DesignEntity)
    private readonly designModel: typeof DesignEntity,

  ) { }


  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<DesignEntity>> {
    const { page = 1, limit = 10, sortBy = 'type', sortOrder = 'ASC', where = {} } = options;

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await this.designModel.findAndCountAll({
      where,
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

  async searchDesigns(
    searchQuery: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<DesignEntity>> {
    const searchCondition = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchQuery}%` } },
        { type: { [Op.iLike]: `%${searchQuery}%` } },
      ],
    };

    return this.findAll({
      ...options,
      where: {
        ...options.where,
        ...searchCondition,
      },
    });
  }

  async findOne(id: string): Promise<DesignEntity> {
    const design = await this.designModel.findByPk(id);
    if (!design) {
      throw new NotFoundException(`Design with id ${id} not found`);
    }
    return design;
  }

  async create(dto: CreateDesignDto): Promise<DesignEntity> {
    // check if we need origanization verification
    const design = await this.designModel.create({
      name: capitalizeFirst(dto.name),
      type: dto.designType,
      url: dto.designUrl
    })
    return design;
  }

  async update(designId: string, dto: UpdateDesignDto): Promise<DesignEntity> {
    const design = await this.findOne(designId);
    const updateData: Partial<DesignEntity> = {};
    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }
    if (dto.designUrl !== undefined && dto.designUrl !== '') {
      updateData.url = dto.designUrl;
    }
    if (dto.designType !== undefined) {
      updateData.type = dto.designType;
    }
    await design.update(updateData);
    return design;
  }


  async findByType(type: string): Promise<DesignEntity[]> {
    return this.designModel.findAll({ where: { type } });
  }

  async delete(id: string): Promise<number> {
    return this.designModel.destroy({ where: { id } });
  }

}
