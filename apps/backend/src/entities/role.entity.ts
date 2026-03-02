import { Column, DataType, HasMany, Index, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

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
export class RoleEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_ROLE_UUID', unique: true })
  declare uuid: string;

  @HasMany(() => UserEntity)
  declare users: UserEntity[];

  @Index({ name: 'IDX_ROLE_NAME', unique: true })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare role: string;
}
