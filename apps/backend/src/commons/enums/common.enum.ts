export enum UserTypeEnum {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  DESIGNER = 'DESIGNER',
}

export enum CredentialStatusEnum {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  ISSUED = 'ISSUED',
  FAILED = 'FAILED',
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

export enum BatchStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  PARTIAL_FAILURE = 'PARTIAL_FAILURE',
  FAILED = 'FAILED',
}
