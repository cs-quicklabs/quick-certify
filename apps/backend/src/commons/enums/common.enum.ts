export { CredentialStatusEnum, BatchStatusEnum } from '@certify/certificate-core';

export enum UserTypeEnum {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  DESIGNER = 'DESIGNER',
}

export enum PathwayStatusEnum {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum PathwayParticipantStatusEnum {
  INVITED = 'invited',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}
