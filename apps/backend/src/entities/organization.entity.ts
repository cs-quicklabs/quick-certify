import { Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseNanoidEntity } from './base-nanoid.entity';

@Table({
  tableName: 'organization',
})
export class OrganizationEntity extends BaseNanoidEntity {
  @Index({ name: 'IDX_ORGANIZATION_NAME', unique: true })
  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare name: string;

  @Index({ name: 'IDX_ORGANIZATION_SLUG', unique: true })
  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare slug: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare is_active: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare issuer_verified: boolean;
}
