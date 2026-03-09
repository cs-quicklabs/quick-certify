import type { Request } from 'express';
import type { CurrentUser } from '@src/modules/auth/interfaces';

export interface AuditableRequest extends Request {
  user?: CurrentUser;
  id?: string;
}
