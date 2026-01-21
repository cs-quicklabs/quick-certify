import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { DesignEntity } from "@src/entities";
import { FindAllOptions, PaginatedResult } from "@src/commons/base";

@Injectable()
export class DesignService {

  constructor(
    @InjectModel(DesignEntity)
    private readonly designModel: typeof DesignEntity
  ) { }


  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<DesignEntity>> {
    const { page = 1, limit = 10, sortBy = 'role', sortOrder = 'ASC', where = {} } = options;

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
  async findOne(id: string): Promise<DesignEntity | null> {
    return this.designModel.findByPk(id);
  }
  async create(data: Partial<DesignEntity>): Promise<DesignEntity> {
    return this.designModel.create(data);
  }

  async findByType(type: string): Promise<DesignEntity[]> {
    return this.designModel.findAll({ where: { type } });
  }

  async delete(id: string): Promise<number> {
    return this.designModel.destroy({ where: { id } });
  }

}
