import { BelongsTo, Column, DataType, ForeignKey, Index, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { OrganizationEntity } from './organization.entity';
import { RecipientEntity } from './recipient.entity';
import { EventEntity } from './event.entity';
import { CredentialStatusEnum } from '@src/commons/enums';

@Table({
  tableName: 'credential',
  underscored: true,
})
export class CredentialEntity extends BaseEntity {
  @Index({ name: 'IDX_CREDENTIAL_UUID', unique: true })
  declare uuid: string;

  @ForeignKey(() => OrganizationEntity)
  @Index({ name: 'IDX_CREDENTIAL_ORGANIZATION_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'organization_id',
  })
  declare organization_id: number;

  @BelongsTo(() => OrganizationEntity)
  declare organization: OrganizationEntity;

  @ForeignKey(() => RecipientEntity)
  @Index({ name: 'IDX_CREDENTIAL_RECIPIENT_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'recipient_id',
  })
  declare recipient_id: number;

  @BelongsTo(() => RecipientEntity)
  declare recipient: RecipientEntity;

  @ForeignKey(() => EventEntity)
  @Index({ name: 'IDX_CREDENTIAL_EVENT_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'event_id',
  })
  declare event_id: number;

  @BelongsTo(() => EventEntity)
  declare event: EventEntity;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    field: 'issued_date',
  })
  declare issued_date: string | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    field: 'expiration_date',
  })
  declare expiration_date: string | null;

  @Column({
    type: DataType.STRING(2048),
    allowNull: true,
    field: 'certificate_url',
  })
  declare certificate_url: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: CredentialStatusEnum.DRAFT,
  })
  declare status: CredentialStatusEnum;
}
