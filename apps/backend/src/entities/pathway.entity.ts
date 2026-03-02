import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { OrganizationEntity } from './organization.entity';
import { EventEntity } from './event.entity';
import { PathwayEventEntity } from './pathway-event.entity';
import { RecipientEntity } from './recipient.entity';
import { PathwayParticipantEntity } from './pathway-participant.entity';

@Table({
  tableName: 'pathway',
  underscored: true,
})
export class PathwayEntity extends BaseEntity {
  @Index({ name: 'IDX_PATHWAY_UUID', unique: true })
  declare uuid: string;

  @ForeignKey(() => OrganizationEntity)
  @Index({ name: 'IDX_PATHWAY_ORGANIZATION_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'organization_id',
  })
  declare organization_id: number;

  @BelongsTo(() => OrganizationEntity)
  declare organization: OrganizationEntity;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'banner_url',
  })
  declare banner_url: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'draft',
  })
  declare status: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  declare is_active: boolean;

  @BelongsToMany(() => EventEntity, () => PathwayEventEntity)
  declare events: EventEntity[];

  @BelongsToMany(() => RecipientEntity, () => PathwayParticipantEntity)
  declare participants: RecipientEntity[];
}
