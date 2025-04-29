import { Injectable } from '@nestjs/common';
import { BasicCrudService } from '@/common/services/basic-crud.service';
import { RoleModel } from '@/models/role.model';

@Injectable()
export class RoleService extends BasicCrudService<RoleModel> {
  constructor() {
    super(RoleModel);
  }

  async findByCode(code: string) {
    return this.getOne({ where: { code } });
  }
}
