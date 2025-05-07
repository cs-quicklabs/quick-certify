import { Injectable } from '@nestjs/common';
import { BasicCrudService } from '@/common/services';
import { UserModel } from '@/models';

@Injectable()
export class UserService extends BasicCrudService<UserModel> {
  constructor() {
    super(UserModel);
  }

  async findByUUId(uuid: string) {
    return this.getOne({ where: { uuid } });
  }

  async findByEmail(email: string) {
    return this.getOne({ where: { email } });
  }
}
