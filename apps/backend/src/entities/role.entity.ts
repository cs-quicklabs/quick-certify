import { Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseNanoidEntity } from './base-nanoid.entity';

/**
 * Role Entity
 *
 * Represents a user role in the system (e.g., SUPER_ADMIN, ADMIN, USER).
 * Roles define user permissions and access levels.
 */
@Table({
  tableName: 'role',
  underscored: true,
})
export class RoleEntity extends BaseNanoidEntity {
  @Index({ name: 'IDX_ROLE_NAME', unique: true })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare role: string;
}
