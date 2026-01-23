import {
  BeforeValidate,
  Column,
  CreatedAt,
  DataType,
  Model,
  UpdatedAt,
} from 'sequelize-typescript';
import { Sequelize } from 'sequelize';
import { generateNanoid } from '@src/commons/utils/nanoid.util';

/**
 * Base Entity
 *
 * Base class for all entities with:
 * - id: integer auto-increment primary key (used for foreign keys and relations)
 * - uuid: nanoid string (used for external API operations)
 * - createdAt, updatedAt: timestamps
 * All entities extending this will have these columns.
 */
export abstract class BaseEntity extends Model<Record<string, unknown>> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  // UUID column - each entity should add @Index decorator with table-specific name
  // Example: @Index({ name: 'IDX_USER_UUID', unique: true })
  @Column({
    type: DataType.STRING(21),
    allowNull: false,
    // unique: true removed - each entity should define its own index name
  })
  declare uuid: string;

  @BeforeValidate
  static generateUuid(instance: BaseEntity): void {
    if (!instance.uuid) {
      instance.uuid = generateNanoid();
    }
  }

  @CreatedAt
  @Column({
    field: 'created_at',
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('NOW()'),
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('NOW()'),
  })
  declare updatedAt: Date;

  override toJSON() {
    // Use Sequelize's native get() with plain option instead of class-transformer
    // This avoids issues with nested Model classes
    return this.get({ plain: true });
  }
}
