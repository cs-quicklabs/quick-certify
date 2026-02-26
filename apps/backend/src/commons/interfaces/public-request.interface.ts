import { Request } from 'express';
import { OrganizationEntity } from '@src/entities/organization.entity';

export interface PublicRequest extends Request {
  organization: OrganizationEntity;
}
