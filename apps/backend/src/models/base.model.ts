import { instanceToPlain } from 'class-transformer';
import {
  Column,
  DataType,
  Model,
  Table,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

/**
 * Base model class with common functionality and soft-delete support
 * All domain models should extend this class
 */
@Table({
  timestamps: true,
  underscored: true,
})
export abstract class BaseModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Primary key identifier',
  })
  id: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Record creation timestamp',
  })
  createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Record last update timestamp',
  })
  updatedAt: Date;

  /**
   * Converts model instance to a plain object using class-transformer
   * respecting @Exclude and @Expose decorators
   */
  toJSON() {
    return instanceToPlain(this);
  }
}

/**
 * Base model for mapping tables without soft delete support
 * To be used for models like RolePermissionModel and OrganizationUserModel
 */
@Table({
  paranoid: true, // Enable soft deletes
})
export abstract class BaseModelWithSoftDelete extends BaseModel {
  @DeletedAt
  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Soft delete timestamp',
  })
  deletedAt: Date;
}
