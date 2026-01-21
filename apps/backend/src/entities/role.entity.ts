import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';

@Table({
  tableName: 'role',
})
export class RoleEntity extends BaseEntity {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare code: string;
}

