import { Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseNanoidEntity } from './base-nanoid.entity';

@Table({
  tableName: 'role',
})
export class RoleEntity extends BaseNanoidEntity {
  @Index({ name: 'IDX_ROLE_NAME', unique: true })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare role: string;
}
