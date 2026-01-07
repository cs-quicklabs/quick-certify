import { Column, DataType, IsUUID, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { Sequelize } from 'sequelize';

@Table({
  tableName: 'organization',
})
export class OrganizationEntity extends BaseEntity {
  @IsUUID(4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: Sequelize.literal('gen_random_uuid()'),
  })
  declare uuid: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare image: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare address: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare website: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare deleted_at: Date | null;
}
