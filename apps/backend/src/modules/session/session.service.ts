import { Injectable, Logger } from '@nestjs/common';
import { BasicCrudService } from '@/common/services';
import { SessionModel } from '@/models';

@Injectable()
export class SessionService extends BasicCrudService<SessionModel> {
  private readonly logger = new Logger(SessionService.name);

  constructor() {
    super(SessionModel);
  }
}
